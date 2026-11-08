# UX/UI en Figma

**Archivo de Figma:** [Taller Ruiz - UX/UI (Grupo 2)](https://www.figma.com/design/FUW1FnMtCgUGFZMrJsvhKE). Tiene una página con todo como capas editables: persona, user flow, **wireframe de baja fidelidad** (tres pantallas clave del flujo: tablero, detalle y confirmación, solo con recuadros en grises), una sección **3b con los wireframes detallados de las seis pantallas del front** (landing, seguimiento público en celular, login, tablero, detalle de la orden y confirmación con aviso de resultado) y la justificación.

El wireframe de baja fidelidad y cinco de los seis wireframes detallados se armaron directamente en Figma y no tienen SVG en esta carpeta. Del repo salen la persona, el user flow, el tablero detallado (3b.4) y la justificación.

Cuatro cuadros del entregable de UX del Grupo 2. Se generan como SVG y se importaron así al archivo de Figma. La funcionalidad elegida es **cambiar el estado de una orden de trabajo**, y el usuario principal es **Luciano Gómez**, mecánico encargado del taller (persona ficticia, armada con supuestos y sin entrevistas).

| Archivo | Qué es |
|---|---|
| `figma/01-user-persona.svg` | User persona: perfil, objetivos, necesidades, dificultades, cita, escenario y habilidad digital |
| `figma/02-user-flow.svg` | User flow con todas las decisiones: sesión, login, búsqueda, estados siguientes, confirmación y respuestas de la API |
| `figma/03-wireframe-tablero.svg` | Wireframe detallado del tablero de órdenes, con seis marcadores numerados (en Figma, 3b.4) |
| `figma/04-justificacion.svg` | Justificación de diseño: facilidad de uso, organización de la información y prevención de errores |

## Cómo volver a importarlos

Solo hace falta si cambian los SVG. El archivo de Figma ya los tiene.

1. En Figma, abrir el archivo o crear uno nuevo.
2. Arrastrar los cuatro archivos `.svg` desde el explorador de Windows al lienzo.
3. Cada uno entra como un grupo. Seleccionarlo y pasarlo a cuadro con `Ctrl + Alt + G`, para que aparezca con su nombre en el panel de capas.
4. Renombrar los cuadros: Persona, User flow, Wireframe y Justificación.
5. Para la entrega, el archivo tiene que estar compartido con la opción «cualquiera con el enlace puede ver».

## Para tener en cuenta

- Los textos usan la fuente **Inter** y quedaron como texto editable en Figma. Se revisaron las capturas de los cuatro cuadros dentro de Figma.
- Los SVG se pueden regenerar con `python generar_svg.py`, que usa solo la biblioteca estándar de Python. Los textos y las posiciones están en ese archivo.
- La persona es ficticia. En la defensa conviene decir que se armó con supuestos y que se validaría con los empleados reales en la prueba piloto.
