# Proposal

## Why

Taller Ruiz registra las órdenes de trabajo en papel y los clientes deben llamar para saber el estado de su vehículo. Se necesita una Prueba de Concepto (PoC) ejecutable en local que demuestre la viabilidad técnica de consultar y actualizar el estado de una orden respetando el proceso real del taller, protegiendo los datos de los clientes. Es el componente de mayor peso del Segundo Parcial Integrador (Construcción de Sitios Web II, Grupo 2).

## What Changes

- API REST nueva con Node.js, TypeScript y Express, con datos simulados en memoria (sin base de datos real).
- Máquina de estados de las órdenes: solo se aceptan transiciones válidas del proceso de reparación.
- Consulta de órdenes para uso interno, protegida por autenticación de demostración.
- Consulta pública de seguimiento por código, que no expone datos personales.
- Fuera de alcance: crear, editar o borrar órdenes, registro de repuestos, roles distintos de empleado, recuperación de contraseña, persistencia real en PostgreSQL (solo se documenta cómo se haría con TypeORM), despliegue en Internet y frontend (se diseña aparte).

## Capabilities

### New Capabilities
- `work-order-status`: consulta de órdenes y cambio de estado con validación de transiciones y registro de historial.
- `staff-auth`: inicio de sesión de empleados y exigencia de credencial válida en las rutas internas.
- `public-tracking`: consulta pública del estado de una reparación mediante un código de seguimiento, sin datos personales.

### Modified Capabilities

Ninguna. El proyecto no tiene specs previas.

## Impact

- Código nuevo: proyecto `taller-ruiz-poc` (API, tests, README). No existe código previo.
- Contrato HTTP compartido con el frontend: los endpoints y los estados definidos en las specs.
- Datos: órdenes de ejemplo y un usuario de demostración en memoria, declarados como simulados en el README.
- Supuestos: los valores de estado van en inglés en la API y las etiquetas en español se resuelven en el frontend; la autenticación es solo de demostración (el sistema completo necesitaría contraseñas con hash, usuarios en base de datos, expiración configurable y roles).
