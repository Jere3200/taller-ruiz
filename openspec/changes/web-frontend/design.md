# Design

## Context

Next.js 16 con App Router, React 19 y Tailwind 4 en `web/`. Consume la API de `api/` (puerto 4000) según las specs de `work-order-status-api`. Ver proposal.md para la motivación.

## Goals / Non-Goals

**Goals:**
- Server Components por defecto; `"use client"` solo donde hay estado, efectos o APIs del navegador.
- Un único módulo de cliente HTTP que agrega el token y maneja el `401`.
- Que lo visual (colores, textos de estado) esté en un solo lugar.

**Non-Goals:**
- Tests end to end, internacionalización, modo oscuro y optimización de imágenes.

## Decisions

**1. Seguimiento público renderizado en el servidor.**
`/seguimiento` es un Server Component que lee `searchParams` y consulta la API. Funciona sin JavaScript en el navegador y el formulario es un `GET` común. Alternativa: componente cliente con `fetch`; descartada porque agrega estado sin necesidad.

**2. Sesión en `sessionStorage` y panel como componentes cliente.**
El contrato de la API usa `Authorization: Bearer`. El token se guarda por pestaña, como se acordó. Trade-off a declarar: cualquier XSS podría leerlo, a diferencia de una cookie `httpOnly`. La alternativa más segura (rutas de Next que guardan el token en una cookie `httpOnly` y reenvían a la API) queda anotada como mejora para el sistema completo, porque obligaría a que el panel pase por un intermediario y complica la PoC.

**3. Fuente única de verdad para estados.**
`lib/status.ts` define etiquetas, color, etapas del progreso y qué estados piden confirmación. Los valores vienen de la API en inglés. El front no calcula transiciones: usa `allowedNextStatuses` y la API decide.

**4. Sin actualización optimista.**
Tras un `PATCH` se muestra la orden que devuelve la API. Si la API rechaza, no hay nada que revertir.

**5. Sin librería de estado ni de formularios.**
Estado local y un contexto para la sesión. La interfaz tiene pocas pantallas; una librería sería una abstracción sin caso real todavía.

## Risks / Trade-offs

- [Token legible por JavaScript] → Aceptado en la PoC y documentado; se mitiga con CSP de Next y sin contenido de terceros.
- [Sin el diseño de Claude Design] → Se construye desde el prompt y el logo; los colores y textos viven en un solo lugar para ajustarlos rápido.
- [Datos de contacto de la landing son ficticios] → Marcados como ejemplo en el código y en el README.
- [El `429` del seguimiento se aplica por IP del servidor de Next, no del visitante] → Con un proxy real hay que reenviar la IP; se anota para el despliegue.

## Open Questions

- Si el diseño de Claude Design llega, ajustar tipografía y composición de la landing sin tocar las specs.
