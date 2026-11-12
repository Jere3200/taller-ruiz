# Presupuesto técnico-económico

Los precios se consultaron el **6 de noviembre de 2026** en las páginas oficiales de cada proveedor, y los de DonWeb se actualizaron el **12 de noviembre de 2026** con su configurador. Moneda: pesos argentinos (ARS), salvo donde se indica USD. Los precios cambian y los promocionales tienen condiciones: revisar las fuentes antes de contratar.

La decisión de despliegue y su justificación están en [`adr/0001-despliegue-en-produccion.md`](adr/0001-despliegue-en-produccion.md).

## 1. Costos de infraestructura

### Opción recomendada: DonWeb Cloud Server

Plan de 4 vCPU, 4 GB de RAM, 20 GB NVMe y 2 TB de transferencia, con el stack Node.js.

| Concepto | Precio | Condiciones |
|---|---|---|
| Cloud Server, pago anual | $140.010 por año (equivale a $11.667,50 por mes) | 36 % menos que pagar mes a mes. DonWeb lo anuncia como 55 %, calculado sobre un precio de referencia más alto que el mensual. No publica el precio de renovación |
| Cloud Server, pago mensual | $18.149 por mes | Sin adelanto; es la opción más cara |
| Copias semanales automáticas | Incluidas | Guardadas fuera del servidor |
| Dos snapshots | Incluidos | Se borran a los 28 días |
| Copias diarias (30 retenidas) | No publicado | Adicional pago, hay que cotizarlo |
| Dominio `.com.ar` en NIC Argentina | $8.500 por año | Alta y renovación. La página no indica fecha de vigencia |
| DNS, CDN y certificado universal en Cloudflare, plan Free | $0 | Incluye protección contra DDoS sin medición |
| Certificado HTTPS con Let's Encrypt | $0 | Certbot viene preinstalado en el plan |

Costo del primer año de infraestructura:

| Escenario | Hosting (12 meses) | Dominio | Total | Equivalente mensual |
|---|---|---|---|---|
| Pago anual (recomendado) | $140.010,00 | $8.500,00 | $148.510,00 | $12.375,83 |
| Pago mes a mes | $217.788,00 | $8.500,00 | $226.288,00 | $18.857,33 |

Sin contar las copias diarias, que se suman cuando se cotice. Se recomienda el pago anual: ahorra unos $78.000 frente al mensual, y adelantar un año es poco comparado con los 24 o 48 meses que pide Hostinger.

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

Estimación de esfuerzo del grupo para pasar de la prueba de concepto al MVP: **75 horas**. Parte de lo ya hecho en la prueba de concepto (la regla de estados, el seguimiento público, el ingreso y las pantallas del tablero y del detalle, con sus pruebas), así que las horas cubren lo que falta. Debe revisarse con el cliente.

| Tarea | Horas |
|---|---|
| Relevamiento final y ajustes de la interfaz | 6 |
| API con PostgreSQL, TypeORM y migraciones: alta y edición de órdenes, clientes y repuestos | 24 |
| Front: alta y edición de órdenes, clientes y repuestos | 16 |
| Autenticación real: usuarios en la base, contraseñas con hash y roles | 6 |
| Pruebas de lo nuevo y correcciones | 10 |
| Infraestructura y puesta en producción: servidor, Docker, HTTPS, copias y despliegue | 9 |
| Capacitación al personal y documentación | 4 |
| **Total del MVP** | **75** |

Segunda etapa, que no está en el MVP:

| Tarea | Horas |
|---|---|
| Avisos al cliente por WhatsApp o correo | 24 a 40 |
| Stock y costos de repuestos | 30 a 45 |
| Reportes | 16 a 24 |
| **Total de la segunda etapa** | **70 a 109** |

**Valor hora de referencia: USD 20**, para el desarrollo y también para el mantenimiento. Está dentro del rango de un desarrollador junior freelance en Argentina (USD 15 a 25 por hora en 2026), y se eligió así porque el cliente es un taller pequeño y es el primer proyecto del grupo. Es **menor que las referencias de los consejos profesionales**:

- El Consejo Profesional de Ciencias Informáticas de La Rioja ([tabla de abril de 2026](https://cpcilar.org.ar/wp-content/uploads/2026/05/TablaHonorariosAbril2026-3.pdf)) sugiere como mínimo $90.777 por hora para programación de páginas web y $99.205 para administración de sistemas. Al dólar oficial vendedor de $1.570 son unos USD 58 y USD 63.
- El Colegio de Profesionales de Ciencias Informáticas de San Juan publica, sin fecha, $70.000 por hora para un desarrollador Full Stack ([fuente](https://cpci.com.ar/Honorarios.html)).

Costo del MVP: **USD 1.500** (75 horas). Cotización de referencia: dólar oficial vendedor de $1.570 el 5 de noviembre de 2026 ([dolarapi.com](https://dolarapi.com/v1/dolares/oficial)), que equivale a $2.355.000. Cambia todos los días: la infraestructura está cotizada en pesos y la mano de obra en dólares.

## 3. Costos recurrentes

| Concepto | Por mes | Quién lo presta |
|---|---|---|
| Servidor (DonWeb Cloud Server) | $11.667,50 con pago anual, $18.149 con pago mensual | Proveedor de infraestructura |
| Dominio `.com.ar` | $708,33 (el anual dividido en 12) | NIC Argentina |
| DNS, CDN y certificado | $0 | Cloudflare |
| Copias diarias del servidor | A cotizar | Proveedor de infraestructura |
| Mantenimiento y soporte | USD 80 a USD 160 (4 a 8 horas × USD 20), unos $125.600 a $251.200 | Consultora |

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
