# Proposal

## Why

La API de la PoC (change `work-order-status-api`) ya expone el estado de las órdenes, pero Taller Ruiz necesita que sus clientes consulten su reparación sin llamar y que sus empleados trabajen desde una pantalla, no con Postman. El enunciado del parcial no exige frontend funcional; se agrega para que la propuesta se pueda demostrar completa y para mostrar los dos tipos de usuario (cliente y empleado).

## What Changes

- Aplicación web con Next.js (App Router) que consume la API existente sin modificarla.
- Sitio público: landing institucional del taller y consulta de seguimiento por código.
- Zona interna: login de empleados, resumen y tablero de órdenes, detalle con cambio de estado.
- Identidad visual a partir del logo entregado (azul `#01225E` y naranja `#E46715`).
- Fuera de alcance: registro de usuarios, recuperación de contraseña, crear, editar o borrar órdenes, repuestos, roles distintos de empleado, notificaciones reales y despliegue.

## Capabilities

### New Capabilities
- `public-site`: landing del taller y consulta pública de seguimiento por código, sin datos personales.
- `staff-panel`: acceso de empleados, tablero de órdenes y cambio de estado desde la interfaz.

### Modified Capabilities

Ninguna. El contrato de la API no cambia.

## Impact

- Código nuevo en `web/`. La API (`api/`) no se toca.
- Dependencia del contrato HTTP definido en las specs de `work-order-status-api`.
- Supuesto: sin el diseño de Claude Design disponible, la interfaz se construye desde el prompt acordado y el logo; si el diseño llega después, se ajusta lo visual sin cambiar estas specs.
