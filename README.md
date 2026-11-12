# taller-ruiz

Prueba de concepto de **Taller Ruiz**, un sistema de gestión de reparaciones para un taller mecánico. Es el Segundo Parcial Integrador de Construcción de Sitios Web II (IRESM Nivel Superior, 2026), Grupo 2.

Los clientes consultan el estado de su vehículo con un código de seguimiento, y los empleados del taller ven las órdenes y hacen avanzar su estado respetando el proceso de reparación.

> Los datos son de ejemplo y se guardan en memoria. Los datos de contacto, las estadísticas y los testimonios de la landing son ficticios.

## Qué hay en cada carpeta

| Carpeta | Contenido |
|---|---|
| [`api/`](api/README.md) | API con Node.js, TypeScript y Express: órdenes, transiciones de estado válidas, login de empleados y seguimiento público |
| [`web/`](web/README.md) | Front con Next.js: landing, seguimiento, login, panel y detalle de la orden |
| [`openspec/`](openspec/) | Especificaciones, diseño y tareas de cada cambio, escritas antes del código |
| `Taller Ruiz.html` | Diseño de la interfaz exportado de Claude Design |
| [`docs/ux/`](docs/ux/README.md) | UX/UI: persona, user flow, wireframe y justificación, también en [Figma](https://www.figma.com/design/FUW1FnMtCgUGFZMrJsvhKE) |

## Demo rápida (local)

En Windows, doble clic en **`Iniciar demo.cmd`**. En cualquier sistema: `node scripts/demo.mjs`. Solo hace falta Node.js 24 o superior.

El script instala las dependencias si faltan, levanta la API (puerto 4000) y el front (puerto 3000), comprueba que un salto inválido de estado responda 422 y abre el seguimiento de la orden TR-1042 en el navegador. En la ventana muestra el usuario y una contraseña generada para esa sesión, y la petición lista para Postman con su token. No usa `.env`: el secreto y la contraseña cambian en cada arranque. Para cerrar, `Ctrl + C` o cerrar la ventana; al volver a abrir, las órdenes vuelven al estado inicial.

## Cómo ejecutarlo

Hacen falta dos procesos, la API en el puerto 4000 y el front en el 3000. Las instrucciones completas, con las variables de entorno, están en [`api/README.md`](api/README.md) y [`web/README.md`](web/README.md).

```bash
cd api && npm install && cp .env.example .env && npm run dev
cd web && npm install && npm run dev
```

Antes de arrancar la API hay que completar `JWT_SECRET` y `DEMO_PASSWORD` en `api/.env`.

## Calidad

Cada aplicación tiene sus tests (`npm test`), typecheck (`npm run typecheck`) y lint (`npm run lint`).
