# Diapositivas de la defensa

Ocho diapositivas, dos por integrante. La versión principal es **[`presentacion.html`](presentacion.html)**: un solo archivo, interactivo, con el logo animado, que se abre con doble clic en cualquier navegador y **funciona sin internet** (las imágenes y los datos van incrustados). Como respaldo hay una versión estática en [`diapositivas-taller-ruiz.pptx`](diapositivas-taller-ruiz.pptx), con el mismo contenido y los guiones en las notas del orador. El enunciado recomienda entre 5 y 7 diapositivas; se hicieron 8 para repartir dos por persona.

## Cómo se maneja la presentación HTML

| Tecla | Qué hace |
|---|---|
| Flechas, espacio, retroceso | Siguiente y anterior (también se puede deslizar en pantallas táctiles) |
| Inicio y Fin | Primera y última diapositiva |
| N | Notas del orador (el guion de cada diapositiva) |
| T | Temporizador de 10 minutos, con indicación de si van adelantados o atrasados |
| O | Índice para saltar a cualquier diapositiva |
| F | Pantalla completa |
| ? | Ayuda con los atajos |
| Esc | Cierra los paneles |

Lo interactivo, diapositiva por diapositiva:

1. Logo animado (la llave se balancea y las letras entran una a una) y un ticket que cambia de estado.
2. Estados de la orden: tocar cada uno muestra a cuáles se puede pasar.
3. Wireframe con seis puntos numerados que explican las decisiones de diseño.
4. Simulador de la máquina de estados: un salto inválido responde 422 y la orden no cambia. Pestañas con capturas del tablero y del detalle.
5. Tres pestañas con los tipos de prueba y su código.
6. Arquitectura: cada componente se puede tocar, y el flujo está animado. Tabla comparativa de proveedores.
7. Presupuesto: descuento o precio de lista, y un deslizador de horas de mantenimiento que recalcula en dólares y en pesos.
8. Seis tarjetas de imprevistos que se dan vuelta con la respuesta.

## Quién presenta qué

La defensa dura 10 minutos y el reparto da unos 75 segundos por diapositiva. Jeremías presenta tres (1, 2 y 3), Adrián dos (4 y 5), Renzo una (la 6) y Rocío dos. Si alguien prefiere otras, se intercambian las diapositivas y se cambia la línea "Presenta" al pie.

| N.º | Diapositiva | Presenta |
|---|---|---|
| 1 | Portada y equipo | Jeremías Fernández |
| 2 | El problema y la solución | Jeremías Fernández |
| 3 | UX/UI: persona, flujo y wireframe | Jeremías Fernández |
| 4 | Demostración de la prueba de concepto | Adrián Ramírez |
| 5 | Testing y calidad | Adrián Ramírez |
| 6 | Arquitectura y despliegue | Renzo Bazán |
| 7 | Presupuesto y mantenimiento | Rocío Bazán |
| 8 | Recomendación e imprevistos, y cierre | Rocío Bazán |

Todos pueden recibir preguntas sobre cualquier parte del trabajo, así que conviene que los cuatro lean la propuesta, el anexo de testing y el README de `api/`.

## Antes de la defensa: la demostración

La demostración (diapositiva 4) tiene un simulador dentro de la presentación, pero conviene mostrar también el sistema real, con la API y el front corriendo en la computadora de la defensa.

**Forma rápida:** doble clic en `Iniciar demo.cmd`, en la raíz del repositorio. Levanta todo, abre el navegador y muestra en la ventana la contraseña y la petición para Postman con el token. Los pasos de abajo son la forma manual.

1. Levantar la API: en `api/`, copiar `.env.example` a `.env`, completar `JWT_SECRET` y `DEMO_PASSWORD`, y correr `npm run dev` (puerto 4000).
2. Levantar el front: en `web/`, `npm run dev` (puerto 3000).
3. Si querés que el límite de consultas no moleste durante la demo, subí `TRACKING_LIMIT` en `api/.env`.
4. Cada vez que se reinicia la API, los datos de ejemplo vuelven a su estado inicial.

Recorrido sugerido (unos 75 segundos):

1. Abrir `http://localhost:3000/seguimiento?codigo=TR-1042` y mostrar el estado, el progreso y el historial, sin datos personales.
2. Entrar a `/login`, abrir la orden TR-1042 y cambiar el estado a "Esperando aprobación del cliente".
3. En Postman o Thunder Client, probar un salto inválido:
   - `POST http://localhost:4000/api/auth/login` con `{"username": "<DEMO_USER>", "password": "<DEMO_PASSWORD>"}`: devuelve el token.
   - `PATCH http://localhost:4000/api/orders/wo-001/status` con el encabezado `Authorization: Bearer <token>` y el cuerpo `{"status": "delivered"}`: responde **422** con los estados permitidos, y la orden no cambia.

## Cómo regenerar

Para la versión HTML no hace falta instalar nada. Se editan los textos y estilos en `plantilla.html` y se corre:

```bash
cd docs/diapositivas
node generar-html.js
```

Esto reemplaza `presentacion.html`. El script incrusta el logo separado en partes (de `web/public`), las imágenes de `img/` y los datos de [`../propuesta/datos.json`](../propuesta/datos.json) (integrantes, valor hora y cotización).

Para el respaldo en PowerPoint:

```bash
npm install
npm run generar
```

Los textos y las notas de esa versión están en `generar.js`. Los precios y las horas se copiaron de [`../presupuesto.md`](../presupuesto.md): si cambian allí, hay que actualizarlos en `plantilla.html` y en `generar.js`, para que las dos versiones digan lo mismo.

## Qué no se pudo verificar

- **La presentación HTML se probó solo en el navegador integrado de la herramienta**, que no es Chrome ni Edge. Se recorrieron las 8 diapositivas, los paneles (N, T, O, ?) y los controles interactivos, pero **hay que abrirla en el navegador y en la computadora de la defensa, y ensayarla de punta a punta**, también en pantalla completa y con el proyector. No se probó la copia al portapapeles ni la vista en celular.
- **No se abrió el `.pptx` en PowerPoint.** En la máquina donde se generó no había PowerPoint ni LibreOffice, así que no hay una captura real de cómo queda. Se revisó una vista previa aproximada (con otra fuente) y un chequeo automático de que el texto entra en sus cajas. Si van a usar el respaldo, hay que abrirlo y mirar las 8 diapositivas, sobre todo por si algún texto se corta con la fuente Calibri.
- El validador de esquemas que trae el skill de PowerPoint no pudo correr. En su lugar se comprobó que todas las partes del archivo sean XML válido, que las relaciones apunten a archivos existentes y que el archivo abra y se lea con python-pptx.
- El `.pptx` se genera sin entradas de carpeta en el ZIP, porque OneDrive puede fallar al abrir o co-editar los archivos que las traen.
