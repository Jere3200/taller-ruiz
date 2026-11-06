# Tasks

## 1. Base del proyecto

- [x] 1.1 Crear `web/` con Next.js 16, TypeScript estricto y Tailwind; configurar `NEXT_PUBLIC_API_URL`. Verificación: `npm run build` y `npm run typecheck` pasan.
- [x] 1.2 Copiar el logo sin el bloque de metadatos a `web/public/` y definir el tema (colores, tipografías). Verificación: el SVG pesa menos de 30 KB y se ve en el header.
- [x] 1.3 Módulo de cliente HTTP con token y manejo de `401`, tipos del contrato y `lib/status.ts`. Verificación: tests unitarios del cliente (agrega el header, limpia la sesión en 401, mapea errores) y de `status.ts`.

## 2. Sitio público

- [x] 2.1 Landing en `/` con header, hero con campo de código, servicios, cómo funciona, contacto y footer. Verificación: se ve en 360 px y 1280 px sin scroll horizontal.
- [x] 2.2 Página `/seguimiento` (Server Component) con código inválido, inexistente, cancelado, vacío, 429 y API caída. Verificación: tests de la lógica de presentación y prueba manual en el navegador contra la API real.

## 3. Zona interna

- [x] 3.1 Contexto de sesión, `/login` y guardia de `/panel`. Verificación: tests de la validación del formulario y prueba manual en el navegador de la redirección sin sesión, el login (vacío, incorrecto y correcto), la sesión vencida y el cierre de sesión.
- [x] 3.2 Tablero en `/panel` con resumen, búsqueda, filtro y vistas de columnas y tabla. Verificación: tests de la búsqueda y del conteo; prueba manual.
- [x] 3.3 Detalle en `/panel/ordenes/[id]` con línea de tiempo, botones de `allowedNextStatuses`, confirmación, avisos y copia del link. Verificación: prueba manual del cambio válido, de la confirmación al cancelar y de la orden finalizada; el 422 se forzó contra la API y el texto del aviso tiene tests. La copia al portapapeles solo se verificó en su camino de error: el navegador integrado bloquea el permiso.

## 4. Cierre

- [x] 4.1 README de `web/` con cómo ejecutar junto con la API y las decisiones de seguridad. Verificación: comandos y rutas comprobados contra una ejecución real. No se siguió desde una carpeta limpia.
- [x] 4.2 Ejecutar typecheck, lint, tests y build, y recorrer el flujo completo en el navegador. Verificación: typecheck, lint, 66 tests y build en verde, y flujo recorrido en el navegador (landing, seguimiento con código válido, inexistente, cancelado y API caída, login, panel, detalle y cierre de sesión). Sin tests end to end automatizados.
