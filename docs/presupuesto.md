# Presupuesto técnico-económico

Todos los precios se consultaron el **6 de noviembre de 2026** en las páginas oficiales de cada proveedor. Moneda: pesos argentinos (ARS), salvo donde se indica USD. Los precios cambian y los promocionales tienen condiciones: revisar las fuentes antes de contratar.

La decisión de despliegue y su justificación están en [`adr/0001-despliegue-en-produccion.md`](adr/0001-despliegue-en-produccion.md).

## 1. Costos de infraestructura

### Opción recomendada: DonWeb Cloud Server

Plan de 4 vCPU, 4 GB de RAM, 20 GB NVMe y 2 TB de transferencia, con el stack Node.js.

| Concepto | Precio | Condiciones |
|---|---|---|
| Cloud Server, precio promocional (55 % de descuento) | $10.966,87 por mes | IVA incluido. La página no dice cuánto dura el descuento |
| Cloud Server, precio de lista | $24.370,80 por mes | Caso más desfavorable si el descuento termina |
| Copias semanales automáticas | Incluidas | Guardadas fuera del servidor |
| Dos snapshots | Incluidos | Se borran a los 28 días |
| Copias diarias (30 retenidas) | No publicado | Adicional pago, hay que cotizarlo |
| Dominio `.com.ar` en NIC Argentina | $8.500 por año | Alta y renovación. La página no indica fecha de vigencia |
| DNS, CDN y certificado universal en Cloudflare, plan Free | $0 | Incluye protección contra DDoS sin medición |
| Certificado HTTPS con Let's Encrypt | $0 | Certbot viene preinstalado en el plan |

Costo del primer año de infraestructura:

| Escenario | Hosting (12 meses) | Dominio | Total | Equivalente mensual |
|---|---|---|---|---|
| Con descuento vigente | $131.602,44 | $8.500,00 | $140.102,44 | $11.675,20 |
| A precio de lista | $292.449,60 | $8.500,00 | $300.949,60 | $25.079,13 |

Sin contar las copias diarias, que se suman cuando se cotice.

### Alternativas comparadas

| Opción | Plan | Precio promocional | Pago inicial exigido | Renovación |
|---|---|---|---|---|
| A. Hosting administrado | Hostinger Cloud Startup (4 núcleos, 4 GB de RAM, 100 GB NVMe, 10 aplicaciones web) | $16.099 por mes | $772.752 por 48 meses por adelantado | $52.299 por mes |
| A. Base de datos externa | Supabase Pro, un proyecto | USD 25 por mes | Mensual | USD 25 por mes |
| B. VPS de respaldo | Hostinger VPS KVM 2 (2 vCPU, 8 GB de RAM, 100 GB NVMe, 8 TB de transferencia) | $17.299 por mes | $415.176 por 24 meses por adelantado | $31.399 por mes |

Notas:

- Hostinger no aclara si sus precios incluyen impuestos, y el precio promocional es el total del plazo dividido por los meses.
- El hosting Node.js de Hostinger solo menciona MySQL, por lo que la opción A necesita Supabase para tener PostgreSQL. El plan gratuito de Supabase se pausa tras una semana sin actividad y no incluye backups, por lo que no es apto; el plan Pro incluye copias diarias con 7 días de retención.
- Una recuperación a un punto en el tiempo en Supabase cuesta USD 100 por mes más por cada 7 días de retención.
- Este documento no convierte los dólares a pesos, porque no se verificó una cotización.

## 2. Costos de implementación

Estimación de esfuerzo del grupo para pasar de la prueba de concepto al sistema completo. Son rangos de horas y deben revisarse con el cliente.

| Tarea | Horas |
|---|---|
| Relevamiento final y diseño de interfaz completo | 16 a 24 |
| API completa: clientes, vehículos, órdenes, registro de repuestos, usuarios y roles, con PostgreSQL, TypeORM y migraciones | 70 a 100 |
| Front completo: tablero, alta y edición de órdenes, clientes y repuestos | 50 a 70 |
| Autenticación real: contraseñas con hash, roles, expiración y recuperación | 16 a 24 |
| Pruebas unitarias, de integración y end to end, y correcciones | 30 a 40 |
| Infraestructura y puesta en producción: servidor, Docker, HTTPS, copias y despliegue | 16 a 24 |
| Capacitación al personal y documentación | 8 a 12 |
| **Total del MVP** | **206 a 294** |

Segunda etapa, que no está en el MVP:

| Tarea | Horas |
|---|---|
| Avisos al cliente por WhatsApp o correo | 24 a 40 |
| Stock y costos de repuestos | 30 a 45 |
| Reportes | 16 a 24 |
| **Total de la segunda etapa** | **70 a 109** |

**Valor hora de referencia: USD 10**, para el desarrollo y también para el mantenimiento. Es un valor fijado por el grupo para un equipo en formación, y es **menor que las referencias de mercado consultadas**:

- El Consejo Profesional de Ciencias Informáticas de La Rioja ([tabla de abril de 2026](https://cpcilar.org.ar/wp-content/uploads/2026/05/TablaHonorariosAbril2026-3.pdf)) sugiere como mínimo $90.777 por hora para programación de páginas web y $99.205 para administración de sistemas. Al dólar oficial vendedor de $1.570 son unos USD 58 y USD 63.
- El Colegio de Profesionales de Ciencias Informáticas de San Juan publica, sin fecha, $70.000 por hora para un desarrollador Full Stack ([fuente](https://cpci.com.ar/Honorarios.html)).

Costo del MVP: de **USD 2.060 a USD 2.940** (206 a 294 horas). Cotización de referencia: dólar oficial vendedor de $1.570 el 5 de noviembre de 2026 ([dolarapi.com](https://dolarapi.com/v1/dolares/oficial)), que equivale a $3.234.200 a $4.615.800. Cambia todos los días: la infraestructura está cotizada en pesos y la mano de obra en dólares.

## 3. Costos recurrentes

| Concepto | Por mes | Quién lo presta |
|---|---|---|
| Servidor (DonWeb Cloud Server) | $10.966,87 con descuento, $24.370,80 a precio de lista | Proveedor de infraestructura |
| Dominio `.com.ar` | $708,33 (el anual dividido en 12) | NIC Argentina |
| DNS, CDN y certificado | $0 | Cloudflare |
| Copias diarias del servidor | A cotizar | Proveedor de infraestructura |
| Mantenimiento y soporte | USD 40 a USD 80 (4 a 8 horas × USD 10), unos $62.800 a $125.600 | Consultora |

El mantenimiento incluye actualizaciones del sistema y de la aplicación, control de las copias de seguridad con una prueba de restauración periódica, monitoreo, renovación de certificados y atención de incidentes. Las 4 a 8 horas son una estimación a revisar.

## 4. Qué contrata el cliente a quién

| Proveedor | Qué presta |
|---|---|
| DonWeb | Servidor, red, copias semanales y snapshots |
| NIC Argentina | Registro del dominio |
| Cloudflare | DNS, CDN y certificado |
| **La consultora** | Desarrollo, puesta en producción, mantenimiento mensual, soporte, restauración ante incidentes y capacitación |

## Fuentes

- DonWeb, Cloud Server con Node.js: https://donweb.com/es-ar/cloud-nodejs-hosting
- DonWeb, Cloud Servers VPS: https://donweb.com/es-ar/hosting-cloud-servers-vps
- DonWeb, imagen de Supabase: https://donweb.com/es-ar/cloud-supabase-hosting
- Hostinger, hosting Node.js: https://www.hostinger.com/ar/nodejs-hosting
- Hostinger, VPS: https://www.hostinger.com/ar/vps-hosting
- Supabase, precios: https://supabase.com/pricing
- NIC Argentina, aranceles: https://nic.ar/es/dominios/aranceles
- Cloudflare, planes: https://www.cloudflare.com/plans/network-cdn
