# Taller Ruiz: front web

Sitio público y panel interno del Taller Ruiz (Segundo Parcial Integrador, Grupo 2). Next.js 16 (App Router), React 19 y Tailwind 4. Consume la API de [`../api`](../api/README.md).

La especificación está en [`../openspec/changes/web-frontend/`](../openspec/changes/web-frontend/). El diseño visual sale de Claude Design (archivo `Taller Ruiz.html` en la raíz del proyecto).

> **Datos de ejemplo.** La dirección, el teléfono, el WhatsApp, el email, las estadísticas de la landing ("27 años", "+3.800 reparaciones", "4,9/5") y los testimonios son ficticios. No son datos de un taller real.

## Cómo ejecutarlo

Hacen falta dos procesos: la API y el front.

**1. API** (ver [`../api/README.md`](../api/README.md) para completar el `.env`):

```bash
cd api
npm install
cp .env.example .env
npm run dev
```

Escucha en `http://localhost:4000`.

**2. Front**:

```bash
cd web
npm install
npm run dev
```

Abre en `http://localhost:3000`. Las fechas se muestran siempre en hora de Buenos Aires, sin importar la zona del servidor. Si la API está en otra dirección, copiar `.env.example` a `.env.local` y cambiar `NEXT_PUBLIC_API_URL`. La API tiene que tener `CORS_ORIGIN` apuntando al origen del front.

Para probar el seguimiento público, usar un código de los datos de ejemplo de la API, por ejemplo `TR-1042` a `TR-1049`. El usuario del panel es el `DEMO_USER` del `.env` de la API, con la contraseña `DEMO_PASSWORD`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm test` | Tests con Vitest |
| `npm run typecheck` | Verificación de tipos |
| `npm run lint` | ESLint |

## Rutas

| Ruta | Quién | Qué muestra |
|---|---|---|
| `/` | Público | Landing del taller |
| `/seguimiento?codigo=TR-1042` | Público | Estado de la reparación, progreso e historial. Sin datos personales |
| `/login` | Empleados | Ingreso al panel |
| `/panel` | Empleados | Resumen y tablero de órdenes, en columnas o tabla |
| `/panel/ordenes/:id` | Empleados | Detalle, historial y cambio de estado |

## Decisiones técnicas

- **La API decide las transiciones.** El front solo ofrece los estados de `allowedNextStatuses` y muestra lo que la API devuelve; no calcula reglas ni actualiza de forma optimista.
- **Seguimiento en el servidor.** `/seguimiento` es un Server Component: el formulario es un `GET` común y funciona sin JavaScript. Con Cache Components, lo que lee `searchParams` o hace `fetch` va dentro de `<Suspense>`.
- **Panel en el cliente.** El token vive en `sessionStorage` (por pestaña), que el servidor no puede leer, así que el panel carga sus datos desde el navegador. Un solo cliente HTTP ([`src/lib/api.ts`](src/lib/api.ts)) agrega el token y maneja el `401`: borra la sesión y manda a `/login` con "Tu sesión expiró. Ingresá de nuevo.".
- **Trade-off de seguridad.** Un XSS podría leer el token de `sessionStorage`. Para el sistema completo, la alternativa más segura es guardar el token en una cookie `httpOnly` mediante un intermediario en Next, que además permitiría cargar los datos del panel en el servidor.
- **Lógica fuera de las páginas.** Estados, progreso, búsqueda, formato de fechas, mensajes de error y validación del login viven en `src/lib/` y tienen tests. Los componentes solo los usan.
- **Estados en un solo lugar.** [`src/lib/status.ts`](src/lib/status.ts) define etiquetas, colores y etapas. El color nunca es la única señal: siempre va la etiqueta.

## Qué falta para producción

- Cookie `httpOnly` en lugar de `sessionStorage` (ver arriba).
- Tests end to end con Playwright de los flujos críticos (login, cambio de estado, seguimiento). Hoy solo se probaron a mano.
- Datos reales del taller, dominio propio y HTTPS.
- Límite por visitante del seguimiento: con `TRUSTED_PROXY_HOPS=1` (o más, según cuántos proxies de confianza haya delante de Next) el front reenvía la IP que agregó su proxy, contada desde la derecha de `X-Forwarded-For`, y la API la usa cuando tiene `TRUST_PROXY=1`. Con 0 (por defecto) se ignora el encabezado y todos los visitantes comparten el cupo de la IP del servidor de Next. Falta autenticar ese salto de Next a la API, por ejemplo con un secreto compartido, y asegurar que la API no sea accesible directamente.
- Códigos de seguimiento aleatorios (hoy `TR-1042` es secuencial y adivinable) y paginación del tablero.
