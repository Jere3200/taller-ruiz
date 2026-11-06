import { describe, expect, it } from "vitest";
import { formatDate, formatRelative, normalizeText } from "./format";

// Reloj fijo: mediodía local del 6 de noviembre de 2026.
const NOW = new Date(2026, 10, 6, 12, 0, 0);
const at = (day: number, hour: number, minute = 0) => new Date(2026, 10, day, hour, minute).toISOString();

describe("formatDate", () => {
  it("dice Hoy para una fecha del mismo día", () => {
    expect(formatDate(at(6, 9, 5), NOW)).toBe("Hoy, 09:05 h");
  });

  it("dice Ayer para el día anterior", () => {
    expect(formatDate(at(5, 16, 20), NOW)).toBe("Ayer, 16:20 h");
  });

  it("muestra día y mes para fechas anteriores, sin punto", () => {
    expect(formatDate(at(2, 8, 0), NOW)).toBe("2 nov, 08:00 h");
  });

  it("no usa el punto medio como separador", () => {
    expect(formatDate(at(2, 8, 0), NOW)).not.toContain("·");
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
    expect(formatRelative(at(2, 8, 0), NOW)).toBe("2 nov, 08:00 h");
  });
});

describe("normalizeText", () => {
  it("ignora mayúsculas y acentos", () => {
    expect(normalizeText("García Núñez")).toBe("garcia nunez");
  });
});
