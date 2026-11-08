"""Genera la propuesta técnico-comercial de Taller Ruiz en PDF.

Uso:  python generar.py        (lee datos.json y escribe propuesta-tecnico-comercial.pdf)

Los precios salen de docs/presupuesto.md (consultados el 6 de noviembre de 2026). Si cambian allí,
hay que actualizarlos también en este archivo.
"""

import json
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

AQUI = Path(__file__).parent
SALIDA = AQUI / "propuesta-tecnico-comercial.pdf"
DATOS = json.loads((AQUI / "datos.json").read_text(encoding="utf-8"))

NAVY = colors.HexColor("#01225E")
ORANGE = colors.HexColor("#E46715")
ORANGE_TEXT = colors.HexColor("#B34A00")
INK = colors.HexColor("#14191C")
MUTED = colors.HexColor("#5A6167")
LINE = colors.HexColor("#DEDAD3")
PAPER = colors.HexColor("#F4F2EE")
SOFT = colors.HexColor("#E4EAF5")

PAGE_W, PAGE_H = A4
MARGIN = 17 * mm
CONTENT_W = PAGE_W - 2 * MARGIN

BASE = ParagraphStyle("base", fontName="Helvetica", fontSize=8.6, leading=11.1, textColor=INK, alignment=TA_LEFT)
SMALL = ParagraphStyle("small", parent=BASE, fontSize=7.6, leading=9.6, textColor=MUTED)
CELL = ParagraphStyle("cell", parent=BASE, fontSize=7.6, leading=9.2)
CELL_B = ParagraphStyle("cellb", parent=CELL, fontName="Helvetica-Bold")
HEAD_CELL = ParagraphStyle("headcell", parent=CELL, fontName="Helvetica-Bold", textColor=colors.white)
H1 = ParagraphStyle("h1", parent=BASE, fontName="Helvetica-Bold", fontSize=12.5, leading=15, textColor=NAVY, spaceBefore=6, spaceAfter=2, keepWithNext=1)
H2 = ParagraphStyle("h2", parent=BASE, fontName="Helvetica-Bold", fontSize=9.4, leading=12, textColor=ORANGE_TEXT, spaceBefore=4, spaceAfter=1, keepWithNext=1)
BULLET = ParagraphStyle("bullet", parent=BASE, leftIndent=9, bulletIndent=0, spaceAfter=0.6)
NOTE = ParagraphStyle("note", parent=BASE, fontSize=8.2, leading=10.6, backColor=SOFT, borderPadding=(4, 5, 4, 5), spaceBefore=3, spaceAfter=4)


def p(text, style=BASE):
    return Paragraph(text, style)


def bullets(items, style=BULLET):
    return [Paragraph(item, style, bulletText="-") for item in items]


def ars(value):
    """Formato argentino: $10.966,87 (sin decimales si es entero)."""
    texto = f"{value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    if texto.endswith(",00"):
        texto = texto[:-3]
    return f"${texto}"


def monto(valor):
    """Importe en la moneda de datos.json: USD 2.060 o $2.060."""
    if DATOS["moneda"] == "USD":
        return "USD " + f"{valor:,.0f}".replace(",", ".")
    return ars(valor)


def tabla(filas, anchos, cabecera=True, zebra=True, extra=()):
    datos = []
    for i, fila in enumerate(filas):
        estilo = HEAD_CELL if cabecera and i == 0 else CELL
        datos.append([c if isinstance(c, Flowable) else Paragraph(str(c), estilo) for c in fila])
    t = Table(datos, colWidths=anchos, repeatRows=1 if cabecera else 0)
    comandos = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 2.6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.6),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINE),
    ]
    if cabecera:
        comandos.append(("BACKGROUND", (0, 0), (-1, 0), NAVY))
    if zebra:
        for i in range(1 if cabecera else 0, len(datos)):
            if (i % 2) == 0:
                comandos.append(("BACKGROUND", (0, i), (-1, i), PAPER))
    t.setStyle(TableStyle(comandos + list(extra)))
    return t


class Arquitectura(Flowable):
    """Diagrama de arquitectura. Trazo continuo azul = implementado en la PoC; punteado naranja = propuesto."""

    ALTO = 212
    ESCALA = 0.93

    def __init__(self, ancho):
        super().__init__()
        self.ancho = ancho
        self.width = ancho
        self.height = self.ALTO * self.ESCALA

    def wrap(self, *_):
        return self.ancho, self.ALTO * self.ESCALA

    def _caja(self, c, x, y, w, h, lineas, implementado, relleno=colors.white, titulo=False):
        color = NAVY if implementado else ORANGE
        c.setStrokeColor(color)
        c.setLineWidth(1.3 if implementado else 1)
        c.setDash() if implementado else c.setDash(3, 2)
        c.setFillColor(relleno)
        c.roundRect(x, y, w, h, 4, stroke=1, fill=1)
        c.setDash()
        c.setFillColor(INK)
        n = len(lineas)
        for i, (texto, negrita) in enumerate(lineas):
            c.setFont("Helvetica-Bold" if negrita else "Helvetica", 7.4 if not negrita else 7.8)
            yy = y + h / 2 + (n - 1) * 5 - i * 10 - 2.5
            c.drawCentredString(x + w / 2, yy, texto)

    def _flecha(self, c, x1, y1, x2, y2, color=MUTED):
        import math

        c.setStrokeColor(color)
        c.setFillColor(color)
        c.setLineWidth(1)
        c.line(x1, y1, x2, y2)
        ang = math.atan2(y2 - y1, x2 - x1)
        t = 4.2
        c.saveState()
        c.translate(x2, y2)
        c.rotate(math.degrees(ang))
        path = c.beginPath()
        path.moveTo(0, 0)
        path.lineTo(-t, t * 0.55)
        path.lineTo(-t, -t * 0.55)
        path.close()
        c.drawPath(path, stroke=0, fill=1)
        c.restoreState()

    def draw(self):
        c = self.canv
        c.saveState()
        c.scale(self.ESCALA, self.ESCALA)
        self.ancho_total = self.ancho
        self.ancho = self.ancho / self.ESCALA
        # Actores
        actor = colors.HexColor("#EDEFF2")
        c.setStrokeColor(MUTED)
        for (y, lineas) in (
            (140, [("Clientes", True), ("celular, con su", False), ("código de seguimiento", False)]),
            (62, [("Empleados", True), ("PC o tablet,", False), ("panel con login", False)]),
        ):
            c.setStrokeColor(MUTED)
            c.setFillColor(actor)
            c.setLineWidth(1)
            c.roundRect(0, y, 112, 50, 4, stroke=1, fill=1)
            c.setFillColor(INK)
            for i, (texto, negrita) in enumerate(lineas):
                c.setFont("Helvetica-Bold" if negrita else "Helvetica", 7.8 if negrita else 7.4)
                c.drawCentredString(56, y + 38 - i * 10.5, texto)

        # Cloudflare
        self._caja(c, 142, 102, 92, 60, [("Cloudflare", True), ("DNS, CDN y", False), ("certificado HTTPS", False), ("(propuesto)", False)], False)

        # Servidor
        c.setStrokeColor(ORANGE)
        c.setLineWidth(1)
        c.setDash(3, 2)
        c.setFillColor(colors.HexColor("#FFF8F2"))
        c.roundRect(262, 14, self.ancho - 262, 196, 5, stroke=1, fill=1)
        c.setDash()
        c.setFillColor(ORANGE_TEXT)
        c.setFont("Helvetica-Bold", 7.8)
        c.drawString(270, 197, "Servidor DonWeb Cloud Server (propuesto)")

        x0 = 272
        ancho_caja = 100
        x1 = self.ancho - 10 - ancho_caja
        self._caja(c, x0, 150, self.ancho - 262 - 20, 32, [("Nginx y Certbot", True), ("proxy inverso, HTTPS (propuesto)", False)], False)
        self._caja(c, x0, 92, ancho_caja, 42, [("Front Next.js", True), ("(implementado)", False)], True)
        self._caja(c, x1, 92, ancho_caja, 42, [("API Express", True), ("(implementada, datos", False), ("en memoria)", False)], True)
        self._caja(c, x1, 28, ancho_caja, 42, [("PostgreSQL", True), ("con TypeORM", False), ("(propuesto)", False)], False)
        self._caja(c, x0, 28, ancho_caja, 42, [("Copias de seguridad", True), ("pg_dump nocturno y", False), ("semanales del proveedor", False)], False)

        # Flechas
        self._flecha(c, 112, 165, 142, 142)
        self._flecha(c, 112, 87, 142, 122)
        self._flecha(c, 234, 132, 272, 166)
        self._flecha(c, x0 + ancho_caja / 2, 150, x0 + ancho_caja / 2, 134)
        self._flecha(c, x1 + ancho_caja / 2, 150, x1 + ancho_caja / 2, 134)
        self._flecha(c, x0 + ancho_caja, 113, x1, 113)
        self._flecha(c, x1 + ancho_caja / 2, 92, x1 + ancho_caja / 2, 70)
        self._flecha(c, x1, 49, x0 + ancho_caja, 49)

        # Leyenda
        c.setLineWidth(1.3)
        c.setStrokeColor(NAVY)
        c.setFillColor(colors.white)
        c.rect(0, 2, 16, 8, stroke=1, fill=1)
        c.setFillColor(INK)
        c.setFont("Helvetica", 7.4)
        c.drawString(20, 3.5, "Implementado en la prueba de concepto")
        c.setStrokeColor(ORANGE)
        c.setLineWidth(1)
        c.setDash(3, 2)
        c.setFillColor(colors.white)
        c.rect(180, 2, 16, 8, stroke=1, fill=1)
        c.setDash()
        c.setFillColor(INK)
        c.drawString(200, 3.5, "Propuesto para el sistema completo")
        self.ancho = self.ancho_total
        c.restoreState()


def pie(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 13 * mm, PAGE_W - MARGIN, 13 * mm)
    canvas.setFont("Helvetica", 7.4)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN, 9 * mm, f"Propuesta técnico-comercial para Taller Ruiz, Grupo 2")
    canvas.drawRightString(PAGE_W - MARGIN, 9 * mm, f"Página {doc.page - 1}")
    canvas.restoreState()


def portada(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    canvas.setFillColor(ORANGE)
    canvas.rect(MARGIN, PAGE_H - 62 * mm, 22 * mm, 2.2 * mm, stroke=0, fill=1)
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 30)
    canvas.drawString(MARGIN, PAGE_H - 82 * mm, "Propuesta")
    canvas.drawString(MARGIN, PAGE_H - 94 * mm, "técnico-comercial")
    canvas.setFont("Helvetica", 14)
    canvas.setFillColor(colors.HexColor("#C9D4EA"))
    canvas.drawString(MARGIN, PAGE_H - 108 * mm, "Taller Ruiz: sistema de gestión de reparaciones")

    y = PAGE_H - 150 * mm
    canvas.setFont("Helvetica-Bold", 10.5)
    canvas.setFillColor(colors.HexColor("#F6A46E"))
    canvas.drawString(MARGIN, y, DATOS["consultora"].upper())
    canvas.setFont("Helvetica", 10.5)
    canvas.setFillColor(colors.white)
    y -= 7 * mm
    canvas.drawString(MARGIN, y, "Grupo 2")
    for nombre in DATOS["integrantes"]:
        y -= 5.5 * mm
        canvas.drawString(MARGIN, y, nombre)

    y = 52 * mm
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(colors.HexColor("#A9B9DA"))
    for linea in (
        "Segundo parcial integrador, Construcción de Sitios Web II",
        "Tecnicatura Superior en Analista de Sistemas, 3.er año, IRESM Nivel Superior",
        "Docente: María Florencia García Zavia",
        f"Ciclo lectivo 2026, {DATOS['fecha']}",
    ):
        canvas.drawString(MARGIN, y, linea)
        y -= 5 * mm
    canvas.restoreState()


def construir():
    moneda = DATOS["moneda"]
    vh = DATOS.get("valor_hora")
    vh_m = DATOS.get("valor_hora_mantenimiento") or vh

    doc = BaseDocTemplate(
        str(SALIDA),
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=15 * mm,
        bottomMargin=17 * mm,
        title="Propuesta técnico-comercial: Taller Ruiz",
        author=DATOS["consultora"],
        subject="Segundo parcial integrador, Construcción de Sitios Web II, Grupo 2",
    )
    marco = Frame(MARGIN, 17 * mm, CONTENT_W, PAGE_H - 32 * mm, id="contenido", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates(
        [
            PageTemplate(id="portada", frames=[marco], onPage=portada),
            PageTemplate(id="contenido", frames=[marco], onPage=pie),
        ]
    )

    h = []
    h.append(NextPageTemplate("contenido"))
    h.append(PageBreak())

    # 1. Diagnóstico
    h.append(p("1. Diagnóstico del cliente", H1))
    h.append(
        p(
            "<b>Taller Ruiz</b> es un taller mecánico de Daniel Ruiz con cuatro empleados. Las órdenes de trabajo se registran en "
            "papel y los clientes deben llamar por teléfono para saber cómo va su vehículo. <b>El problema principal</b> es que "
            "la información del estado de cada reparación vive en papeles y en la memoria del personal: cada consulta ocupa a un "
            "empleado y no queda un historial que se pueda recuperar."
        )
    )
    h.append(Spacer(1, 3))
    h.append(
        tabla(
            [
                ["Usuario", "Necesidades"],
                [
                    "<b>Empleados</b> (4)",
                    "Ver todas las órdenes y su estado, hacer avanzar una reparación sin saltear etapas, registrar repuestos y "
                    "encontrar rápido una orden por patente, código o cliente.",
                ],
                [
                    "<b>Clientes</b>",
                    "Saber en qué etapa está su vehículo sin llamar, desde el celular, y sin que otras personas vean datos "
                    "personales.",
                ],
            ],
            [30 * mm, CONTENT_W - 30 * mm],
        )
    )
    h.append(Spacer(1, 3))
    h.append(
        p(
            "<b>Restricciones del cliente:</b> presupuesto mensual reducido, personal sin conocimientos de administración de "
            "servidores, necesidad de proteger la información de los clientes y acceso tanto interno como externo."
        )
    )
    h.append(p("Supuestos (no se hizo un relevamiento exhaustivo)", H2))
    h.extend(
        bullets(
            [
                "Los cuatro empleados usan el panel; los clientes solo consultan. El volumen es chico, del orden de decenas de "
                "órdenes activas a la vez, y no se midió la cifra real.",
                "En el MVP el aviso al cliente de que su vehículo está listo sigue siendo una llamada o un mensaje manual.",
                "No hay integración con facturación ni con proveedores de repuestos.",
            ]
        )
    )

    # 2. Solución
    h.append(p("2. Solución propuesta y alcance", H1))
    h.append(
        p(
            "Una <b>aplicación web con dos partes</b>: un sitio público con una página institucional y la consulta de seguimiento "
            "por código, y un panel interno con ingreso de empleados. Cada reparación avanza por estados válidos, y el sistema "
            "no permite saltear etapas (por ejemplo, pasar de En diagnóstico a Listo para retirar):"
        )
    )
    h.append(Spacer(1, 2))
    h.append(
        p(
            "<b>Recibido > En diagnóstico > Esperando aprobación del cliente > En reparación</b> (con pausa por Esperando "
            "repuestos) <b>> Listo para retirar > Entregado</b>. Se puede cancelar hasta que el vehículo esté listo.",
            NOTE,
        )
    )
    h.append(
        p(
            "<b>Valor para la organización:</b> se eliminan las llamadas de consulta, cada cambio de estado queda registrado con "
            "fecha y hora, el proceso se cumple siempre y los datos del cliente se protegen: el seguimiento público muestra solo "
            "el vehículo, la patente parcialmente oculta, el estado y el historial."
        )
    )
    h.append(Spacer(1, 3))
    h.append(
        tabla(
            [
                ["Alcance del MVP", "Segunda etapa"],
                [
                    "Sitio institucional y seguimiento público por código<br/>"
                    "Ingreso de empleados con roles<br/>"
                    "Tablero de órdenes con búsqueda y filtros<br/>"
                    "Alta y edición de órdenes, clientes y vehículos<br/>"
                    "Cambio de estado con historial y confirmaciones<br/>"
                    "Registro básico de repuestos por orden",
                    "Avisos automáticos al cliente por WhatsApp o correo<br/>"
                    "Stock y costos de repuestos<br/>"
                    "Reportes de actividad del taller<br/>"
                    "Códigos de seguimiento aleatorios, o con un segundo dato de verificación, y listados paginados",
                ],
            ],
            [CONTENT_W * 0.56, CONTENT_W * 0.44],
            zebra=False,
        )
    )
    h.append(Spacer(1, 4))
    h.append(p("Qué es la prueba de concepto y qué falta", H2))
    h.append(
        tabla(
            [
                ["Qué", "Detalle"],
                [
                    "<b>Se recomienda desarrollar</b>",
                    "El sistema completo del MVP y, después, la segunda etapa.",
                ],
                [
                    "<b>Se implementó como prueba de concepto</b>",
                    "API con Node.js, TypeScript y Express: consulta y cambio de estado de órdenes con la regla de transiciones "
                    "válidas, ingreso con token, seguimiento público sin datos personales y límite de intentos (87 tests). Front "
                    "con Next.js: landing, seguimiento, ingreso, tablero y detalle (82 tests). Los datos son de ejemplo y están "
                    "en memoria.",
                ],
                [
                    "<b>Todavía hay que construir</b>",
                    "Persistencia real con PostgreSQL y TypeORM, usuarios en la base con contraseñas con hash, alta y edición de "
                    "órdenes, clientes y repuestos, listados paginados, códigos de seguimiento no adivinables y tests end to end.",
                ],
                [
                    "<b>Para publicar y mantener</b>",
                    "Servidor, dominio, HTTPS, copias de seguridad, monitoreo y un plan de mantenimiento (secciones 4 a 6).",
                ],
            ],
            [42 * mm, CONTENT_W - 42 * mm],
        )
    )

    # 3. Arquitectura
    h.append(p("3. Arquitectura tecnológica", H1))
    h.append(Arquitectura(CONTENT_W))
    h.append(Spacer(1, 3))
    h.extend(
        bullets(
            [
                "<b>Comunicación:</b> los navegadores hablan con Cloudflare por HTTPS y este con Nginx en el servidor. "
                "El seguimiento público se arma en el servidor de Next.js, que consulta a la API. El panel se ejecuta en el "
                "navegador y llama a la API con un token. La API consulta a PostgreSQL mediante TypeORM.",
                "<b>Validación y seguridad en la API:</b> todo dato de entrada se valida en el servidor, la regla de transiciones "
                "vive en el dominio y no en la interfaz, los errores hacia el usuario son genéricos y hay límite de intentos.",
                "<b>Servicios externos:</b> solo Cloudflare (DNS y CDN) y NIC Argentina (dominio). No se usan APIs de terceros "
                "en el MVP.",
            ]
        )
    )

    # 4. Despliegue
    h.append(p("4. Estrategia de despliegue", H1))
    h.extend(
        bullets(
            [
                "<b>Hosting:</b> un <b>DonWeb Cloud Server</b> (4 vCPU, 4 GB de RAM, 20 GB NVMe) con Docker Compose y tres "
                "contenedores: front, API y PostgreSQL. Los servidores están en Argentina.",
                "<b>Dominio y DNS:</b> un dominio <b>.com.ar</b> en NIC Argentina (por ejemplo tallerruiz.com.ar, a verificar "
                "disponibilidad), con DNS en Cloudflare. Los visitantes escriben el dominio, Cloudflare lo resuelve al servidor "
                "y reenvía el tráfico.",
                "<b>HTTPS y seguridad:</b> certificado de Cloudflare hacia el visitante y de Let's Encrypt (Certbot) hacia el "
                "servidor. Firewall con solo los puertos 22, 80 y 443; SSH con clave y sin contraseña; PostgreSQL accesible "
                "únicamente desde la red interna de Docker; secretos en variables de entorno del servidor, nunca en el "
                "repositorio; token con vencimiento y usuario de base con permisos mínimos.",
                "<b>Base de datos:</b> PostgreSQL en el mismo servidor, con volumen persistente. La administración, las "
                "actualizaciones y las copias están a cargo de la consultora: <b>pg_dump cada noche</b> guardado fuera del "
                "servidor, copias semanales automáticas de DonWeb y una prueba de restauración periódica.",
                "<b>Mantenimiento posterior:</b> actualizaciones del sistema y de la aplicación, monitoreo, renovación de "
                "certificados, control de copias, atención de incidentes y soporte al personal.",
            ]
        )
    )

    # 5. Comparación
    h.append(p("5. Comparación de proveedores", H1))
    h.append(
        p(
            "Precios consultados el <b>6 de noviembre de 2026</b> en las páginas oficiales de cada proveedor, en pesos "
            "argentinos. Se compararon dos alternativas viables:"
        )
    )
    h.append(Spacer(1, 2))
    h.append(
        tabla(
            [
                ["Criterio", "A. Hosting Node.js administrado con base externa", "B. VPS con Docker y base propia"],
                [
                    "<b>Producto</b>",
                    "Hostinger Cloud Startup (4 núcleos, 4 GB de RAM, 100 GB NVMe, 10 aplicaciones) más Supabase Pro",
                    "DonWeb Cloud Server (4 vCPU, 4 GB, 20 GB NVMe). Respaldo: Hostinger VPS KVM 2 (2 vCPU, 8 GB, 100 GB)",
                ],
                [
                    "<b>Compatibilidad</b>",
                    "El hosting menciona solo MySQL: PostgreSQL exige sumar Supabase, otro proveedor y otra moneda",
                    "Con acceso root se instala Node, Docker y PostgreSQL en un solo servidor",
                ],
                [
                    "<b>Costo inicial</b>",
                    "$772.752 por 48 meses por adelantado para el precio promocional",
                    "DonWeb: se paga por mes. Hostinger KVM 2: $415.176 por 24 meses por adelantado",
                ],
                [
                    "<b>Costo recurrente</b>",
                    "Renueva a $52.299 por mes, más USD 25 por mes de Supabase Pro",
                    "DonWeb: $10.966,87 por mes con descuento, $24.370,80 a precio de lista. KVM 2 renueva a $31.399",
                ],
                [
                    "<b>Facilidad</b>",
                    "Alta para el cliente, con dos proveedores que coordinar",
                    "Más trabajo de armado, que hace la consultora una sola vez",
                ],
                [
                    "<b>Mantenimiento</b>",
                    "El proveedor mantiene la plataforma; la base depende de Supabase",
                    "Lo hace la consultora: parches, copias, monitoreo y certificados",
                ],
                [
                    "<b>Seguridad</b>",
                    "Buena base, pero los datos quedan repartidos en dos proveedores y no se verificó en qué país está cada uno",
                    "Control total: firewall, SSH por clave y base sin exposición a Internet",
                ],
                [
                    "<b>Crecimiento</b>",
                    "Cambiar de plan es simple",
                    "DonWeb ajusta recursos por día con un reinicio de 3 a 5 minutos",
                ],
                [
                    "<b>Limitaciones y riesgos</b>",
                    "El plan gratuito de Supabase se pausa tras una semana sin uso y no tiene copias; hay que usar el de pago",
                    "Si nadie mantiene el servidor queda desactualizado y sin respaldo. DonWeb no publica la duración del descuento "
                    "ni el precio de renovación",
                ],
            ],
            [27 * mm, (CONTENT_W - 27 * mm) / 2, (CONTENT_W - 27 * mm) / 2],
        )
    )
    h.append(Spacer(1, 2))
    h.append(
        KeepTogether(
        p(
            "Fuentes: donweb.com/es-ar (Cloud Servers y Node.js), hostinger.com/ar (hosting Node.js y VPS), supabase.com/pricing, "
            "nic.ar/es/dominios/aranceles y cloudflare.com/plans, consultadas el 6/11/2026. Se descartó el hosting compartido: "
            "DonWeb no documenta soporte de Node.js ni PostgreSQL en esos planes y el Unlimited de Hostinger menciona solo MySQL.",
            SMALL,
        )
        )
    )

    # 6. Presupuesto
    h.append(p("6. Presupuesto y mantenimiento", H1))
    h.append(p("Costos de infraestructura (opción B recomendada)", H2))
    promo, lista, dominio = 10966.87, 24370.80, 8500
    h.append(
        tabla(
            [
                ["Concepto", "Precio", "Condiciones"],
                ["Cloud Server con descuento", f"{ars(promo)} por mes", "IVA incluido; no se publica cuánto dura el descuento"],
                ["Cloud Server a precio de lista", f"{ars(lista)} por mes", "Caso más desfavorable"],
                ["Copias semanales y dos snapshots", "Incluidos", "Los snapshots se borran a los 28 días"],
                ["Copias diarias de DonWeb", "A cotizar", "Adicional pago, el precio no está publicado"],
                ["Dominio .com.ar", f"{ars(dominio)} por año", "NIC Argentina; la página no indica fecha"],
                ["DNS, CDN y certificado en Cloudflare", "$0", "Plan Free"],
            ],
            [62 * mm, 34 * mm, CONTENT_W - 96 * mm],
        )
    )
    h.append(Spacer(1, 2))
    h.append(
        p(
            f"<b>Primer año de infraestructura:</b> {ars(promo * 12 + dominio)} con el descuento vigente (equivale a "
            f"{ars((promo * 12 + dominio) / 12)} por mes) o {ars(lista * 12 + dominio)} a precio de lista (equivale a "
            f"{ars((lista * 12 + dominio) / 12)} por mes), sin las copias diarias."
        )
    )
    h.append(p("Costos de implementación (lo que falta después de la prueba de concepto)", H2))
    tareas = [
        ("Relevamiento final y ajustes de la interfaz", 6),
        ("API con PostgreSQL y TypeORM: órdenes, clientes y repuestos", 24),
        ("Front: alta y edición de órdenes, clientes y repuestos", 16),
        ("Autenticación real: usuarios en la base, contraseñas con hash y roles", 6),
        ("Pruebas de lo nuevo y correcciones", 10),
        ("Infraestructura y puesta en producción: servidor, Docker, HTTPS y copias", 9),
        ("Capacitación al personal y documentación", 4),
    ]
    total_horas = sum(t[1] for t in tareas)
    encabezado = ["Tarea", "Horas"] + ([f"Costo ({moneda})"] if vh else [])
    filas = [encabezado]
    for nombre, horas in tareas:
        fila = [nombre, str(horas)]
        if vh:
            fila.append(monto(horas * vh))
        filas.append(fila)
    total = [f"<b>Total del MVP</b>", f"<b>{total_horas}</b>"]
    if vh:
        total.append(f"<b>{monto(total_horas * vh)}</b>")
    filas.append(total)
    anchos = [CONTENT_W - 28 * mm, 28 * mm] if not vh else [CONTENT_W - 28 * mm - 50 * mm, 28 * mm, 50 * mm]
    h.append(tabla(filas, anchos))
    h.append(Spacer(1, 2))
    if vh:
        justificacion = DATOS.get("valor_hora_justificacion") or "sin justificación cargada"
        h.append(p(f"<b>Valor hora de referencia:</b> {monto(vh)}. {justificacion}", SMALL))
        cot = DATOS.get("cotizacion")
        if cot and moneda == "USD":
            f = cot["valor"]
            h.append(
                p(
                    f"<b>Equivalencia en pesos</b> al dólar oficial vendedor de {ars(f)} ({cot['fecha']}, {cot['fuente']}): "
                    f"el MVP equivale a {ars(total_horas * vh * f)} y el mantenimiento a "
                    f"{ars(4 * vh_m * f)} a {ars(8 * vh_m * f)} por mes. La cotización cambia.",
                    SMALL,
                )
            )
        if vh_m != vh:
            justificacion_m = DATOS.get("valor_hora_mantenimiento_justificacion") or "sin justificación cargada"
            h.append(p(f"<b>Valor hora para el mantenimiento:</b> {ars(vh_m)} {moneda}. {justificacion_m}", SMALL))
    else:
        h.append(
            p(
                "<b>Valor hora de referencia: pendiente de definir.</b> El costo de implementación es horas × valor hora, y el "
                "valor se fijará y justificará con una fuente (por ejemplo, honorarios sugeridos de un consejo profesional o "
                "una escala salarial del rubro). Hasta entonces el presupuesto expresa el esfuerzo en horas.",
                NOTE,
            )
        )
    h.append(
        p(
            "<b>Segunda etapa</b> (no incluida): avisos por WhatsApp o correo, 24 a 40 horas; stock y costos de repuestos, "
            "30 a 45 horas; reportes, 16 a 24 horas. Total de 70 a 109 horas."
        )
    )
    h.append(p("Costos recurrentes y quién presta cada servicio", H2))
    mantenimiento = "4 a 8 horas por mes × valor hora" if not vh else f"{monto(4 * vh_m)} a {monto(8 * vh_m)} por mes (4 a 8 horas)"
    h.append(
        tabla(
            [
                ["Concepto", "Por mes", "Lo presta"],
                ["Servidor", f"{ars(promo)} (descuento) o {ars(lista)} (lista)", "DonWeb"],
                ["Dominio", f"{ars(dominio / 12)}", "NIC Argentina"],
                ["DNS, CDN y certificado", "$0", "Cloudflare"],
                ["Copias diarias", "A cotizar", "DonWeb"],
                ["Mantenimiento y soporte", mantenimiento, "La consultora"],
            ],
            [45 * mm, CONTENT_W - 45 * mm - 38 * mm, 38 * mm],
        )
    )
    h.append(Spacer(1, 2))
    h.append(
        p(
            "El mantenimiento incluye actualizaciones, control de copias con una prueba de restauración periódica, monitoreo, "
            "renovación de certificados, atención de incidentes y soporte. Las horas son una estimación a revisar.",
            SMALL,
        )
    )

    # 7. Recomendación
    h.append(p("7. Recomendación final", H1))
    h.append(
        p(
            "Se recomienda la <b>opción B: DonWeb Cloud Server con un plan de mantenimiento de la consultora</b>, y Hostinger "
            "VPS KVM 2 como alternativa de respaldo. Es la única opción que incluye PostgreSQL sin sumar otro proveedor ni "
            "pagar en dólares, se paga por mes sin comprometer 24 o 48 meses por adelantado, tiene los servidores en "
            "Argentina y ofrece acceso root, copias semanales y snapshots. Encaja con un presupuesto mensual reducido y con un "
            "personal que no administra servidores, porque la administración la asume la consultora."
        )
    )
    h.append(Spacer(1, 3))
    h.append(
        p(
            "<b>Respuesta a la pregunta del cliente:</b> «Si contrato el servidor más barato, ¿por qué tendría que pagar además "
            "por mantenimiento?» El precio del servidor cubre el equipo y la red. Con un VPS, los parches del sistema, la "
            "base de datos, los certificados y las copias de seguridad quedan a cargo de quien lo administra: DonWeb monitorea "
            "la red y los nodos, pero las actualizaciones del sistema son responsabilidad del cliente. Sin ese trabajo el "
            "servidor acumula fallas de seguridad conocidas, y con ellas los datos de los clientes quedan expuestos; si un "
            "disco falla o se borra un registro, sin copias probadas no hay cómo recuperarlo. El mantenimiento es el servicio "
            "que evita eso.",
            NOTE,
        )
    )
    h.append(p("Puntos abiertos antes de contratar", H2))
    h.extend(
        bullets(
            [
                "Confirmar por escrito con DonWeb cuánto dura el descuento del 55 % y cuál es el precio de renovación.",
                "Cotizar las copias diarias y verificar la disponibilidad del dominio y la delegación del DNS en NIC Argentina.",
                "Revisar con el cliente las horas estimadas y el valor hora de referencia.",
            ]
        )
    )

    doc.build(h)


if __name__ == "__main__":
    construir()
    print(f"Generado: {SALIDA}")
