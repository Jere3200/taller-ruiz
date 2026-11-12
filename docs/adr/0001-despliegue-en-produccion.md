# ADR 0001: Despliegue en producción

Estado: propuesto. Fecha de la investigación: 6 de noviembre de 2026, con los precios de DonWeb actualizados el 12 de noviembre.

## Contexto

Taller Ruiz es un taller con cuatro empleados. Necesita una aplicación web para administrar reparaciones, con acceso interno para los empleados y consulta externa para los clientes.

Restricciones del cliente:

- Presupuesto mensual reducido.
- El personal no sabe administrar servidores.
- Hay que proteger la información de los clientes.

La aplicación se compone de un front en Next.js, una API en Express con TypeScript y una base PostgreSQL con TypeORM. El detalle de los precios y las fuentes está en [`../presupuesto.md`](../presupuesto.md).

## Opciones consideradas

**A. Hosting Node.js administrado más PostgreSQL externo.** Hostinger Cloud Startup para las aplicaciones y Supabase Pro para la base.

**B. VPS con Docker y PostgreSQL propio.** Un servidor con root donde corren el front, la API y la base. Se evaluaron DonWeb Cloud Server (plan de 4 vCPU, 4 GB de RAM y 20 GB NVMe) y Hostinger VPS KVM 2.

**C. Hosting compartido.** Descartada: los planes Personal, Emprendedor y Full+ de DonWeb no documentan soporte para aplicaciones Node.js ni PostgreSQL, y el plan Unlimited de Hostinger, que sí está en su oferta de Node.js, menciona solo MySQL.

| Criterio | A. Administrado y base externa | B. VPS (DonWeb o Hostinger) |
|---|---|---|
| Compatibilidad | Falta PostgreSQL en el hosting: Hostinger solo menciona MySQL. Hay que sumar Supabase | Compatible: con root se instalan Node, Docker y PostgreSQL |
| Costo inicial | Hostinger exige pagar 48 meses por adelantado (ARS 772.752) para el precio promocional | DonWeb cobra mes a mes, o un año por adelantado con 36 % menos. Hostinger KVM 2 exige 24 meses por adelantado (ARS 415.176) |
| Costo recurrente | Hostinger renueva a ARS 52.299 por mes, más USD 25 por mes de Supabase Pro | DonWeb: ARS 18.149 por mes, o ARS 140.010 por año (ARS 11.667,50 por mes). Hostinger renueva a ARS 31.399 por mes |
| Facilidad | Alta para el cliente, pero con dos proveedores y dos monedas | Más trabajo de armado, que hace la consultora una sola vez |
| Mantenimiento | El proveedor mantiene la plataforma; la base la mantiene Supabase | Lo hace la consultora: parches, backups, monitoreo y TLS |
| Seguridad | Buena base, pero los datos de clientes quedan repartidos en dos proveedores, y no se verificó en qué país está cada uno | Control total: firewall, SSH por clave, base sin exposición a Internet |
| Crecimiento | Pasar de plan es simple | DonWeb ajusta recursos por día con un reinicio de 3 a 5 minutos |
| Riesgos | El plan gratuito de Supabase se pausa tras una semana sin uso y no tiene backups | Si nadie mantiene el servidor, queda desactualizado y sin respaldo |

## Decisión

Se recomienda la opción **B con DonWeb Cloud Server**, plan de 4 vCPU, 4 GB de RAM y 20 GB NVMe, junto con un **plan de mantenimiento a cargo de la consultora**. Hostinger VPS KVM 2 queda como alternativa de respaldo.

Razones:

1. Es la única opción que incluye PostgreSQL sin sumar otro proveedor ni pagar en dólares.
2. Se factura en pesos, por mes o por año, sin pago adelantado de 24 o 48 meses, lo que encaja con un presupuesto mensual reducido. Se recomienda el pago anual, que cuesta 36 % menos que el mensual.
3. Los servidores están en Argentina, lo que reduce la latencia para los clientes y los empleados.
4. Incluye root, copias semanales automáticas y hasta dos snapshots sin cargo. Las copias diarias son un adicional pago.

Configuración propuesta:

- Docker Compose con tres contenedores (front, API y PostgreSQL) y Nginx como proxy inverso.
- HTTPS con Let's Encrypt a través de Certbot, que el plan trae preinstalado.
- Firewall con solo los puertos 22, 80 y 443, acceso por SSH con clave y sin contraseña, y PostgreSQL accesible únicamente desde la red interna de Docker.
- Secretos en variables de entorno del servidor, nunca en el repositorio.
- Dominio `.com.ar` en NIC Argentina y DNS en Cloudflare, plan Free (DNS, CDN, certificado universal y protección contra DDoS).
- Copia de la base con `pg_dump` cada noche, guardada fuera del servidor, además de las copias del proveedor.

## Respuesta a la pregunta del cliente

> "Si contrato el servidor más barato, ¿por qué tendría que pagar además por mantenimiento?"

El precio del servidor cubre el hardware y la red. Con un VPS, el sistema operativo, el motor de la base, los certificados y las copias de seguridad quedan a cargo de quien lo administra. DonWeb monitorea la red y los nodos, pero las actualizaciones y los parches del sistema son responsabilidad del cliente, salvo con su panel Ferozo. Si nadie los aplica, el servidor acumula fallas de seguridad conocidas, y con ellas los datos de los clientes quedan expuestos. Si el disco falla o alguien borra un registro, sin copias que se hayan probado no hay forma de recuperarlo. El mantenimiento es el servicio que evita eso, y como el personal del taller no administra servidores, lo presta la consultora.

## Consecuencias

- La consultora asume la administración del servidor, y por eso el presupuesto incluye horas mensuales de mantenimiento.
- Hay un único punto de falla: si el servidor cae, caen la aplicación y la base. Se mitiga con las copias diarias y con un procedimiento de restauración documentado y probado.
- Escalar es posible pero no automático: subir de plan implica un reinicio breve, que se coordina fuera del horario del taller.

## Lo que no se pudo verificar

- **DonWeb no publica el precio de renovación del pago anual con descuento.** El presupuesto muestra el pago anual y el pago mes a mes, que es el más caro. Hay que confirmarlo por escrito antes de contratar.
- **El precio de las copias diarias de DonWeb no figura en su sitio.** Hay que cotizarlo.
- **DonWeb no lista PostgreSQL en la imagen de Node.js.** Con root se puede instalar, pero no hay una imagen oficial que lo traiga; su imagen de Supabase sí lo incluye.
- **No se verificó en las páginas consultadas las versiones de Node.js** que ofrecen DonWeb y Hostinger. Con Docker no importa, porque la versión viaja en la imagen.
- **NIC Argentina muestra el arancel de $8.500 sin fecha** de vigencia, y no se verificó si permite delegar el DNS a Cloudflare.
