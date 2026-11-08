/**
 * Genera las diapositivas de la defensa (8 en total, 2 por integrante) en diapositivas-taller-ruiz.pptx.
 *
 * Uso:  npm install && npm run generar
 *
 * Además escribe una vista previa aproximada en vista-previa/*.svg y avisa por consola si algún texto
 * parece no entrar en su caja. La vista previa usa otra fuente que PowerPoint (Calibri), así que es una
 * guía de composición y no una imagen exacta: conviene abrir el .pptx y mirarlo antes de la defensa.
 */
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const DATOS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "propuesta", "datos.json"), "utf8"));
const [JERE, ADRIAN, RENZO, ROCIO] = DATOS.integrantes;
const SALIDA = path.join(__dirname, "diapositivas-taller-ruiz.pptx");
const PREVIA = path.join(__dirname, "vista-previa");

const C = {
  navy: "01225E", navyDeep: "010E2C", navyCard: "0A2D70", orange: "E46715", orangeText: "B34A00", orangeSoft: "F6A46E",
  paper: "F4F2EE", soft: "E4EAF5", line: "DEDAD3", ink: "14191C", muted: "5A6167", white: "FFFFFF", pale: "C9D4EA",
  ok: "1E9150", okBg: "DBF1E3", err: "A4161E", errBg: "FBE1E1",
};
const FUENTE = "Calibri";
const W = 13.333, H = 7.5;

// ---------------------------------------------------------------- estimación de texto (para el chequeo y la vista previa)
const PT = 72;
function anchoCar(size, bold) {
  return (size * (bold ? 0.57 : 0.52)) / PT; // pulgadas por carácter, a propósito algo conservador
}
function envolver(texto, anchoIn, size, bold) {
  const max = Math.max(1, Math.floor(anchoIn / anchoCar(size, bold)));
  const lineas = [];
  for (const parrafo of String(texto).split("\n")) {
    let actual = "";
    for (const palabra of parrafo.split(" ")) {
      const prueba = actual ? actual + " " + palabra : palabra;
      if (prueba.length > max && actual) {
        lineas.push(actual);
        actual = palabra;
      } else actual = prueba;
    }
    lineas.push(actual);
  }
  return lineas;
}
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------------------------------------------------------------- presentación y layouts
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Taller Ruiz: defensa del parcial";
pres.author = DATOS.consultora;
pres.company = DATOS.consultora;
pres.subject = "Segundo parcial integrador, Construcción de Sitios Web II, Grupo 2";

const placeholderTitulo = (color, extra = {}) => ({
  placeholder: {
    options: { name: "title", type: "title", x: 0.6, y: 0.4, w: 12.1, h: 0.95, fontFace: FUENTE, fontSize: 36, bold: true, color, align: "left", valign: "top", margin: 0, ...extra },
    text: "",
  },
});
pres.defineSlideMaster({
  title: "CLARA",
  background: { color: C.white },
  objects: [placeholderTitulo(C.navy)],
  slideNumber: { x: 12.2, y: 7.0, w: 0.6, h: 0.3, fontFace: FUENTE, fontSize: 12, color: C.muted },
});
pres.defineSlideMaster({
  title: "OSCURA",
  background: { color: C.navy },
  objects: [placeholderTitulo(C.white)],
  slideNumber: { x: 12.2, y: 7.0, w: 0.6, h: 0.3, fontFace: FUENTE, fontSize: 12, color: C.pale },
});
pres.defineSlideMaster({
  title: "PORTADA",
  background: { color: C.navy },
  objects: [placeholderTitulo(C.white, { x: 0.8, y: 1.75, w: 7.4, h: 1.3, fontSize: 60 })],
});

const diapositivas = [];
const avisos = [];

function nueva(masterName, titulo, presenta, notas) {
  const slide = pres.addSlide({ masterName });
  const el = [];
  const n = diapositivas.length + 1;
  const dark = masterName !== "CLARA";
  slide.addText(titulo, { placeholder: "title" });
  slide.addNotes(`Presenta: ${presenta}. Tiempo: 1 minuto y 15 segundos.\n\n${notas}`);

  const api = {
    rect(x, y, w, h, o = {}) {
      const { fill, line, lw = 1, radius = 0, dash, transp } = o;
      slide.addShape(radius ? pres.ShapeType.roundRect : pres.ShapeType.rect, {
        x, y, w, h,
        fill: fill ? { color: fill, ...(transp ? { transparency: transp } : {}) } : { type: "none" },
        line: line ? { color: line, width: lw, ...(dash ? { dashType: dash } : {}) } : { type: "none" },
        ...(radius ? { rectRadius: radius } : {}),
      });
      el.push({ k: "rect", x, y, w, h, fill, line, lw, radius, dash });
    },
    elipse(x, y, w, h, o = {}) {
      const { fill, line, lw = 1 } = o;
      slide.addShape(pres.ShapeType.ellipse, { x, y, w, h, fill: fill ? { color: fill } : { type: "none" }, line: line ? { color: line, width: lw } : { type: "none" } });
      el.push({ k: "ellipse", x, y, w, h, fill, line, lw });
    },
    linea(x1, y1, x2, y2, o = {}) {
      const { color = C.muted, lw = 1.5, flecha = false, dash } = o;
      slide.addShape(pres.ShapeType.line, {
        x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
        flipH: x2 < x1, flipV: y2 < y1,
        line: { color, width: lw, ...(flecha ? { endArrowType: "triangle" } : {}), ...(dash ? { dashType: dash } : {}) },
      });
      el.push({ k: "line", x1, y1, x2, y2, color, lw, flecha, dash });
    },
    imagen(file, x, y, w, h) {
      slide.addImage({ path: path.join(__dirname, "img", file), x, y, w, h });
      el.push({ k: "img", file, x, y, w, h });
    },
    /** parrafos: string o array de { t, b, c, s, bullet, after }. */
    texto(parrafos, x, y, w, h, o = {}) {
      const { size = 16, color = dark ? C.white : C.ink, bold = false, align = "left", valign = "top", italic = false } = o;
      const ps = (Array.isArray(parrafos) ? parrafos : [parrafos]).map((p) => (typeof p === "string" ? { t: p } : p));
      const runs = ps.map((p, i) => ({
        text: p.t,
        options: {
          fontFace: FUENTE, fontSize: p.s || size, color: p.c || color, bold: p.b ?? bold, italic: p.i ?? italic, align,
          ...(p.bullet ? { bullet: { indent: 16 } } : {}),
          ...(p.after !== undefined ? { paraSpaceAfter: p.after } : {}),
          breakLine: i < ps.length - 1,
        },
      }));
      slide.addText(runs, { x, y, w, h, margin: 4, valign, isTextBox: true });
      el.push({ k: "text", ps, x, y, w, h, size, color, bold, align, valign });
      // chequeo de ajuste
      const inner = w - 8 / PT;
      let alto = 0;
      for (const p of ps) {
        const s = p.s || size;
        const b = p.b ?? bold;
        const ancho = inner - (p.bullet ? 16 / PT : 0);
        alto += envolver(p.t, ancho, s, b).length * ((s * 1.2) / PT) + ((p.after || 0) / PT);
      }
      if (alto > h - 8 / PT + 0.02) {
        avisos.push(`Diapositiva ${n}: el texto "${ps[0].t.slice(0, 40)}" necesita ~${alto.toFixed(2)} pulgadas y la caja mide ${h.toFixed(2)}`);
      }
    },
    tabla(filas, x, y, w, colW, o = {}) {
      const { size = 13, rowH = 0.5 } = o;
      const rows = filas.map((fila, r) =>
        fila.map((celda) => ({
          text: celda,
          options: {
            fontFace: FUENTE, fontSize: size, bold: r === 0 || false, color: r === 0 ? C.white : C.ink,
            fill: { color: r === 0 ? C.navy : r % 2 === 0 ? C.paper : C.white },
            valign: "middle", margin: [3, 5, 3, 5], border: { type: "solid", color: C.line, pt: 0.75 },
          },
        })),
      );
      slide.addTable(rows, { x, y, w, colW, rowH });
      el.push({ k: "tabla", filas, x, y, w, colW, size, rowH });
    },
    titulo: titulo,
  };
  diapositivas.push({ n, el, dark, titulo, master: masterName });
  return api;
}

const pie = (api, presenta) => api.texto(`Presenta: ${presenta}`, 0.6, 6.98, 6, 0.32, { size: 12, color: api.dark ? C.pale : C.muted });

// ================================================================ 1. Portada (Jeremías)
{
  const s = nueva("PORTADA", "Taller Ruiz", JERE,
    `Buenas tardes. Somos el Grupo 2 de ${DATOS.consultora}. Nos contactó Daniel Ruiz, dueño de un taller mecánico de cuatro empleados, que hoy registra las órdenes de trabajo en papel y recibe llamadas de clientes que quieren saber cómo va su vehículo.\n\nVamos a mostrarles el diagnóstico, la solución que proponemos, el diseño de la interfaz, una prueba de concepto que funciona, cómo la probamos, cómo la publicaríamos y cuánto costaría. Cada uno de los cuatro presenta dos diapositivas: yo, Adrián, Renzo y Rocío.`);
  s.dark = true;
  s.texto("PROPUESTA TÉCNICO-COMERCIAL", 0.8, 1.25, 7.4, 0.4, { size: 16, color: C.orangeSoft, bold: true });
  s.texto("Sistema de gestión de reparaciones", 0.8, 3.0, 7.4, 0.7, { size: 26, color: C.pale });
  s.texto(`${DATOS.consultora}, Grupo 2`, 0.8, 3.85, 7.4, 0.45, { size: 20, color: C.orangeSoft, bold: true });
  const equipo = [
    [JERE, "contexto, solución y UX"], [ADRIAN, "demostración y testing"], [RENZO, "arquitectura y despliegue"], [ROCIO, "presupuesto y cierre"],
  ];
  equipo.forEach(([nombre, rol], i) => {
    s.texto([{ t: nombre, b: true, s: 18, c: C.white }], 0.8, 4.5 + i * 0.48, 3.6, 0.45, { size: 18 });
    s.texto(rol, 4.2, 4.54 + i * 0.48, 4.0, 0.42, { size: 16, color: C.pale });
  });
  s.texto("Segundo parcial integrador, Construcción de Sitios Web II. Tecnicatura Superior en Analista de Sistemas, IRESM Nivel Superior, 2026. Docente: María Florencia García Zavia.", 0.8, 6.65, 11.6, 0.6, { size: 13, color: "A9B9DA" });

  // Ticket de ejemplo: la misma orden que se ve en el seguimiento
  const x = 8.85, y = 1.35, w = 3.9;
  s.rect(x, y, w, 4.95, { fill: C.paper, radius: 0.18 });
  s.texto("ORDEN DE TRABAJO", x + 0.3, y + 0.3, 2.2, 0.35, { size: 12, color: C.muted, bold: true });
  s.texto("TR-1042", x + 2.3, y + 0.3, 1.3, 0.35, { size: 14, color: C.ink, bold: true, align: "right" });
  s.texto("Fiat Cronos", x + 0.3, y + 0.85, 3.3, 0.7, { size: 30, color: C.navy, bold: true });
  s.rect(x + 0.3, y + 1.7, 1.45, 0.42, { fill: C.white, line: C.ink, lw: 1.5, radius: 0.05 });
  s.texto("***2KD", x + 0.3, y + 1.72, 1.45, 0.38, { size: 14, color: C.ink, bold: true, align: "center", valign: "middle" });
  s.linea(x + 0.3, y + 2.45, x + w - 0.3, y + 2.45, { color: "C9C5BD", lw: 1.5, dash: "dash" });
  s.texto("ESTADO ACTUAL", x + 0.3, y + 2.7, 3.2, 0.35, { size: 12, color: C.muted, bold: true });
  s.elipse(x + 0.32, y + 3.2, 0.2, 0.2, { fill: "0E7A8C" });
  s.texto("En reparación", x + 0.62, y + 3.05, 3.0, 0.5, { size: 22, color: "0B5563", bold: true, valign: "middle" });
  for (let i = 0; i < 6; i++) {
    s.rect(x + 0.3 + i * 0.55, y + 3.8, 0.5, 0.14, { fill: i < 3 ? C.navy : i === 3 ? "0E7A8C" : C.line, radius: 0.04 });
  }
  s.texto("Paso 4 de 6", x + 0.3, y + 4.1, 1.7, 0.35, { size: 13, color: C.muted });
  s.texto("Así lo ve el cliente", x + 1.6, y + 4.1, 2.0, 0.35, { size: 13, color: C.muted, align: "right" });
}

// ================================================================ 2. Problema y solución (Jeremías)
{
  const s = nueva("CLARA", "El problema y la solución", JERE,
    `Taller Ruiz tiene cuatro empleados y un problema concreto: la información de cada reparación vive en papeles y en la memoria del personal. Los clientes llaman para saber cómo va su vehículo, cada llamada ocupa a alguien y no queda historial.\n\nNuestra propuesta es una aplicación web con dos partes: un sitio público donde el cliente consulta el estado con un código, y un panel interno donde los empleados cambian el estado. El sistema solo deja avanzar por estados válidos: no se puede pasar de diagnóstico a listo para retirar. El MVP incluye seguimiento, ingreso con roles, tablero, alta y edición de órdenes y repuestos básicos. Los avisos por WhatsApp, el stock y los reportes quedan para una segunda etapa.`);
  s.rect(0.6, 1.55, 5.75, 2.5, { fill: C.paper, radius: 0.12 });
  s.texto([
    { t: "HOY", b: true, s: 14, c: C.orangeText, after: 6 },
    { t: "Las órdenes de trabajo están en papel", bullet: true, after: 4 },
    { t: "Los clientes llaman para saber cómo va su vehículo", bullet: true, after: 4 },
    { t: "El estado vive en la memoria del personal, sin historial", bullet: true },
  ], 0.85, 1.7, 5.3, 2.2, { size: 16, color: C.ink });
  s.rect(6.95, 1.55, 5.78, 2.5, { fill: C.soft, radius: 0.12 });
  s.texto([
    { t: "LA SOLUCIÓN", b: true, s: 14, c: C.orangeText, after: 6 },
    { t: "Sitio público: el cliente consulta con un código", bullet: true, after: 4 },
    { t: "Panel interno: los empleados cambian el estado", bullet: true, after: 4 },
    { t: "Solo transiciones válidas: no se saltean etapas", bullet: true },
  ], 7.2, 1.7, 5.3, 2.2, { size: 16, color: C.ink });
  s.linea(6.4, 2.8, 6.9, 2.8, { color: C.orange, lw: 3, flecha: true });

  const estados = [
    ["Recibido", "E7EAEC", "3F4A52"], ["En diagnóstico", "E2EAF9", "1E4FA8"], ["Esperando aprobación", "FCEFD6", "8A4B00"],
    ["En reparación", "DCEFF2", "0B5563"], ["Listo para retirar", "DBF1E3", "14683A"], ["Entregado", "E3E5E6", "2B3338"],
  ];
  estados.forEach(([t, bg, fg], i) => {
    const x = 0.6 + i * 2.05;
    s.rect(x, 4.3, 1.85, 0.72, { fill: bg, radius: 0.36 });
    s.texto(t, x, 4.3, 1.85, 0.72, { size: 14, color: fg, bold: true, align: "center", valign: "middle" });
  });
  s.texto("Se puede cancelar hasta que el vehículo esté listo", 0.6, 5.07, 8, 0.35, { size: 14, color: C.muted });

  s.rect(0.6, 5.5, 5.75, 1.3, { fill: C.white, line: C.navy, lw: 1.5, radius: 0.1 });
  s.texto([
    { t: "MVP", b: true, s: 14, c: C.navy, after: 2 },
    { t: "Seguimiento público, ingreso con roles, tablero con búsqueda, alta y edición de órdenes, historial y repuestos básicos", s: 14 },
  ], 0.8, 5.58, 5.35, 1.15, { size: 14 });
  s.rect(6.95, 5.5, 5.78, 1.3, { fill: C.white, line: C.line, lw: 1.5, radius: 0.1, dash: "dash" });
  s.texto([
    { t: "SEGUNDA ETAPA", b: true, s: 14, c: C.muted, after: 2 },
    { t: "Avisos por WhatsApp o correo, stock y costos de repuestos, y reportes", s: 14 },
  ], 7.15, 5.58, 5.4, 1.15, { size: 14 });
  pie(s, JERE);
}

// ================================================================ 3. UX (Jeremías)
{
  const s = nueva("CLARA", "UX/UI: persona, flujo y wireframe", JERE,
    `Elegimos como funcionalidad principal cambiar el estado de una orden de trabajo. Diseñamos para Luciano Gómez, un mecánico encargado de 38 años que pasa el día de pie, con las manos sucias, y usa más el celular y la tablet que la computadora. Es una persona ficticia, armada con supuestos: la validaríamos con los empleados reales.\n\nEl user flow tiene seis decisiones, entre ellas si hay sesión iniciada, si el estado tiene siguientes y si el empleado confirma cuando cancela o entrega. A la derecha ven el wireframe del tablero: un resumen arriba, búsqueda por patente, y una columna por cada estado del proceso real del taller.\n\nPensamos en tres cosas: facilidad de uso con botones grandes y palabras del taller, información organizada como el proceso, y prevención de errores: solo se ofrecen los estados válidos y se pide confirmación al cerrar una orden.`);
  s.imagen("wireframe-tablero.png", 0.6, 1.5, 8.0, 4.3);
  s.texto("Wireframe detallado del tablero de órdenes", 0.6, 5.82, 8.0, 0.32, { size: 12, color: C.muted });
  s.texto("1 Navegación, 2 Resumen por etapa, 3 Búsqueda y filtro, 4 Vista en columnas o tabla, 5 Columna por estado, 6 Tarjeta de la orden", 0.6, 6.15, 8.0, 0.65, { size: 13, color: C.ink });
  s.rect(8.9, 1.5, 3.83, 1.55, { fill: C.paper, radius: 0.1 });
  s.texto([
    { t: "Persona: Luciano Gómez", b: true, s: 14, c: C.navy, after: 2 },
    { t: "38 años, mecánico encargado. Usa más el celular y la tablet que la computadora", s: 14 },
  ], 9.05, 1.57, 3.55, 1.45, { size: 14 });
  s.rect(8.9, 3.2, 3.83, 1.55, { fill: C.paper, radius: 0.1 });
  s.texto([
    { t: "User flow con 6 decisiones", b: true, s: 14, c: C.navy, after: 2 },
    { t: "Sesión, credenciales, estados siguientes, confirmación y respuesta del servidor", s: 14 },
  ], 9.05, 3.27, 3.55, 1.45, { size: 14 });
  s.rect(8.9, 4.9, 3.83, 1.9, { fill: C.soft, radius: 0.1 });
  s.texto([
    { t: "Decisiones de diseño", b: true, s: 14, c: C.navy, after: 4 },
    { t: "Botones grandes, palabras del taller", bullet: true, after: 3 },
    { t: "Una columna por estado", bullet: true, after: 3 },
    { t: "Solo estados válidos y confirmación", bullet: true },
  ], 9.05, 4.97, 3.55, 1.78, { size: 14 });
  pie(s, JERE);
}

// ================================================================ 4. Demostración (Adrián)
{
  const s = nueva("CLARA", "Demostración de la prueba de concepto", ADRIAN,
    `Ahora la demostración en vivo, con la API y el front corriendo en esta computadora. Los datos son de ejemplo y están en memoria: lo aclaramos en el README.\n\nPrimero, el cliente: abre el seguimiento con el código TR-1042 y ve el estado, el progreso y el historial, sin iniciar sesión y sin datos personales. Segundo, el empleado entra al panel, abre la orden y cambia el estado: el botón solo ofrece los estados válidos. Tercero, probamos un salto inválido desde Postman o Thunder Client: la API responde 422, informa qué estados sí se pueden elegir y la orden no cambia.\n\nPor detrás hay 87 pruebas de la API y 82 del front, ocho estados y doce transiciones válidas. Lo que falta para un producto real es PostgreSQL con TypeORM, usuarios en base de datos y el alta de órdenes.`);
  s.imagen("panel.png", 0.6, 1.5, 4.4, 3.015);
  s.imagen("detalle.png", 5.2, 1.5, 4.4, 3.015);
  s.texto("Tablero del empleado", 0.6, 4.55, 4.4, 0.32, { size: 12, color: C.muted });
  s.texto("Detalle: solo ofrece los estados válidos", 5.2, 4.55, 4.4, 0.32, { size: 12, color: C.muted });
  s.rect(9.9, 1.5, 2.83, 1.5, { fill: C.soft, radius: 0.1 });
  s.texto("169", 9.9, 1.52, 2.83, 0.9, { size: 44, color: C.navy, bold: true, align: "center" });
  s.texto("pruebas automáticas: 87 de la API y 82 del front", 10.0, 2.4, 2.63, 0.58, { size: 13, color: C.ink, align: "center" });
  s.rect(9.9, 3.15, 2.83, 1.5, { fill: C.soft, radius: 0.1 });
  s.texto("12", 9.9, 3.17, 2.83, 0.9, { size: 44, color: C.navy, bold: true, align: "center" });
  s.texto("transiciones válidas entre 8 estados", 10.0, 4.05, 2.63, 0.55, { size: 13, color: C.ink, align: "center" });
  const pasos = [
    ["1", "El cliente consulta TR-1042 en el seguimiento, sin iniciar sesión"],
    ["2", "El empleado entra al panel y cambia el estado de la orden"],
    ["3", "Un cambio inválido se rechaza: la API responde 422 y la orden no cambia"],
  ];
  pasos.forEach(([n, t], i) => {
    const x = 0.6 + i * 4.1;
    s.rect(x, 5.15, 3.9, 1.6, { fill: C.paper, radius: 0.1 });
    s.elipse(x + 0.2, 5.35, 0.55, 0.55, { fill: C.navy });
    s.texto(n, x + 0.2, 5.35, 0.55, 0.55, { size: 20, color: C.white, bold: true, align: "center", valign: "middle" });
    s.texto(t, x + 0.9, 5.28, 2.9, 1.4, { size: 14, color: C.ink });
  });
  pie(s, ADRIAN);
}

// ================================================================ 5. Testing (Adrián)
{
  const s = nueva("CLARA", "Testing y calidad", ADRIAN,
    `Probamos la funcionalidad de cambiar el estado de una orden, con tres tipos de prueba y un criterio claro para cada una.\n\nLa prueba unitaria, con Jest, comprueba la función canTransition aislada: de diagnóstico a listo para retirar debe dar falso. Reduce el riesgo de saltear etapas, por ejemplo entregar sin presupuesto aprobado. La de integración, con Supertest, llama al endpoint con un salto inválido y espera 422, con los estados permitidos, y verifica que la orden no cambia. La prueba manual, el caso TC-001 para Testiny, recorre lo que cliente y empleado hacen de verdad y mira que el seguimiento no muestre datos personales.\n\nVerificar es comprobar que construimos bien el sistema: cada escenario de la especificación tiene su prueba. Validar es comprobar que construimos el sistema correcto: lo haríamos con una prueba piloto de dos semanas en el taller, que proponemos pero no realizamos.`);
  s.texto("API: 87 pruebas con Jest y Supertest. Front: 82 con Vitest", 6.2, 0.55, 6.53, 0.4, { size: 14, color: C.muted, align: "right" });
  const cols = [
    ["1", "Unitaria con Jest", [["Qué: ", "la función canTransition(from, to)"], ["Entrada: ", "diagnosing hacia ready_for_pickup"], ["Esperado: ", "false"], ["Riesgo: ", "saltear etapas, por ejemplo entregar sin presupuesto aprobado"]]],
    ["2", "Integración con Supertest", [["Qué: ", "PATCH /api/orders/:id/status"], ["Entrada: ", "salto inválido, con token"], ["Esperado: ", "422 con los estados permitidos, y la orden no cambia"], ["Riesgo: ", "que la regla no se cumpla en el servidor"]]],
    ["3", "Manual con Testiny", [["Caso: ", "TC-001, un empleado cambia el estado y el cliente lo ve"], ["Esperado: ", "solo estados válidos, historial nuevo y seguimiento sin datos personales"], ["Riesgo: ", "mostrar datos personales"]]],
  ];
  cols.forEach(([n, titulo, filas], i) => {
    const x = 0.6 + i * 4.1;
    s.rect(x, 1.55, 3.9, 3.55, { fill: C.paper, radius: 0.12 });
    s.elipse(x + 0.2, 1.72, 0.5, 0.5, { fill: C.orange });
    s.texto(n, x + 0.2, 1.72, 0.5, 0.5, { size: 18, color: C.white, bold: true, align: "center", valign: "middle" });
    s.texto(titulo, x + 0.85, 1.66, 2.95, 0.64, { size: 16, color: C.navy, bold: true, valign: "middle" });
    s.texto(filas.map(([a, b], j) => ({ t: a + b, after: j < filas.length - 1 ? 6 : 0 })), x + 0.2, 2.4, 3.55, 2.6, { size: 14 });
  });
  s.rect(0.6, 5.35, 5.95, 1.45, { fill: C.soft, radius: 0.1 });
  s.texto([
    { t: "Verificación: ¿lo construimos bien?", b: true, s: 15, c: C.navy, after: 3 },
    { t: "Cada escenario de la especificación tiene su prueba, y se revisa el código contra ella", s: 14 },
  ], 0.8, 5.43, 5.55, 1.3, { size: 14 });
  s.rect(6.78, 5.35, 5.95, 1.45, { fill: C.white, line: C.navy, lw: 1.5, radius: 0.1, dash: "dash" });
  s.texto([
    { t: "Validación: ¿resuelve lo que el taller necesita?", b: true, s: 15, c: C.navy, after: 3 },
    { t: "Prueba piloto de dos semanas con órdenes reales. Es una propuesta: no se realizó", s: 14 },
  ], 6.98, 5.43, 5.55, 1.3, { size: 14 });
  pie(s, ADRIAN);
}

// ================================================================ 6. Arquitectura y despliegue (Renzo)
{
  const s = nueva("CLARA", "Arquitectura y despliegue", RENZO,
    `Este es el diagrama de la aplicación completa. En trazo continuo está lo que ya implementamos en la prueba de concepto, el front en Next.js y la API en Express. En trazo punteado, lo que proponemos para producción: Cloudflare para el DNS y el certificado, Nginx, PostgreSQL con TypeORM y las copias de seguridad nocturnas.\n\nComparamos dos alternativas con precios de DonWeb y Hostinger consultados el 6 de noviembre. La opción A es un hosting Node.js administrado, pero no incluye PostgreSQL: habría que sumar Supabase y pagar 48 meses por adelantado. La opción B es un servidor virtual con Docker, donde corre todo junto. Elegimos la B con un DonWeb Cloud Server de 4 procesadores y 4 gigas de memoria, con servidores en Argentina, que se paga por mes y en pesos. Su costo es de $10.966,87 mensuales con descuento. El mantenimiento queda a cargo de la consultora.`);
  const solido = (x, y, w, h, t, o = {}) => {
    s.rect(x, y, w, h, { fill: o.fill || C.white, line: C.navy, lw: 2, radius: 0.08 });
    s.texto(t, x, y, w, h, { size: 12, color: C.ink, bold: true, align: "center", valign: "middle" });
  };
  const punteado = (x, y, w, h, t, o = {}) => {
    s.rect(x, y, w, h, { fill: o.fill || C.white, line: C.orange, lw: 1.5, radius: 0.08, dash: "dash" });
    s.texto(t, x, y, w, h, { size: 12, color: C.ink, bold: true, align: "center", valign: "middle" });
  };
  // Actores
  s.rect(0.6, 1.8, 1.55, 0.85, { fill: "EDEFF2", line: C.muted, lw: 1.5, radius: 0.08 });
  s.texto("Clientes\n(celular)", 0.6, 1.8, 1.55, 0.85, { size: 12, color: C.ink, bold: true, align: "center", valign: "middle" });
  s.rect(0.6, 3.3, 1.55, 0.85, { fill: "EDEFF2", line: C.muted, lw: 1.5, radius: 0.08 });
  s.texto("Empleados\n(tablet o PC)", 0.6, 3.3, 1.55, 0.85, { size: 12, color: C.ink, bold: true, align: "center", valign: "middle" });
  punteado(2.6, 2.5, 1.45, 1.1, "Cloudflare\nDNS, CDN y HTTPS");
  s.linea(2.15, 2.25, 2.6, 2.85, { flecha: true });
  s.linea(2.15, 3.7, 2.6, 3.25, { flecha: true });
  // Servidor
  s.rect(4.5, 1.6, 3.1, 4.3, { fill: "FFF8F2", line: C.orange, lw: 1.5, radius: 0.1, dash: "dash" });
  s.texto("DonWeb Cloud Server", 4.6, 1.65, 2.9, 0.35, { size: 12, color: C.orangeText, bold: true });
  punteado(4.7, 2.15, 2.7, 0.55, "Nginx y Certbot");
  solido(4.7, 3.1, 1.25, 0.9, "Front\nNext.js");
  solido(6.15, 3.1, 1.25, 0.9, "API\nExpress");
  punteado(6.15, 4.55, 1.25, 0.9, "PostgreSQL\ny TypeORM");
  punteado(4.7, 4.55, 1.25, 0.9, "Copias\nnocturnas");
  s.linea(4.05, 3.05, 4.7, 2.45, { flecha: true });
  s.linea(5.32, 2.7, 5.32, 3.1, { flecha: true });
  s.linea(6.78, 2.7, 6.78, 3.1, { flecha: true });
  s.linea(5.95, 3.55, 6.15, 3.55, { flecha: true });
  s.linea(6.78, 4.0, 6.78, 4.55, { flecha: true });
  s.linea(6.15, 5.0, 5.95, 5.0, { flecha: true });
  // Leyenda
  s.rect(0.6, 6.15, 0.35, 0.22, { fill: C.white, line: C.navy, lw: 2 });
  s.texto("Implementado en la prueba de concepto", 1.05, 6.08, 3.4, 0.36, { size: 12, color: C.muted });
  s.rect(4.5, 6.15, 0.35, 0.22, { fill: C.white, line: C.orange, lw: 1.5, dash: "dash" });
  s.texto("Propuesto", 4.95, 6.08, 1.6, 0.36, { size: 12, color: C.muted });
  // Comparación
  s.tabla([
    ["", "A. Administrado", "B. VPS (elegida)"],
    ["PostgreSQL", "No: hay que sumar Supabase", "Sí, en el mismo servidor"],
    ["Pago inicial", "48 meses por adelantado", "Mensual"],
    ["Costo mensual", "$52.299 más USD 25", "$10.966,87 con descuento"],
    ["Mantenimiento", "Del proveedor", "De la consultora"],
  ], 7.95, 1.6, 4.78, [1.3, 1.7, 1.78], { size: 13, rowH: 0.62 });
  s.rect(7.95, 5.0, 4.78, 1.8, { fill: C.soft, radius: 0.1 });
  s.texto([
    { t: "Elegimos la B", b: true, s: 15, c: C.navy, after: 3 },
    { t: "DonWeb Cloud Server de 4 vCPU, 4 GB y 20 GB NVMe, con servidores en Argentina", s: 14 },
  ], 8.1, 5.08, 4.5, 1.65, { size: 14 });
  pie(s, RENZO);
}

// ================================================================ 7. Presupuesto (Rocío)
{
  const s = nueva("CLARA", "Presupuesto y mantenimiento", ROCIO,
    `El presupuesto separa lo que se contrata al proveedor de lo que presta la consultora, con precios de proveedores reales consultados el 6 de noviembre de 2026.\n\nLa infraestructura cuesta ciento cuarenta mil pesos el primer año con el descuento vigente, o trescientos mil a precio de lista, porque DonWeb no publica cuánto dura el descuento. La implementación del MVP son entre 206 y 294 horas, que con un valor hora de 10 dólares dan entre 2.060 y 2.940 dólares. Ese valor lo fijó el grupo como referencia y es menor que lo que sugiere el Consejo de Ciencias Informáticas de La Rioja para programación web, 90.777 pesos la hora en abril de 2026. El mantenimiento son de cuatro a ocho horas por mes, de 40 a 80 dólares, y al dólar oficial de 1.570 pesos equivale a entre 62.800 y 125.600 pesos por mes.\n\nLa pregunta del cliente fue por qué pagar mantenimiento si contrata el servidor más barato: porque el servidor incluye el equipo y la red, pero los parches, los certificados y las copias de seguridad quedan a cargo de quien lo administra, y el personal del taller no lo hace.`);
  const cards = [
    ["Infraestructura, primer año", "$140.102,44", "con el descuento vigente. A precio de lista: $300.949,60", 36],
    ["Implementación del MVP", "206 a 294 h", "USD 2.060 a USD 2.940 con un valor hora de USD 10", 36],
    ["Mantenimiento por mes", "4 a 8 h", "USD 40 a USD 80 por mes, a USD 10 la hora", 36],
  ];
  cards.forEach(([rotulo, grande, detalle, tam], i) => {
    const x = 0.6 + i * 4.1;
    s.rect(x, 1.55, 3.9, 2.9, { fill: C.paper, radius: 0.12 });
    s.texto(rotulo, x + 0.25, 1.75, 3.4, 0.4, { size: 15, color: C.orangeText, bold: true });
    s.texto(grande, x + 0.25, 2.25, 3.4, 0.85, { size: tam, color: C.navy, bold: true, valign: "middle" });
    s.texto(detalle, x + 0.25, 3.25, 3.4, 1.1, { size: 14, color: C.ink });
  });
  s.rect(0.6, 4.65, 7.5, 2.15, { fill: C.soft, radius: 0.12 });
  s.texto([
    { t: "Quién presta qué", b: true, s: 15, c: C.navy, after: 4 },
    { t: "DonWeb: servidor, red y copias semanales", bullet: true, after: 2 },
    { t: "NIC Argentina: dominio .com.ar, $8.500 por año", bullet: true, after: 2 },
    { t: "Cloudflare: DNS, CDN y certificado, $0", bullet: true, after: 2 },
    { t: "La consultora: desarrollo, puesta en producción, mantenimiento y soporte", bullet: true },
  ], 0.85, 4.75, 7.1, 2.0, { size: 14 });
  s.rect(8.3, 4.65, 4.43, 2.15, { fill: C.white, line: C.line, lw: 1.5, radius: 0.12 });
  s.texto([
    { t: "Fuentes", b: true, s: 15, c: C.navy, after: 4 },
    { t: "Precios de proveedores: sitios oficiales, 6/11/2026", s: 14, after: 3 },
    { t: "Valor hora: referencia del grupo. El consejo de La Rioja sugiere $90.777 para programación web (abril 2026)", s: 14 },
  ], 8.5, 4.75, 4.05, 2.0, { size: 14 });
  pie(s, ROCIO);
}

// ================================================================ 8. Recomendación e imprevistos (Rocío)
{
  const s = nueva("OSCURA", "Recomendación e imprevistos", ROCIO,
    `Para cerrar, nuestra recomendación: un DonWeb Cloud Server con un plan de mantenimiento de la consultora. Incluye PostgreSQL sin sumar otro proveedor, se paga por mes en pesos y los servidores están en Argentina. Quedan abiertos tres puntos antes de contratar: confirmar por escrito cuánto dura el descuento, cotizar las copias diarias y revisar con el cliente las horas estimadas.\n\nSi el docente plantea un imprevisto, así lo analizaríamos. Si crecen los usuarios, se amplían procesador, memoria o disco, con un reinicio de tres a cinco minutos. Si baja el presupuesto, un plan más chico, menos horas de mantenimiento y la segunda etapa postergada. Si cae el servidor, se recrea con Docker Compose desde las copias y se pierde como máximo un día. Si se pierde información, están las copias nocturnas fuera del servidor y las del proveedor. Una funcionalidad nueva pasa primero por la especificación y las horas. Y para cambiar de proveedor, todo corre en contenedores con PostgreSQL estándar, así que se traslada con una copia de la base.\n\nMuchas gracias. Quedamos a disposición para las preguntas.`);
  s.texto("Recomendamos un DonWeb Cloud Server con un plan de mantenimiento: PostgreSQL incluido, pago mensual en pesos y servidores en Argentina", 0.6, 1.45, 12.1, 1.0, { size: 20, color: C.white, bold: true });
  const imprevistos = [
    ["Más usuarios", "Se amplían procesador, memoria o disco, con un reinicio de 3 a 5 minutos"],
    ["Menos presupuesto", "Un plan más chico, menos horas de mantenimiento y la segunda etapa postergada"],
    ["Cae el servidor", "Se recrea con Docker Compose desde las copias, y se pierde como máximo un día"],
    ["Se pierde información", "Copias nocturnas fuera del servidor y las del proveedor, con restauración probada"],
    ["Una funcionalidad nueva", "Primero la especificación y las horas, y después el desarrollo"],
    ["Cambio de proveedor", "Contenedores con PostgreSQL estándar: se traslada con una copia de la base"],
  ];
  imprevistos.forEach(([t, d], i) => {
    const col = i % 3, fila = Math.floor(i / 3);
    const x = 0.6 + col * 4.1, y = 2.65 + fila * 1.95;
    s.rect(x, y, 3.9, 1.8, { fill: C.navyCard, radius: 0.12 });
    s.texto([
      { t: t, b: true, s: 16, c: C.orangeSoft, after: 4 },
      { t: d, s: 14, c: C.white },
    ], x + 0.2, y + 0.1, 3.5, 1.62, { size: 14 });
  });
  s.texto("Gracias. ¿Preguntas?", 0.6, 6.55, 8, 0.5, { size: 24, color: C.white, bold: true });
  s.texto(`Presenta: ${ROCIO}`, 8.6, 6.98, 3.5, 0.32, { size: 12, color: C.pale, align: "right" });
}

// ---------------------------------------------------------------- salida: pptx y vista previa
function svgDiapositiva(d) {
  const px = 96;
  const f = (v) => (v * px).toFixed(1);
  const fondo = d.master === "CLARA" ? C.white : C.navy;
  const out = [`<rect width="${f(W)}" height="${f(H)}" fill="#${fondo}"/>`];
  const tituloColor = d.master === "CLARA" ? C.navy : C.white;
  const tx = d.master === "PORTADA" ? [0.8, 1.75, 7.4] : [0.6, 0.4, 12.1];
  const tsize = d.master === "PORTADA" ? 60 : 36;
  out.push(`<text x="${f(tx[0])}" y="${f(tx[1] + (tsize * 1.0) / PT)}" font-family="Arial" font-size="${(tsize * px) / PT}" font-weight="700" fill="#${tituloColor}">${esc(d.titulo)}</text>`);
  if (d.master !== "PORTADA") {
    out.push(`<text x="${f(12.5)}" y="${f(7.2)}" font-family="Arial" font-size="${(12 * px) / PT}" fill="#${d.master === "CLARA" ? C.muted : C.pale}" text-anchor="end">${d.n}</text>`);
  }
  for (const e of d.el) {
    if (e.k === "rect") {
      const r = e.radius ? ` rx="${f(e.radius)}"` : "";
      const dash = e.dash ? ' stroke-dasharray="6 4"' : "";
      out.push(`<rect x="${f(e.x)}" y="${f(e.y)}" width="${f(e.w)}" height="${f(e.h)}"${r} fill="${e.fill ? "#" + e.fill : "none"}" stroke="${e.line ? "#" + e.line : "none"}" stroke-width="${e.lw}"${dash}/>`);
    } else if (e.k === "ellipse") {
      out.push(`<ellipse cx="${f(e.x + e.w / 2)}" cy="${f(e.y + e.h / 2)}" rx="${f(e.w / 2)}" ry="${f(e.h / 2)}" fill="${e.fill ? "#" + e.fill : "none"}" stroke="${e.line ? "#" + e.line : "none"}"/>`);
    } else if (e.k === "line") {
      out.push(`<line x1="${f(e.x1)}" y1="${f(e.y1)}" x2="${f(e.x2)}" y2="${f(e.y2)}" stroke="#${e.color}" stroke-width="${e.lw}"${e.dash ? ' stroke-dasharray="6 4"' : ""}/>`);
      if (e.flecha) {
        const ang = Math.atan2(e.y2 - e.y1, e.x2 - e.x1), t = 0.1;
        const p = (a, d2) => [e.x2 - d2 * Math.cos(ang + a), e.y2 - d2 * Math.sin(ang + a)];
        const [ax, ay] = p(0.45, t), [bx, by] = p(-0.45, t);
        out.push(`<polygon points="${f(e.x2)},${f(e.y2)} ${f(ax)},${f(ay)} ${f(bx)},${f(by)}" fill="#${e.color}"/>`);
      }
    } else if (e.k === "img") {
      const b64 = fs.readFileSync(path.join(__dirname, "img", e.file)).toString("base64");
      out.push(`<image x="${f(e.x)}" y="${f(e.y)}" width="${f(e.w)}" height="${f(e.h)}" href="data:image/png;base64,${b64}"/>`);
    } else if (e.k === "text") {
      const inner = e.w - 8 / PT;
      const lineas = [];
      for (const p of e.ps) {
        const s = p.s || e.size, b = p.b ?? e.bold, bullet = !!p.bullet;
        const ancho = inner - (bullet ? 16 / PT : 0);
        envolver(p.t, ancho, s, b).forEach((l, i) => lineas.push({ l, s, b, c: p.c || e.color, bullet, first: i === 0, after: i === 0 ? 0 : 0, p }));
        lineas.push({ gap: (p.after || 0) / PT });
      }
      lineas.pop();
      let alto = lineas.reduce((a, l) => a + (l.gap !== undefined ? l.gap : (l.s * 1.2) / PT), 0);
      let y = e.y + 4 / PT + (e.valign === "middle" ? Math.max(0, (e.h - 8 / PT - alto) / 2) : 0);
      for (const l of lineas) {
        if (l.gap !== undefined) { y += l.gap; continue; }
        const lh = (l.s * 1.2) / PT;
        const base = y + lh * 0.8;
        let x = e.x + 4 / PT + (l.bullet ? 16 / PT : 0), anchor = "start";
        if (e.align === "center") { x = e.x + e.w / 2; anchor = "middle"; } else if (e.align === "right") { x = e.x + e.w - 4 / PT; anchor = "end"; }
        if (l.bullet && l.first) out.push(`<text x="${f(e.x + 4 / PT)}" y="${f(base)}" font-family="Arial" font-size="${(l.s * px) / PT}" fill="#${l.c}">•</text>`);
        out.push(`<text x="${f(x)}" y="${f(base)}" font-family="Arial" font-size="${(l.s * px) / PT}" font-weight="${l.b ? 700 : 400}" fill="#${l.c}" text-anchor="${anchor}">${esc(l.l)}</text>`);
        y += lh;
      }
    } else if (e.k === "tabla") {
      let y = e.y;
      e.filas.forEach((fila, r) => {
        let x = e.x;
        let alturaFila = e.rowH;
        const celdas = fila.map((t, c) => envolver(t, e.colW[c] - 0.16, e.size, r === 0));
        alturaFila = Math.max(e.rowH, ...celdas.map((ls) => ls.length * ((e.size * 1.2) / PT) + 0.12));
        fila.forEach((t, c) => {
          const bg = r === 0 ? C.navy : r % 2 === 0 ? C.paper : C.white;
          out.push(`<rect x="${f(x)}" y="${f(y)}" width="${f(e.colW[c])}" height="${f(alturaFila)}" fill="#${bg}" stroke="#${C.line}"/>`);
          const ls = celdas[c];
          const h0 = ls.length * ((e.size * 1.2) / PT);
          ls.forEach((l, i) => out.push(`<text x="${f(x + 0.08)}" y="${f(y + (alturaFila - h0) / 2 + ((i + 0.8) * e.size * 1.2) / PT)}" font-family="Arial" font-size="${(e.size * px) / PT}" font-weight="${r === 0 ? 700 : 400}" fill="#${r === 0 ? C.white : C.ink}">${esc(l)}</text>`));
          x += e.colW[c];
        });
        y += alturaFila;
      });
      if (y > H - 0.5) avisos.push(`Diapositiva ${d.n}: la tabla termina en y=${y.toFixed(2)} y se acerca al borde`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${f(W)}" height="${f(H)}" viewBox="0 0 ${f(W)} ${f(H)}">\n${out.join("\n")}\n</svg>\n`;
}

/** pptxgenjs agrega entradas de carpeta al ZIP. Servicios en la nube como OneDrive pueden fallar al abrir o co-editar archivos así, por eso se quitan. */
async function sinCarpetas(archivo) {
  const JSZip = require("jszip");
  const origen = await JSZip.loadAsync(fs.readFileSync(archivo));
  const limpio = new JSZip();
  for (const nombre of Object.keys(origen.files)) {
    const entrada = origen.files[nombre];
    if (!entrada.dir) limpio.file(nombre, await entrada.async("nodebuffer"), { createFolders: false });
  }
  fs.writeFileSync(archivo, await limpio.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

(async () => {
  fs.mkdirSync(PREVIA, { recursive: true });
  for (const d of diapositivas) fs.writeFileSync(path.join(PREVIA, `diapositiva-${d.n}.svg`), svgDiapositiva(d));
  await pres.writeFile({ fileName: SALIDA });
  await sinCarpetas(SALIDA);
  console.log(`Generado: ${SALIDA} (${diapositivas.length} diapositivas)`);
  if (avisos.length) {
    console.log("\nAvisos de ajuste de texto:");
    avisos.forEach((a) => console.log(" - " + a));
  } else console.log("Sin avisos de ajuste de texto.");
})();
