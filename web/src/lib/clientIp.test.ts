import { describe, expect, it } from "vitest";
import { clientIpFromForwarded, trustedHopsFromEnv } from "./clientIp";

describe("clientIpFromForwarded", () => {
  it("ignora el encabezado cuando no hay proxies de confianza", () => {
    expect(clientIpFromForwarded("203.0.113.9", 0)).toBeUndefined();
  });

  it("toma la última entrada con un proxy de confianza, que es la que agregó ese proxy", () => {
    expect(clientIpFromForwarded("203.0.113.9", 1)).toBe("203.0.113.9");
  });

  it("no cree la entrada que puso el visitante al inicio de la cadena", () => {
    // El visitante manda "6.6.6.6"; el proxy de confianza agrega la IP real al final.
    expect(clientIpFromForwarded("6.6.6.6, 203.0.113.9", 1)).toBe("203.0.113.9");
  });

  it("cuenta desde la derecha cuando hay varios proxies de confianza", () => {
    expect(clientIpFromForwarded("6.6.6.6, 203.0.113.9, 10.0.0.1", 2)).toBe("203.0.113.9");
  });

  it("devuelve undefined si la cadena es más corta que los proxies configurados", () => {
    expect(clientIpFromForwarded("203.0.113.9", 2)).toBeUndefined();
  });

  it("devuelve undefined sin encabezado o con encabezado vacío", () => {
    expect(clientIpFromForwarded(null, 1)).toBeUndefined();
    expect(clientIpFromForwarded("", 1)).toBeUndefined();
  });

  it("recorta espacios alrededor de cada entrada", () => {
    expect(clientIpFromForwarded("6.6.6.6 ,  203.0.113.9 ", 1)).toBe("203.0.113.9");
  });
});

describe("trustedHopsFromEnv", () => {
  it("vale 0 cuando la variable no está", () => {
    expect(trustedHopsFromEnv(undefined)).toBe(0);
  });

  it("lee un entero positivo", () => {
    expect(trustedHopsFromEnv("1")).toBe(1);
    expect(trustedHopsFromEnv("2")).toBe(2);
  });

  it("vuelve a 0 ante un valor inválido o negativo", () => {
    expect(trustedHopsFromEnv("abc")).toBe(0);
    expect(trustedHopsFromEnv("-1")).toBe(0);
    expect(trustedHopsFromEnv("1.5")).toBe(0);
  });
});
