# Tasks

## 1. Setup del proyecto

- [x] 1.1 Inicializar npm, instalar dependencias en sus últimas versiones estables verificadas con `npm view` y configurar `tsconfig` estricto, scripts (`dev`, `build`, `start`, `test`, `lint`, `typecheck`) y `.gitignore`. Verificación: `npm run typecheck` y `npm run lint` pasan sobre un archivo mínimo.
- [x] 1.2 Crear `.env.example` con `PORT`, `JWT_SECRET`, `CORS_ORIGIN`, `DEMO_USER` y `DEMO_PASSWORD`, sin tocar ningún `.env` real. Verificación: el archivo existe y no contiene secretos reales.

## 2. Dominio y máquina de estados (work-order-status)

- [x] 2.1 Definir tipos (`OrderStatus`, `WorkOrder`, `StatusChange`) y el mapa de transiciones con `canTransition` y `allowedNext`. Verificación: tests Jest que cubren los escenarios de transición válida, que salta el proceso, estado final y mismo estado; los 8 estados y todas las transiciones de la tabla.
- [x] 2.2 Definir la interfaz `OrderRepository` y la versión en memoria con datos de ejemplo (órdenes en distintos estados, códigos `TR-xxxx`). Verificación: tests del repositorio (`findByCode` ignora mayúsculas, `save` persiste).
- [x] 2.3 Implementar el servicio de órdenes (`list`, `getById`, `changeStatus`) que valida la transición, agrega el historial y actualiza `updatedAt`. Verificación: tests Jest de `changeStatus` con éxito, transición inválida (la orden no cambia), orden inexistente.

## 3. Autenticación (staff-auth)

- [x] 3.1 Implementar el servicio de login (comparación con `scrypt` y `timingSafeEqual`, firma y verificación del token) y fallar al arrancar si falta `JWT_SECRET`. Verificación: tests Jest de credenciales correctas, incorrectas, token manipulado y expirado.
- [x] 3.2 Implementar el middleware que exige `Authorization: Bearer` y el manejador central de errores con respuestas genéricas. Verificación: tests Supertest de ausencia de token, token inválido, y ausencia de trazas en el cuerpo del error.

## 4. API HTTP

- [x] 4.1 Armar `createApp` con `helmet`, `cors`, límite de tamaño y esquemas Zod, y `POST /api/auth/login`. Verificación: Supertest del login con 200, 401 y 400.
- [x] 4.2 Implementar `GET /api/orders`, `GET /api/orders/:id` y `PATCH /api/orders/:id/status`. Verificación: Supertest con 200, 401 sin token, 404, 400 y 422 (con `allowed`), y el caso de cambio exitoso con historial actualizado.
- [x] 4.3 Implementar `GET /api/tracking/:code` con enmascarado de patente y sin datos personales, más el límite de uso en tracking y login. Verificación: Supertest de código válido, inexistente, mayúsculas, ausencia de `customerName`, `customerPhone`, `plate` e `id`, y respuesta 429 al superar el límite.
- [x] 4.4 Crear `src/server.ts` que lea la configuración y escuche en el puerto. Verificación: `npm run dev` levanta el servidor y responde a las rutas con `curl`.

## 5. Verificación y documentación

- [x] 5.1 Escribir el README: cómo instalar y ejecutar, usuario de demo, descripción de cada endpoint con ejemplo de petición y respuesta, declaración de que los datos son simulados en memoria, explicación de la persistencia con PostgreSQL y TypeORM (entidades e índices) y lista de lo que falta para pasar a producción. Verificación: seguir el README desde cero en una carpeta limpia y ejecutar un cambio de estado con `curl`.
- [x] 5.2 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `openspec validate work-order-status-api`. Verificación: los cuatro terminan sin errores.
- [x] 5.3 Revisar con `/code-review` lo implementado. Verificación: sin hallazgos de severidad alta sin resolver.

## Workflow follow-up

- Archivar el change con `openspec archive work-order-status-api` una vez aprobado y verificado.
