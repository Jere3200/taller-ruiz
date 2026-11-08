"""Genera los cuatro cuadros de UX como SVG, listos para importar en Figma.

Uso:  python generar_svg.py     (escribe en la carpeta figma/)

Solo usa atributos de presentación (sin CSS ni marcadores), porque Figma los importa mejor así.
Cada archivo es un cuadro: persona, user flow, wireframe y justificación.
"""

import textwrap
from pathlib import Path
from xml.sax.saxutils import escape

SALIDA = Path(__file__).parent / "figma"
FUENTE = "Inter, Arial, Helvetica, sans-serif"

NAVY, ORANGE = "#01225E", "#E46715"
INK, MUTED, LINE = "#14191C", "#5A6167", "#DEDAD3"
PAPER, SOFT = "#F4F2EE", "#E4EAF5"
OK, OK_BG = "#1E9150", "#DBF1E3"
ERR, ERR_BG = "#D02A31", "#FBE1E1"
WARN, WARN_BG = "#D98A0B", "#FCEFD6"


class Lienzo:
    def __init__(self, ancho, alto, fondo="#FFFFFF"):
        self.ancho, self.alto = ancho, alto
        self.partes = [f'<rect width="{ancho}" height="{alto}" fill="{fondo}"/>']

    def add(self, s):
        self.partes.append(s)

    def rect(self, x, y, w, h, fill="none", stroke="none", rx=0, sw=1, dash=None):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>')

    def circulo(self, cx, cy, r, fill="none", stroke="none", sw=1):
        self.add(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

    def poligono(self, puntos, fill="none", stroke="none", sw=1):
        pts = " ".join(f"{x},{y}" for x, y in puntos)
        self.add(f'<polygon points="{pts}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

    def linea(self, x1, y1, x2, y2, stroke=LINE, sw=1, dash=None):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.add(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}"{d}/>')

    def texto(self, x, y, lineas, size=14, peso="400", fill=INK, ancla="start", interlineado=None, mono=False):
        """Un solo <text> con un <tspan> por línea. `y` es la línea base de la primera línea."""
        if isinstance(lineas, str):
            lineas = [lineas]
        lh = interlineado or round(size * 1.35, 1)
        fam = "Courier New, monospace" if mono else FUENTE
        spans = "".join(
            f'<tspan x="{x}" dy="{0 if i == 0 else lh}">{escape(l)}</tspan>' for i, l in enumerate(lineas)
        )
        self.add(
            f'<text x="{x}" y="{y}" font-family="{fam}" font-size="{size}" font-weight="{peso}" fill="{fill}" text-anchor="{ancla}">{spans}</text>'
        )

    def texto_centrado_vertical(self, cx, cy, lineas, size=14, peso="400", fill=INK):
        lh = round(size * 1.3, 1)
        total = lh * (len(lineas) - 1)
        self.texto(cx, cy - total / 2 + size * 0.35, lineas, size, peso, fill, "middle", lh)

    def flecha(self, puntos, stroke="#3A4147", sw=1.8):
        """Polilínea con punta de flecha en el último tramo (la punta es un polígono, no un marcador)."""
        import math

        pts = " ".join(f"{x},{y}" for x, y in puntos)
        self.add(f'<polyline points="{pts}" fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"/>')
        (x1, y1), (x2, y2) = puntos[-2], puntos[-1]
        ang = math.atan2(y2 - y1, x2 - x1)
        t = 9
        a = (x2 - t * math.cos(ang) + t * 0.5 * math.sin(ang), y2 - t * math.sin(ang) - t * 0.5 * math.cos(ang))
        b = (x2 - t * math.cos(ang) - t * 0.5 * math.sin(ang), y2 - t * math.sin(ang) + t * 0.5 * math.cos(ang))
        self.poligono([(x2, y2), a, b], fill=stroke)

    def guardar(self, nombre):
        SALIDA.mkdir(exist_ok=True)
        cuerpo = "\n  ".join(self.partes)
        svg = (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.ancho}" height="{self.alto}" viewBox="0 0 {self.ancho} {self.alto}">\n'
            f"  {cuerpo}\n</svg>\n"
        )
        (SALIDA / nombre).write_text(svg, encoding="utf-8")
        print("Generado:", SALIDA / nombre)


def envolver(texto, ancho):
    return textwrap.wrap(texto, ancho, break_long_words=False)


# ---------------------------------------------------------------- 1. Persona
def persona():
    c = Lienzo(1240, 820)
    c.rect(0, 0, 1240, 90, fill=NAVY)
    c.texto(40, 40, "USER PERSONA", 13, "700", "#F6A46E")
    c.texto(40, 72, "Luciano Gómez, mecánico encargado del Taller Ruiz", 26, "700", "#FFFFFF")

    # Columna izquierda
    c.rect(40, 120, 300, 660, fill=PAPER, stroke=LINE, rx=10)
    c.circulo(190, 220, 62, fill=NAVY)
    c.texto(190, 232, "LG", 40, "700", "#FFFFFF", "middle")
    c.texto(190, 330, "Luciano Gómez", 22, "700", INK, "middle")
    c.texto(190, 358, "38 años, Villa Crespo", 14, "400", MUTED, "middle")
    c.texto(190, 380, "Mecánico encargado, 15 años en el rubro", 13, "400", MUTED, "middle")

    c.texto(64, 430, "HABILIDAD DIGITAL", 12, "700", MUTED)
    for i, (rotulo, nivel) in enumerate([("Celular y WhatsApp", 5), ("Tablet", 3), ("Computadora", 2), ("Sistemas de gestión", 1)]):
        y = 458 + i * 46
        c.texto(64, y, rotulo, 13, "400", INK)
        for k in range(5):
            c.rect(64 + k * 46, y + 10, 40, 10, fill=NAVY if k < nivel else LINE, rx=3)

    c.rect(64, 650, 252, 112, fill="#FFFFFF", stroke=LINE, rx=8)
    c.texto(76, 674, "Persona ficticia", 12, "700", ORANGE)
    c.texto(76, 692, envolver("Se armó con supuestos sobre el taller, sin entrevistas. Hay que validarla con los empleados reales.", 34), 12, "400", MUTED, interlineado=16)

    # Tarjetas
    tarjetas = [
        (370, 120, "Perfil y contexto", "Coordina el trabajo diario con los otros tres empleados. Pasa el día de pie y con las manos sucias. Usa el celular todo el tiempo, sobre todo WhatsApp, y una tablet que compró el dueño para el taller. La computadora casi no la toca."),
        (810, 120, "Objetivos", "Ver de un vistazo qué vehículos hay y en qué etapa están. Actualizar el estado apenas termina una tarea, sin dejar el trabajo. Que los clientes dejen de llamar para preguntar por su auto."),
        (370, 340, "Necesidades", "Pantalla legible y botones grandes. Encontrar un auto por patente en segundos. Pocos pasos y palabras del taller, no de sistemas. Que el sistema no lo deje equivocarse de etapa."),
        (810, 340, "Dificultades con el sistema actual", "Hoy anota en papel y las hojas se pierden. Los clientes llaman y lo interrumpen varias veces al día. Desconfía de los sistemas complicados y los abandona. Si se equivoca de estado, no sabe cómo corregirlo."),
    ]
    for x, y, titulo, cuerpo in tarjetas:
        c.rect(x, y, 410, 200, fill="#FFFFFF", stroke=LINE, rx=10)
        c.rect(x, y, 6, 200, fill=ORANGE, rx=3)
        c.texto(x + 24, y + 36, titulo, 17, "700", NAVY)
        c.texto(x + 24, y + 68, envolver(cuerpo, 52), 14, "400", INK, interlineado=21)

    # Cita y escenario
    c.rect(370, 560, 850, 90, fill=SOFT, rx=10)
    c.texto(396, 596, "«Quiero marcar que el auto está listo y seguir trabajando.", 19, "700", NAVY)
    c.texto(396, 626, "Si me hace dar muchas vueltas, vuelvo al papel.»", 19, "700", NAVY)

    c.rect(370, 670, 850, 110, fill="#FFFFFF", stroke=LINE, rx=10)
    c.texto(394, 700, "Escenario de uso", 15, "700", ORANGE)
    c.texto(
        394,
        724,
        envolver("Termina el diagnóstico de un Fiat Cronos. Agarra la tablet, busca la patente, abre la orden y pasa el estado a «Esperando aprobación del cliente». Todo en menos de medio minuto y sin dejar de trabajar.", 100),
        14,
        "400",
        INK,
        interlineado=21,
    )
    c.guardar("01-user-persona.svg")


# ---------------------------------------------------------------- 2. User flow
def flujo():
    W, H = 2000, 1700
    OY = 60
    c = Lienzo(W, H)
    X0, X1, X2, X3 = 480, 950, 1420, 1800

    c.texto(40, 44, "User flow: cambiar el estado de una orden de trabajo", 24, "700", NAVY)
    c.texto(40, 70, "Usuario: empleado del taller. Los rombos son decisiones; los colores indican el tipo de paso.", 14, "400", MUTED)

    def terminal(cx, cy, texto, w=300, h=56):
        c.rect(cx - w / 2, cy + OY - h / 2, w, h, fill=NAVY, rx=h / 2)
        c.texto_centrado_vertical(cx, cy + OY, envolver(texto, 34), 15, "700", "#FFFFFF")

    def proceso(cx, cy, texto, tipo="pantalla", w=300, h=70, ancho_txt=32):
        fill, stroke = {"pantalla": (SOFT, NAVY), "sistema": ("#FFF3EA", ORANGE), "error": (ERR_BG, ERR), "ok": (OK_BG, OK)}[tipo]
        c.rect(cx - w / 2, cy + OY - h / 2, w, h, fill=fill, stroke=stroke, rx=8, sw=2)
        c.texto_centrado_vertical(cx, cy + OY, envolver(texto, ancho_txt), 15, "400", INK)

    def decision(cx, cy, texto, w=340, h=124):
        c.poligono([(cx, cy + OY - h / 2), (cx + w / 2, cy + OY), (cx, cy + OY + h / 2), (cx - w / 2, cy + OY)], fill=WARN_BG, stroke=WARN, sw=2)
        c.texto_centrado_vertical(cx, cy + OY, envolver(texto, 22), 14, "700", INK)

    def conector(cx, cy, letra):
        c.circulo(cx, cy + OY, 22, fill="#FFFFFF", stroke=NAVY, sw=2)
        c.texto(cx, cy + OY + 6, letra, 18, "700", NAVY, "middle")

    def f(*pts):
        c.flecha([(x, y + OY) for x, y in pts])

    def rotulo(x, y, s):
        c.texto(x, y + OY, s, 13, "700", MUTED)

    # Nodos
    terminal(X0, 70, "Inicio: el empleado quiere cambiar el estado de una orden")
    decision(X0, 215, "¿Tiene sesión iniciada?")
    proceso(X1, 215, "Pantalla de login: usuario y contraseña")
    decision(X1, 385, "¿Credenciales válidas?")
    proceso(X2, 385, "Aviso: usuario o contraseña incorrectos, sin decir cuál falló", "error", ancho_txt=30)
    proceso(X0, 385, "Tablero de órdenes: resumen y columnas por estado")
    proceso(X0, 520, "Buscar por patente, código o cliente, o filtrar por estado")
    proceso(X0, 640, "Abrir el detalle de la orden")
    decision(X0, 785, "¿La orden tiene estados siguientes?")
    proceso(X1, 785, "Se muestra «Orden finalizada»: no admite cambios", "pantalla")
    terminal(X1, 925, "Fin", w=200)
    proceso(X0, 930, "Elegir el nuevo estado entre los botones ofrecidos")
    decision(X0, 1070, "¿Es Cancelar o Entregar?")
    proceso(X1, 1070, "Diálogo de confirmación: explica que la orden queda cerrada", "pantalla", ancho_txt=30)
    decision(X2, 1070, "¿Confirma?")
    proceso(X0, 1225, "Enviar el cambio al servidor", "sistema")
    decision(X0, 1375, "¿Qué responde la API?")
    proceso(X1, 1375, "Aviso de éxito. Se muestra la orden actualizada y su historial", "ok", ancho_txt=32)
    proceso(X2, 1375, "Opcional: copiar el link de seguimiento para el cliente", "pantalla", ancho_txt=30)
    terminal(X3, 1375, "Fin", w=170)
    proceso(X0, 1510, "Aviso con el mensaje de la API. El estado no cambia", "error", ancho_txt=34)
    proceso(160, 1375, "Se borra la sesión y se vuelve al login con el aviso «Tu sesión expiró»", "error", w=240, h=96, ancho_txt=22)
    conector(160, 1466, "A")
    conector(X1, 110, "A")

    # Flechas principales
    f((X0, 98), (X0, 153))
    rotulo(X0 + 10, 148, "")
    f((X0 + 170, 215), (X1 - 150, 215))
    rotulo(X0 + 250, 205, "No")
    f((X0, 277), (X0, 350))
    rotulo(X0 + 10, 318, "Sí")
    f((X1, 250), (X1, 323))
    f((X1 - 170, 385), (X0 + 150, 385))
    rotulo(X0 + 250, 375, "Sí")
    f((X1 + 170, 385), (X2 - 150, 385))
    rotulo(X1 + 195, 375, "No")
    f((X2, 350), (X2, 215), (X1 + 150, 215))
    f((X0, 420), (X0, 485))
    f((X0, 555), (X0, 605))
    f((X0, 675), (X0, 723))
    f((X0 + 170, 785), (X1 - 150, 785))
    rotulo(X0 + 225, 775, "No")
    f((X1, 820), (X1, 897))
    f((X0, 847), (X0, 895))
    rotulo(X0 + 10, 878, "Sí")
    f((X0, 965), (X0, 1008))
    f((X0 + 170, 1070), (X1 - 150, 1070))
    rotulo(X0 + 225, 1060, "Sí")
    f((X1 + 150, 1070), (X2 - 170, 1070))
    f((X2, 1008), (X2, 640), (X0 + 150, 640))
    rotulo(X2 + 12, 1000, "No: vuelve al detalle")
    f((X0, 1132), (X0, 1190))
    rotulo(X0 + 10, 1165, "No")
    f((X2, 1132), (X2, 1225), (X0 + 150, 1225))
    rotulo(X2 + 12, 1160, "Sí")
    f((X0, 1260), (X0, 1313))
    f((X0 + 170, 1375), (X1 - 150, 1375))
    rotulo(X0 + 180, 1365, "Éxito (200)")
    f((X1 + 150, 1375), (X2 - 150, 1375))
    f((X2 + 150, 1375), (X3 - 85, 1375))
    f((X0, 1437), (X0, 1475))
    rotulo(X0 + 10, 1460, "Transición inválida (422)")
    f((X0 - 170, 1375), (160 + 120, 1375))
    rotulo(X0 - 194, 1360, "401")
    f((160, 1423), (160, 1443))
    f((X0 - 150, 1510), (18, 1510), (18, 930), (X0 - 150, 930))
    rotulo(28, 1190, "Vuelve a elegir")
    f((X1, 132), (X1, 180))

    # Leyenda
    lx, ly = 1500, 40
    c.rect(lx, ly, 440, 190, fill=PAPER, stroke=LINE, rx=10)
    c.texto(lx + 20, ly + 30, "Referencias", 14, "700", NAVY)
    items = [
        (NAVY, NAVY, "Inicio o fin", "terminal"),
        (SOFT, NAVY, "Pantalla o paso del usuario", "caja"),
        ("#FFF3EA", ORANGE, "Acción del sistema", "caja"),
        (WARN_BG, WARN, "Decisión", "rombo"),
        (ERR_BG, ERR, "Error o aviso", "caja"),
        (OK_BG, OK, "Éxito", "caja"),
    ]
    for i, (fill, stroke, rot, tipo) in enumerate(items):
        col, fila = divmod(i, 3)
        x, y = lx + 20 + col * 210, ly + 54 + fila * 40
        if tipo == "rombo":
            c.poligono([(x + 14, y), (x + 28, y + 12), (x + 14, y + 24), (x, y + 12)], fill=fill, stroke=stroke, sw=2)
        else:
            c.rect(x, y, 28, 24, fill=fill, stroke=stroke, rx=12 if tipo == "terminal" else 4, sw=2)
        c.texto(x + 38, y + 17, rot, 13, "400", INK)
    c.texto(lx + 20, ly + 176, "A: conector, continúa en el login", 13, "400", MUTED)
    c.guardar("02-user-flow.svg")


# ---------------------------------------------------------------- 3. Wireframe
def wireframe():
    W, H = 1400, 1040
    c = Lienzo(W, H, "#FFFFFF")
    G1, G2, G3, G4 = "#F5F5F5", "#E6E6E6", "#BDBDBD", "#8A8A8A"
    T = "#333333"

    c.texto(40, 40, "Wireframe detallado: tablero de órdenes (tablet o computadora)", 22, "700", T)
    c.texto(40, 66, "Versión con más detalle de la pantalla 1. Los números naranjas se explican abajo y en la justificación.", 13, "400", "#666666")

    ox, oy, aw, ah = 40, 90, 1320, 700
    c.rect(ox, oy, aw, ah, fill="#FFFFFF", stroke=G4, rx=6, sw=2)

    # Barra lateral
    c.rect(ox, oy, 210, ah, fill=G2, stroke=G4, sw=1)
    c.rect(ox + 20, oy + 20, 170, 44, fill=G3, stroke=G4, sw=1)
    c.texto(ox + 105, oy + 48, "LOGO", 15, "700", T, "middle")
    c.rect(ox + 14, oy + 90, 182, 44, fill=G3, stroke=T, sw=2)
    c.texto(ox + 34, oy + 118, "Órdenes", 15, "700", T)
    c.rect(ox + 14, oy + 144, 182, 44, fill="none", stroke=G4, sw=1)
    c.texto(ox + 34, oy + 172, "Ver sitio público", 15, "400", T)

    # Barra superior
    c.rect(ox + 210, oy, aw - 210, 60, fill=G1, stroke=G4, sw=1)
    c.texto(ox + 236, oy + 38, "Órdenes", 16, "700", T)
    c.circulo(ox + aw - 330, oy + 30, 17, fill=G3, stroke=G4)
    c.texto(ox + aw - 302, oy + 36, "Nombre del empleado", 14, "400", T)
    c.rect(ox + aw - 150, oy + 12, 130, 36, fill="#FFFFFF", stroke=G4, rx=4, sw=1)
    c.texto(ox + aw - 85, oy + 36, "Cerrar sesión", 13, "400", T, "middle")

    # Título
    cx0 = ox + 240
    c.texto(cx0, oy + 112, "Órdenes", 28, "700", T)
    c.texto(cx0, oy + 138, "N órdenes activas en el taller", 14, "400", "#666666")
    c.rect(ox + aw - 160, oy + 90, 130, 40, fill="#FFFFFF", stroke=G4, rx=4)
    c.texto(ox + aw - 95, oy + 116, "Actualizar", 14, "400", T, "middle")

    # Resumen
    for i, (rot, hint) in enumerate([("En diagnóstico", "Incluye recibidas y esperando aprobación"), ("En reparación", "Trabajo en curso"), ("Esperando repuestos", "En pausa hasta que lleguen"), ("Listas para retirar", "Coordinar el retiro con el cliente")]):
        x = cx0 + i * 262
        c.rect(x, oy + 160, 248, 96, fill=G1, stroke=G4, rx=6)
        c.circulo(x + 18, oy + 182, 5, fill=G4)
        c.texto(x + 30, oy + 187, rot, 13, "700", T)
        c.texto(x + 18, oy + 226, "0", 30, "700", T)
        c.texto(x + 18, oy + 246, hint, 11, "400", "#666666")

    # Herramientas
    c.rect(cx0, oy + 276, 420, 42, fill="#FFFFFF", stroke=G4, rx=4)
    c.texto(cx0 + 44, oy + 303, "Buscar por patente, código o cliente", 14, "400", "#777777")
    c.circulo(cx0 + 22, oy + 297, 8, stroke=G4, sw=2)
    c.rect(cx0 + 436, oy + 276, 220, 42, fill="#FFFFFF", stroke=G4, rx=4)
    c.texto(cx0 + 452, oy + 303, "Todos los estados", 14, "400", T)
    c.poligono([(cx0 + 628, oy + 292), (cx0 + 642, oy + 292), (cx0 + 635, oy + 302)], fill=T)
    c.rect(cx0 + 672, oy + 276, 200, 42, fill=G2, stroke=G4, rx=4)
    c.rect(cx0 + 676, oy + 280, 96, 34, fill="#FFFFFF", stroke=G4, rx=3)
    c.texto(cx0 + 724, oy + 303, "Columnas", 13, "700", T, "middle")
    c.texto(cx0 + 822, oy + 303, "Tabla", 13, "400", T, "middle")

    # Columnas kanban
    columnas = [("Recibido", 1), ("En diagnóstico", 2), ("Esperando aprobación", 1), ("En reparación", 2)]
    for i, (nombre, n) in enumerate(columnas):
        x = cx0 + i * 262
        c.rect(x, oy + 342, 248, 336, fill=G2, stroke=G4, rx=6)
        c.circulo(x + 20, oy + 366, 5, fill=G4)
        c.texto(x + 32, oy + 371, nombre, 14, "700", T)
        c.rect(x + 200, oy + 355, 34, 22, fill="#FFFFFF", stroke=G4, rx=11)
        c.texto(x + 217, oy + 371, str(n), 12, "700", T, "middle")
        for k in range(n):
            y = oy + 392 + k * 140
            c.rect(x + 10, y, 228, 128, fill="#FFFFFF", stroke=G4, rx=5)
            c.texto(x + 24, y + 28, "TR-0000", 13, "700", T)
            c.texto(x + 226, y + 28, "hace 35 min", 11, "400", "#777777", "end")
            c.texto(x + 24, y + 56, "Marca y modelo", 15, "700", T)
            c.texto(x + 24, y + 78, "Nombre del cliente", 13, "400", "#666666")
            c.rect(x + 24, y + 92, 84, 24, fill="#FFFFFF", stroke=T, rx=3, sw=1.5)
            c.texto(x + 66, y + 109, "AB 123 CD", 12, "700", T, "middle")
    # Columna cortada
    x = cx0 + 4 * 262
    c.rect(x, oy + 342, 60, 336, fill=G2, stroke=G4, rx=6, dash="6 4")
    c.texto(x + 30, oy + 520, "→", 22, "400", G4, "middle")

    # Marcadores
    marcas = [
        (ox + 196, oy + 112, "1"),
        (cx0 + 248 * 2 + 150, oy + 150, "2"),
        (cx0 + 430, oy + 262, "3"),
        (cx0 + 880, oy + 262, "4"),
        (cx0 + 262 + 30, oy + 340, "5"),
        (cx0 + 262 + 238, oy + 392, "6"),
    ]
    for x, y, n in marcas:
        c.circulo(x, y, 14, fill=ORANGE, stroke="#FFFFFF", sw=2)
        c.texto(x, y + 5, n, 14, "700", "#FFFFFF", "middle")

    # Leyenda
    leyenda = [
        ("1", "Navegación: solo dos destinos, para no perderse."),
        ("2", "Resumen: cuántas órdenes hay en cada etapa, para saber qué atender primero."),
        ("3", "Búsqueda por patente, código o cliente, y filtro por estado."),
        ("4", "Cambio de vista: columnas por estado o tabla."),
        ("5", "Una columna por estado: es el proceso real del taller, de izquierda a derecha."),
        ("6", "Tarjeta de la orden: código, vehículo, cliente y patente. Un clic abre el detalle."),
    ]
    c.texto(40, 830, "Referencias", 15, "700", T)
    for i, (n, s) in enumerate(leyenda):
        col, fila = divmod(i, 3)
        x, y = 40 + col * 660, 862 + fila * 40
        c.circulo(x + 14, y - 5, 12, fill=ORANGE)
        c.texto(x + 14, y, n, 13, "700", "#FFFFFF", "middle")
        c.texto(x + 36, y, envolver(s, 74), 13, "400", T, interlineado=17)
    c.guardar("03-wireframe-tablero.svg")


# ---------------------------------------------------------------- 4. Justificación
def justificacion():
    c = Lienzo(1240, 1010)
    c.rect(0, 0, 1240, 110, fill=NAVY)
    c.texto(40, 44, "JUSTIFICACIÓN DE DISEÑO", 13, "700", "#F6A46E")
    c.texto(40, 80, "Cambiar el estado de una orden: tablero y detalle", 26, "700", "#FFFFFF")

    bloques = [
        (
            "Facilidad de uso",
            [
                "Botones y campos grandes, pensados para una tablet usada en el taller, con las manos sucias.",
                "La búsqueda por patente (3 en el wireframe detallado) responde a lo que el empleado tiene a mano frente al vehículo.",
                "Los botones dicen lo que pasa, con las palabras del taller: «Pasar a En reparación», no «Actualizar registro».",
                "Desde el tablero se llega al cambio en tres pasos: abrir la orden, elegir el estado y, si hace falta, confirmar.",
            ],
        ),
        (
            "Organización de la información",
            [
                "Primero el resumen (2): qué hay y en qué etapa, antes que el detalle de cada auto.",
                "Una columna por estado (5): el tablero repite el proceso real, de izquierda a derecha.",
                "La tarjeta (6) muestra solo lo que sirve para reconocer el auto: código, vehículo, cliente y patente.",
                "El estado se dice con texto y con color, nunca solo con color. En el detalle, el estado actual va destacado y el historial debajo.",
            ],
        ),
        (
            "Prevención de errores",
            [
                "Solo se ofrecen los estados válidos desde el actual. Quien decide es la API, así que la interfaz no puede inventar saltos.",
                "Cancelar y entregar cierran la orden: piden confirmación y explican qué va a pasar.",
                "Si el servidor rechaza un cambio, se muestra su mensaje y el estado no cambia: no hay datos a medias.",
                "Si la sesión vence, se vuelve al login con un aviso claro. El seguimiento público nunca muestra nombre ni teléfono del cliente.",
            ],
        ),
    ]
    y = 140
    for titulo, items in bloques:
        c.rect(40, y, 1160, 224, fill="#FFFFFF", stroke=LINE, rx=10)
        c.rect(40, y, 8, 224, fill=ORANGE, rx=4)
        c.texto(72, y + 40, titulo, 20, "700", NAVY)
        yy = y + 72
        for it in items:
            lineas = envolver(it, 118)
            c.circulo(78, yy - 5, 4, fill=ORANGE)
            c.texto(94, yy, lineas, 14.5, "400", INK, interlineado=20)
            yy += 20 * len(lineas) + 11
        y += 244

    c.rect(40, y + 2, 1160, 84, fill=SOFT, rx=10)
    c.texto(64, y + 32, "Las decisiones parten de la persona Luciano y de las restricciones del cliente: presupuesto reducido, personal sin conocimientos técnicos y datos de clientes que hay que proteger.", 13.5, "400", NAVY)
    c.texto(64, y + 56, "Limitación: son decisiones de diseño sin pruebas con usuarios. Se validarían con los empleados reales en la prueba piloto.", 13.5, "700", NAVY)
    c.guardar("04-justificacion.svg")


if __name__ == "__main__":
    persona()
    flujo()
    wireframe()
    justificacion()
