import { describe, expect, it } from "vitest";
import { formatDate, formatRelative, normalizeText } from "./format";

// Las fechas se muestran siempre en hora de Buenos Aires (UTC-3, sin horario de verano),
// sin importar la zona horaria de la máquina que corre el test o el servidor.
const BA_OFFSET_HOURS = 3;
const at = (day: number, hour: number, minute = 0) => new Date(Date.UTC(2026, 10, day, hour + BA_OFFSET_HOURS, minute));
const iso = (day: number, hour: number, minute = 0) => at(day, hour, minute).toISOString();

// Mediodía del 6 de noviembre de 2026 en Buenos Aires.
const NOW = at(6, 12);

describe("formatDate", () => {
  it("dice Hoy para una fecha del mismo día", () => {
    expect(formatDate(iso(6, 9, 5), NOW)).toBe("Hoy, 09:05 h");
  });

  it("dice Ayer para el día anterior", () => {
    expect(formatDate(iso(5, 16, 20), NOW)).toBe("Ayer, 16:20 h");
  });

  it("muestra día y mes para fechas anteriores, sin punto", () => {
    expect(formatDate(iso(2, 8, 0), NOW)).toBe("2 nov, 08:00 h");
  });

  it("no usa el punto medio como separador", () => {
    expect(formatDate(iso(2, 8, 0), NOW)).not.toContain(String.fromCharCode(183));
  });

  it("muestra la hora de Buenos Aires aunque el servidor esté en UTC", () => {
    // 00:30 UTC del 7 de noviembre son las 21:30 del 6 en Buenos Aires.
    const event = "2026-11-07T00:30:00.000Z";
    const now = new Date("2026-11-07T01:30:00.000Z");

    expect(formatDate(event, now)).toBe("Hoy, 21:30 h");
  });

  it("no cambia a Ayer hasta la medianoche de Buenos Aires", () => {
    // 02:00 UTC del 7 son las 23:00 del 6 en Buenos Aires: sigue siendo hoy.
    const event = "2026-11-07T02:00:00.000Z";
    const now = new Date("2026-11-07T02:59:00.000Z");

    expect(formatDate(event, now)).toBe("Hoy, 23:00 h");
  });
});

describe("formatRelative", () => {
  it("dice Recién cuando pasó menos de un minuto", () => {
    expect(formatRelative(new Date(NOW.getTime() - 20_000).toISOString(), NOW)).toBe("Recién");
  });

  it("usa minutos por debajo de una hora", () => {
    expect(formatRelative(new Date(NOW.getTime() - 35 * 60_000).toISOString(), NOW)).toBe("Hace 35 min");
  });

  it("usa horas por debajo de un día", () => {
    expect(formatRelative(new Date(NOW.getTime() - 190 * 60_000).toISOString(), NOW)).toBe("Hace 3 h");
  });

  it("cae a la fecha completa después de un día", () => {
    expect(formatRelative(iso(2, 8, 0), NOW)).toBe("2 nov, 08:00 h");
  });
});

describe("normalizeText", () => {
  it("ignora mayúsculas y acentos", () => {
    expect(normalizeText("García Núñez")).toBe("garcia nunez");
  });
});
