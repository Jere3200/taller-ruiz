# Taller Ruiz: API de la PoC

Prueba de Concepto del Segundo Parcial Integrador (Construcción de Sitios Web II, Grupo 2). API REST con **Node.js, TypeScript y Express** para consultar órdenes de trabajo de un taller mecánico y cambiar su estado respetando el proceso de reparación.

> **Datos simulados en memoria.** No hay base de datos real: las órdenes y el usuario de demostración se crean al arrancar y se pierden al reiniciar. La autenticación es de demostración. Ver [Qué falta para producción](#qué-falta-para-producción).

La especificación (fuente de verdad) está en [`../openspec/changes/work-order-status-api/`](../openspec/changes/work-order-status-api/).

## Requisitos

- Node.js 24 o superior (usa `--env-file` y `structuredClone`).
- npm.

## Cómo ejecutarla

```bash
cd api
npm install
cp .env.example .env
```

Editar `.env` y completar:

- `JWT_SECRET`: mínimo 32 caracteres. Para generar uno: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `DEMO_PASSWORD`: mínimo 8 caracteres. Es la contraseña del usuario de demostración (`DEMO_USER`, por defecto `daniel`).

El servidor **no arranca** si falta `JWT_SECRET` o es corto. Después:

```bash
npm run dev
```

Escucha en `http://localhost:4000`. Para producir el build: `npm run build` y `npm start`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor con recarga automática |
| `npm test` | Tests con Jest y Supertest |
| `npm run typecheck` | Verificación de tipos |
| `npm run lint` | ESLint |

## Estados y transiciones

Los valores van en inglés en la API; las etiquetas en español se resuelven en el frontend.

| Estado | Etiqueta | Puede pasar a |
|---|---|---|
| `received` | Recibido | `diagnosing`, `cancelled` |
| `diagnosing` | En diagnóstico | `awaiting_approval`, `cancelled` |
| `awaiting_approval` | Esperando aprobación | `repairing`, `cancelled` |
| `repairing` | En reparación | `waiting_parts`, `ready_for_pickup`, `cancelled` |
| `waiting_parts` | Esperando repuestos | `repairing`, `cancelled` |
| `ready_for_pickup` | Listo para retirar | `delivered` |
| `delivered` | Entregado | final |
| `cancelled` | Cancelado | final |

La regla vive en [`src/domain/status.ts`](src/domain/status.ts) como una función pura.

## Endpoints

Todos devuelven JSON. Los errores tienen la forma `{ "error": "CODIGO", "message": "..." }`.

### `POST /api/auth/login`

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"daniel","password":"<DEMO_PASSWORD>"}'
```

`200`: `{ "token": "...", "user": { "id": "u-1", "name": "Daniel Ruiz", "role": "employee" } }`.
`400` si faltan campos. `401` `INVALID_CREDENTIALS` si el usuario o la contraseña no coinciden (mismo mensaje en ambos casos). `429` si se superan 10 intentos en 15 minutos.

### Rutas internas (requieren `Authorization: Bearer <token>`)

Sin token o con token inválido o vencido responden `401` `UNAUTHORIZED`.

**`GET /api/orders`** lista las órdenes: `[{ id, code, customerName, vehicle, status, updatedAt }]`.

**`GET /api/orders/:id`** devuelve el detalle. El primer elemento de `history` es siempre el ingreso (`from: null`, `to: "received"`):

```json
{
  "id": "wo-001", "code": "TR-1042", "customerName": "Marcelo Paredes", "customerPhone": "351-555-0101",
  "vehicle": { "brand": "Ford", "model": "Fiesta", "plate": "AB123CD" },
  "status": "diagnosing", "updatedAt": "2026-11-06T20:50:47.384Z",
  "history": [
    { "from": null, "to": "received", "changedAt": "2026-11-06T17:50:47.384Z" },
    { "from": "received", "to": "diagnosing", "changedAt": "2026-11-06T20:50:47.384Z" }
  ],
  "allowedNextStatuses": ["awaiting_approval", "cancelled"]
}
```

`404` `ORDER_NOT_FOUND` si no existe.

**`PATCH /api/orders/:id/status`**

```bash
curl -X PATCH http://localhost:4000/api/orders/wo-001/status \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"status":"awaiting_approval"}'
```

- `200`: la orden actualizada (mismo formato que el detalle), con una entrada nueva en `history`.
- `422` `INVALID_TRANSITION`: la transición no está permitida. Incluye `allowed` con los estados válidos y **no modifica la orden**:

  ```json
  { "error": "INVALID_TRANSITION", "message": "El cambio de estado no es válido para el estado actual de la orden.", "allowed": ["awaiting_approval", "cancelled"] }
  ```

- `400` `VALIDATION_ERROR`: falta `status` o no es uno de los ocho valores.
- `404` `ORDER_NOT_FOUND`.

### `GET /api/tracking/:code` (pública)

Consulta del cliente por código (no distingue mayúsculas). **No devuelve** nombre, teléfono, patente completa ni el id interno.

```bash
curl http://localhost:4000/api/tracking/TR-1042
```

```json
{
  "code": "TR-1042",
  "vehicle": { "brand": "Ford", "model": "Fiesta", "plateMasked": "***3CD" },
  "status": "diagnosing",
  "updatedAt": "2026-11-06T20:50:47.384Z",
  "history": [
    { "from": null, "to": "received", "changedAt": "2026-11-06T17:50:47.384Z" },
    { "from": "received", "to": "diagnosing", "changedAt": "2026-11-06T20:50:47.384Z" }
  ]
}
```

`404` `ORDER_NOT_FOUND`, `400` si el código tiene caracteres inválidos, `429` si se superan 60 consultas en 15 minutos.

## Datos de demostración

Ocho órdenes en todos los estados, con códigos `TR-1042` a `TR-1049`. Por ejemplo: `TR-1042` (en diagnóstico), `TR-1043` (en reparación), `TR-1045` (listo para retirar), `TR-1048` (entregado), `TR-1049` (cancelado). Ver [`src/data/seed.ts`](src/data/seed.ts).

## Seguridad aplicada en la PoC

- Token JWT firmado (HS256, 8 horas); el algoritmo se fija al verificar (rechaza tokens sin firma).
- Contraseña comparada con `scrypt` y `timingSafeEqual`; mismo tiempo y mismo mensaje si el usuario no existe.
- Sin secretos en el código: todo sale de variables de entorno, y `.env` está en `.gitignore`.
- `helmet`, CORS limitado a `CORS_ORIGIN`, cuerpo máximo de 10 KB, límite de intentos en login y seguimiento.
- Respuesta pública con lista blanca explícita de campos ([`src/services/views.ts`](src/services/views.ts)).
- Errores genéricos hacia el cliente; el detalle solo va al log del servidor.
- Detrás de un proxy o balanceador hay que configurar `trust proxy` para que el límite de intentos use la IP real.

## Persistencia con PostgreSQL y TypeORM (cómo se implementaría)

El acceso a datos está detrás de la interfaz [`OrderRepository`](src/repositories/orderRepository.ts). Hoy la implementa un `Map` en memoria; en el sistema completo se agregaría una implementación con TypeORM y no cambiarían ni el servicio ni las rutas.

**Entidades:**

- `WorkOrder`: `id` (uuid), `code` (único, con índice), `customerName`, `customerPhone`, `vehicleBrand`, `vehicleModel`, `plate`, `status` (con índice, porque el tablero filtra por estado), `updatedAt` (con índice, para ordenar), `version` (control de concurrencia).
- `StatusChange`: `id`, `orderId` (relación muchos a uno, con índice), `from`, `to`, `changedAt`.

**Consideraciones:**

- `changeStatus` se ejecutaría en una **transacción** con bloqueo optimista (`version`), en lugar de la cola por orden en memoria.
- El listado se **paginaría** (hoy son 8 órdenes fijas).
- Migraciones con TypeORM, usuario de base con permisos mínimos y credenciales por variable de entorno.
- Los clientes en la base se tratarían como datos personales: copias de seguridad cifradas y acceso restringido.

## Qué falta para producción

- Base de datos real, migraciones y copias de seguridad.
- Usuarios en la base, contraseñas con hash y política de cambio, roles, revocación de tokens, 2FA opcional.
- Alta, edición y baja de órdenes; registro de repuestos; notificaciones al cliente (WhatsApp o email).
- Códigos de seguimiento no secuenciales (hoy `TR-1042` es adivinable; el límite de intentos solo lo mitiga).
- Paginación, logs estructurados, monitoreo y alertas.
- Despliegue con HTTPS, dominio y variables de entorno gestionadas por el proveedor.
- Límite de intentos compartido entre instancias (hoy es por proceso).

## Notas de versiones

TypeScript está en **6.0.3**, no en la 7.0.2 (última estable al momento de escribir esto): `ts-jest` exige `<7` y `typescript-eslint` exige `<6.1.0`. Revisar cuando esos paquetes soporten la 7. Jest y Supertest son los que pide la consigna del parcial.
