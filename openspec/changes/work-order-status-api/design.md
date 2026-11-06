# Design

## Context

Proyecto nuevo, sin código previo. Se ejecuta en local (Node.js 24, npm 11). Los datos son simulados y viven en memoria; PostgreSQL con TypeORM se documenta pero no se conecta. El frontend se diseña por separado y consume este contrato. Ver proposal.md para la motivación.

## Goals / Non-Goals

**Goals:**
- Que la regla de transiciones sea una función pura, testeable sin levantar el servidor.
- Que cambiar la persistencia en memoria por TypeORM no obligue a tocar la lógica ni las rutas.
- Que los puntos de seguridad (token, datos personales, límites de uso) queden demostrables en la defensa.

**Non-Goals:**
- Escalabilidad, alta disponibilidad, despliegue, migraciones reales y gestión de usuarios.

## Decisions

**1. Capas separadas, con la regla de negocio en el dominio.**
`domain/` (tipos y máquina de estados, sin dependencias), `repositories/` (interfaz y versión en memoria), `services/` (casos de uso), `http/` (rutas, middlewares, validación). Las rutas solo traducen HTTP a llamadas al servicio. Alternativa descartada: lógica directamente en los handlers, más corta pero imposible de probar en aislado y contraria a la separación de capas.

**2. Máquina de estados como mapa `estado -> estados permitidos`.**
Una constante tipada y dos funciones puras (`canTransition`, `allowedNext`). Alternativa: librería de máquinas de estado; es demasiado para ocho estados.

**3. Repositorio detrás de una interfaz.**
`OrderRepository` con `list`, `findById`, `findByCode` y `save`. La versión en memoria usa un `Map`. La versión futura usaría TypeORM con las entidades `WorkOrder` (con índice único en `code` e índice en `status`) y `StatusChange` (relación muchos a uno, con índice en `orderId`). El historial se pagina cuando crezca. Las consultas de lista se paginarían desde el sistema completo; en la PoC la lista es pequeña y fija, y queda anotado como pendiente.

**4. Validación de entrada con Zod en el servidor.**
Esquemas para el login y el cambio de estado. Zod también permite derivar el tipo `OrderStatus` de una sola definición. Alternativas: validación manual (propensa a omisiones) o class-validator (pensado para NestJS).

**5. Autenticación de demostración con JWT firmado.**
`jsonwebtoken` con HS256, expiración corta (8 horas) y secreto leído de `JWT_SECRET`. El servidor no arranca si falta el secreto, así no existe un valor por defecto inseguro. La contraseña del usuario de demostración se compara con `scrypt` y `timingSafeEqual` de `node:crypto`, sin dependencias extra. Las credenciales de demo salen de variables de entorno y se documentan en `.env.example`; el archivo `.env` real no se versiona. Alternativa: sesiones con cookie; descartada porque el frontend es una SPA separada y el contrato ya define `Authorization: Bearer`.

**6. Endurecimiento básico.**
`helmet` para cabeceras, `cors` con origen permitido tomado de `CORS_ORIGIN`, `express-rate-limit` en login y seguimiento, y límite de tamaño del body. Un manejador de errores central devuelve mensajes genéricos y registra el detalle solo en el servidor, sin datos personales, tokens ni contraseñas.

**7. Código de seguimiento no secuencial.**
Los códigos de la PoC tienen la forma `TR-1042` para facilitar la demostración. Un código secuencial es adivinable; por eso existe el límite de uso y se anota para el sistema completo usar un identificador aleatorio más largo.

**8. Pruebas.**
Jest para el dominio y los servicios, Supertest para los endpoints contra la app sin escuchar en un puerto. La app se exporta desde una función `createApp(deps)` para inyectar un repositorio limpio en cada prueba. `src/server.ts` solo llama a `listen`.

## Risks / Trade-offs

- [Combinación de versiones recientes de TypeScript, ts-jest, Jest y ESLint con compatibilidad incierta] → Resuelto al instalar: la última estable de TypeScript es 7.0.2, pero `ts-jest` exige `<7` y `typescript-eslint` exige `<6.1.0`; se usa TypeScript 6.0.3, la más alta compatible con todo el toolchain. Revisar cuando esos paquetes soporten la 7.
- [Los datos en memoria se pierden al reiniciar] → Es esperado en una PoC; el README lo declara y el seed se reconstruye en cada arranque.
- [El token no se puede revocar antes de que expire] → Aceptado en la PoC; en producción se usarían tokens de vida corta con refresco o sesiones en base de datos.
- [Las actualizaciones concurrentes de la misma orden pueden pisarse: el repositorio es asíncrono, así que dos `PATCH` simultáneos pueden intercalarse entre la lectura y la escritura] → El servicio serializa los cambios por orden con una cola por id (un test lo verifica). Solo vale para un único proceso; con PostgreSQL se usaría una transacción con control de versión (bloqueo optimista) sobre la orden.
- [El límite de uso es por proceso, no compartido] → Suficiente para la demo; en producción se apoya en el proveedor o en un almacén compartido.

## Migration Plan

No aplica: proyecto nuevo, sin despliegue. Para pasar a producción faltaría: base de datos real, usuarios y contraseñas con hash, alta y edición de órdenes, paginación, registro de repuestos, notificaciones, despliegue con HTTPS y copias de seguridad.

## Open Questions

- Mensaje final de los textos de error (se redactan al implementar, sin afectar el contrato).
