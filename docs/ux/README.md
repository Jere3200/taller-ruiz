# UX/UI para importar en Figma

Cuatro cuadros del entregable de UX del Grupo 2, generados como SVG para importarlos en Figma. La funcionalidad elegida es **cambiar el estado de una orden de trabajo**, y el usuario principal es **Luciano Gómez**, mecánico encargado del taller (persona ficticia, armada con supuestos y sin entrevistas).

| Archivo | Qué es |
|---|---|
| `figma/01-user-persona.svg` | User persona: perfil, objetivos, necesidades, dificultades, cita, escenario y habilidad digital |
| `figma/02-user-flow.svg` | User flow con todas las decisiones: sesión, login, búsqueda, estados siguientes, confirmación y respuestas de la API |
| `figma/03-wireframe-tablero.svg` | Wireframe de baja fidelidad del tablero de órdenes, con seis marcadores numerados |
| `figma/04-justificacion.svg` | Justificación de diseño: facilidad de uso, organización de la información y prevención de errores |

## Cómo importarlos

1. En Figma, crear un archivo nuevo (por ejemplo "Taller Ruiz, UX").
2. Arrastrar los cuatro archivos `.svg` desde el explorador de Windows al lienzo.
3. Cada uno entra como un grupo. Seleccionarlo y pasarlo a cuadro con `Ctrl + Alt + G`, para que aparezca con su nombre en el panel de capas.
4. Renombrar los cuadros: Persona, User flow, Wireframe y Justificación.
5. Compartir el archivo con la opción de ver con el enlace y pegar ese enlace en la entrega.

## Para tener en cuenta

- Los textos usan la fuente **Inter**, que Figma trae instalada. Si algún texto no se importa como texto editable (depende de la fuente del equipo), hay que volver a escribirlo.
- No se probó la importación dentro de Figma desde esta máquina: se revisó cómo se ven los SVG convertidos a imagen. Si algo queda corrido al importar, conviene ajustarlo a mano.
- Los SVG se pueden regenerar con `python generar_svg.py`, que usa solo la biblioteca estándar de Python. Los textos y las posiciones están en ese archivo.
- La persona es ficticia. En la defensa conviene decir que se armó con supuestos y que se validaría con los empleados reales en la prueba piloto.
