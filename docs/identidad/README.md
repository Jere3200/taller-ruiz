# Identidad de Rumbo Digital Consultores

Paquete de la consigna «Identidad de la consultora»: nombre comercial, logotipo, eslogan, datos de contacto ficticios y diseño de portada y presentación institucional.

| Archivo | Qué es |
|---|---|
| [`identidad-rumbo-digital.pdf`](identidad-rumbo-digital.pdf) | Presentación institucional de 8 páginas. La primera es la portada |
| [`identidad-rumbo-digital.html`](identidad-rumbo-digital.html) | Fuente de la presentación (se abre en el navegador) |
| [`portada.png`](portada.png) | La portada sola, 1280 x 720 |
| [`logo/`](logo/) | Logo en SVG: color, sobre fondo oscuro, horizontal e isotipo |

## Resumen

- **Nombre:** Rumbo Digital Consultores
- **Eslogan:** Marcamos el rumbo de tu negocio digital
- **Colores:** azul marino `#0B2849`, turquesa `#05F5D3`, turquesa oscuro `#0A8F7A` (para texto sobre fondo claro) y gris azulado `#F1F7F9`
- **Tipografía:** Montserrat
- **Contacto (ficticio):** hola@rumbodigital.example, +54 380 555-0142, Av. Ejemplo 1250, La Rioja Capital

El dominio `.example` está reservado para ejemplos y no existe en internet. Se evitó `rumbodigital.com.ar` porque ese dominio ya pertenece a otra persona.

## Regenerar el PDF

Después de editar el HTML, desde esta carpeta (hace falta Chrome y conexión, por la tipografía de Google Fonts):

```bash
chrome --headless --no-pdf-header-footer --virtual-time-budget=15000 --print-to-pdf="C:\ruta\absoluta\identidad-rumbo-digital.pdf" identidad-rumbo-digital.html
```

Chrome necesita una ruta absoluta de salida.

## Origen del logo

Se generó con IA a partir del prompt de la consigna y se retocó: el eslogan se acercó al nombre y se oscureció su turquesa para que se lea sobre blanco. Las variantes de esta carpeta no conservan los metadatos de procedencia (C2PA) del archivo original.
