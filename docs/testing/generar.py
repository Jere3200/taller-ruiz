"""Genera el anexo de estrategia de testing (máximo 2 páginas) en PDF.

Uso:  python generar.py    (reutiliza los estilos de ../propuesta/generar.py)

Los casos 1 y 2 describen pruebas que ya existen en api/test y pasan con `npm test`.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "propuesta"))

import generar as base  # noqa: E402
from reportlab.lib.pagesizes import A4  # noqa: E402
from reportlab.lib.styles import ParagraphStyle  # noqa: E402
from reportlab.lib.units import mm  # noqa: E402
from reportlab.platypus import Frame, PageTemplate, BaseDocTemplate, Paragraph, Spacer, KeepTogether  # noqa: E402

AQUI = Path(__file__).parent
SALIDA = AQUI / "anexo-testing.pdf"

PAGE_W, PAGE_H = A4
MARGIN = base.MARGIN
CONTENT_W = base.CONTENT_W
p, tabla, bullets, H1, H2, NOTE, SMALL = base.p, base.tabla, base.bullets, base.H1, base.H2, base.NOTE, base.SMALL

CODE = ParagraphStyle("code", parent=base.CELL, fontName="Courier", fontSize=7.4, leading=9.2, backColor=base.PAPER, borderPadding=(3, 4, 3, 4))
TITLE = ParagraphStyle("title", parent=H1, fontSize=15, leading=18, spaceBefore=0, spaceAfter=3)


def pie(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(base.LINE)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 13 * mm, PAGE_W - MARGIN, 13 * mm)
    canvas.setFont("Helvetica", 7.4)
    canvas.setFillColor(base.MUTED)
    canvas.drawString(MARGIN, 9 * mm, "Anexo de testing: Taller Ruiz, Grupo 2")
    canvas.drawRightString(PAGE_W - MARGIN, 9 * mm, f"Página {doc.page}")
    canvas.restoreState()


def c(texto):
    """Fragmento de código dentro de una celda."""
    return Paragraph(texto, CODE)


def construir():
    doc = BaseDocTemplate(
        str(SALIDA),
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=14 * mm,
        bottomMargin=17 * mm,
        title="Anexo de estrategia de testing: Taller Ruiz",
        author=base.DATOS["consultora"],
        subject="Segundo parcial integrador, Construcción de Sitios Web II, Grupo 2",
    )
    marco = Frame(MARGIN, 17 * mm, CONTENT_W, PAGE_H - 31 * mm, id="c", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id="anexo", frames=[marco], onPage=pie)])

    ancho_etiqueta = 34 * mm
    anchos = [ancho_etiqueta, CONTENT_W - ancho_etiqueta]

    h = []
    h.append(p("Anexo: estrategia de testing y calidad", TITLE))
    h.append(
        p(
            "Las pruebas se aplican a la funcionalidad de la prueba de concepto: <b>cambiar el estado de una orden de trabajo</b> "
            "(<font name='Courier'>PATCH /api/orders/:id/status</font>), que solo acepta las transiciones válidas del proceso de "
            "reparación. Los casos 1 y 2 <b>ya están implementados</b> en el repositorio (carpeta <font name='Courier'>api/test</font>) "
            "y pasan con <font name='Courier'>npm test</font>: en total la API tiene 87 pruebas y el front 82. El caso 3 está redactado "
            "para registrarse en Testiny, pero todavía no se cargó."
        )
    )

    # 1. Unitaria
    h.append(p("1. Prueba unitaria con Jest", H2))
    h.append(
        tabla(
            [
                ["Campo", "Detalle"],
                ["<b>Qué se prueba</b>", "La función <font name='Courier'>canTransition(from, to)</font> de <font name='Courier'>api/src/domain/status.ts</font>, que decide si un cambio de estado es válido. Es una función pura: se prueba sola, sin servidor ni base."],
                ["<b>Objetivo</b>", "Comprobar que el proceso no se puede saltear: una orden en diagnóstico no pasa directamente a lista para retirar."],
                ["<b>Datos de entrada</b>", "Caso principal: <font name='Courier'>canTransition(\"diagnosing\", \"ready_for_pickup\")</font>. Casos complementarios: <font name='Courier'>(\"diagnosing\", \"awaiting_approval\")</font>, un estado hacia sí mismo y cualquier salida de <font name='Courier'>delivered</font> o <font name='Courier'>cancelled</font>."],
                ["<b>Resultado esperado</b>", "<font name='Courier'>false</font> para el salto inválido. <font name='Courier'>true</font> para la transición válida. <font name='Courier'>false</font> para los estados finales."],
                ["<b>Error que detecta</b>", "Que alguien edite la tabla de transiciones y deje pasar un salto inválido, por ejemplo entregar un vehículo sin presupuesto aprobado."],
                ["<b>Dónde está</b>", c("api/test/domain/status.test.ts<br/>it(\"rejects skipping the process (diagnosing -&gt; ready_for_pickup)\")")],
            ],
            anchos,
        )
    )

    # 2. Integración
    h.append(p("2. Prueba de integración con Supertest", H2))
    h.append(
        tabla(
            [
                ["Campo", "Detalle"],
                ["<b>Método y ruta</b>", c("PATCH /api/orders/wo-001/status") ],
                ["<b>Datos enviados</b>", "Orden <font name='Courier'>wo-001</font> (código TR-1042, en diagnóstico). Encabezado <font name='Courier'>Authorization: Bearer &lt;token&gt;</font> obtenido con el login. Cuerpo: <font name='Courier'>{\"status\": \"ready_for_pickup\"}</font>."],
                ["<b>Código esperado</b>", "<b>422</b> (transición inválida)."],
                ["<b>Respuesta esperada</b>", c("{ \"error\": \"INVALID_TRANSITION\", \"message\": \"El cambio de estado no es válido para el estado actual de la orden.\", \"allowed\": [\"awaiting_approval\", \"cancelled\"] }")],
                ["<b>Qué verifica</b>", "Que la API aplica la regla en el servidor y no solo en la interfaz, informa qué estados sí son válidos y <b>no modifica la orden</b>: un <font name='Courier'>GET</font> posterior sigue devolviendo <font name='Courier'>diagnosing</font>. Otros casos de la misma ruta: sin token responde 401, estado inexistente 400 y orden inexistente 404."],
                ["<b>Dónde está</b>", c("api/test/http/app.test.ts<br/>it(\"answers 422 with the allowed statuses for an invalid transition\")<br/>it(\"does not modify the order after an invalid transition\")")],
            ],
            anchos,
        )
    )

    # 3. Manual
    h.append(p("3. Prueba manual (caso para Testiny)", H2))
    h.append(
        tabla(
            [
                ["Campo", "Detalle"],
                ["<b>Identificador y nombre</b>", "<b>TC-001</b>: Un empleado cambia el estado de una orden y el cliente lo ve en el seguimiento."],
                ["<b>Precondiciones</b>", "La API y el front están corriendo con los datos de ejemplo recién cargados (reiniciar la API los restablece). Se conoce el usuario y la contraseña del taller. La orden TR-1042 está en <i>En diagnóstico</i>."],
                [
                    "<b>Pasos</b>",
                    "1. Abrir <font name='Courier'>/seguimiento?codigo=TR-1042</font> y ver el estado y el paso actual.<br/>"
                    "2. Ir a <font name='Courier'>/login</font> e ingresar con el usuario del taller.<br/>"
                    "3. Abrir la orden TR-1042 desde el tablero.<br/>"
                    "4. Mirar qué botones de cambio de estado aparecen.<br/>"
                    "5. Elegir <i>Pasar a Esperando aprobación del cliente</i>.<br/>"
                    "6. Volver a <font name='Courier'>/seguimiento?codigo=TR-1042</font> y recargar.",
                ],
                [
                    "<b>Resultado esperado</b>",
                    "Paso 1: <i>En diagnóstico</i>, paso 2 de 6. Paso 4: solo <i>Esperando aprobación del cliente</i> y <i>Cancelado</i>, ningún otro. "
                    "Paso 5: aviso de éxito, nuevo estado y una entrada nueva en el historial. Paso 6: <i>Esperando aprobación</i>, paso 3 de 6, "
                    "con la patente parcialmente oculta y <b>sin nombre ni teléfono</b> del cliente.",
                ],
            ],
            anchos,
        )
    )

    # 4. Verificación y validación
    h.append(p("4. Verificación y validación", H2))
    h.append(
        tabla(
            [
                ["", "Pregunta que responde", "Ejemplo con el escenario de Taller Ruiz"],
                [
                    "<b>Verificación</b>",
                    "¿Construimos el sistema <b>correctamente</b>, de acuerdo con su especificación?",
                    "Cada escenario de la especificación (por ejemplo \"una orden en diagnóstico no puede pasar a lista para retirar\") se contrasta con una prueba que lo "
                    "ejecuta, y se revisa el código contra esa especificación. Resultado medible: las pruebas pasan y no quedan escenarios sin cubrir.",
                ],
                [
                    "<b>Validación</b>",
                    "¿Construimos el sistema <b>correcto</b>, el que resuelve la necesidad real del cliente?",
                    "Una prueba piloto de dos semanas en el taller, con órdenes reales: ¿los clientes miran el seguimiento en lugar de llamar? ¿un empleado cambia un estado en "
                    "menos de 30 segundos sin ayuda? ¿tres clientes entienden en qué etapa está su vehículo sin que se les explique? Se compara la cantidad de llamadas "
                    "de consulta antes y después. <i>Se propone para el sistema completo: no se realizó.</i>",
                ],
            ],
            [24 * mm, 46 * mm, CONTENT_W - 70 * mm],
        )
    )

    # 5. Justificación
    h.append(p("5. Por qué estas pruebas y qué riesgos reducen", H2))
    h.append(
        tabla(
            [
                ["Prueba", "Por qué se eligió", "Riesgo que reduce"],
                [
                    "<b>Unitaria</b>",
                    "La regla de transiciones es el corazón del negocio y se puede probar aislada, rápido y en cada cambio del código.",
                    "Saltear etapas del proceso, por ejemplo entregar sin presupuesto aprobado.",
                ],
                [
                    "<b>Integración</b>",
                    "Comprueba la regla de punta a punta: autenticación, validación del cuerpo, código HTTP y que el estado no cambie tras un error.",
                    "Que la regla exista en el dominio pero la API no la haga cumplir, o que filtre datos o detalles internos.",
                ],
                [
                    "<b>Manual</b>",
                    "Recorre lo que cliente y empleado usan de verdad, cruzando el front y la API, y mira cosas que una prueba automática no ve: textos, claridad y datos visibles.",
                    "Mostrar datos personales en el seguimiento público, o una interfaz que ofrezca acciones que la API rechaza.",
                ],
            ],
            [24 * mm, 80 * mm, CONTENT_W - 104 * mm],
        )
    )
    doc.build(h)


if __name__ == "__main__":
    construir()
    print(f"Generado: {SALIDA}")
