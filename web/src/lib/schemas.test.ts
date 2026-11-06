import { describe, expect, it } from "vitest";
import { validateLogin } from "./schemas";

describe("validateLogin", () => {
  it("acepta usuario y contraseña completos", () => {
    expect(validateLogin({ username: "daniel", password: "secreto-123" })).toEqual({
      ok: true,
      values: { username: "daniel", password: "secreto-123" },
    });
  });

  it("recorta los espacios del usuario pero no toca la contraseña", () => {
    const result = validateLogin({ username: "  daniel  ", password: " con espacios " });

    expect(result).toEqual({ ok: true, values: { username: "daniel", password: " con espacios " } });
  });

  it("pide el usuario cuando está vacío", () => {
    expect(validateLogin({ username: "", password: "x" })).toEqual({
      ok: false,
      errors: { username: "Ingresá tu usuario." },
    });
  });

  it("trata un usuario de solo espacios como vacío", () => {
    expect(validateLogin({ username: "   ", password: "x" })).toMatchObject({ ok: false });
  });

  it("pide la contraseña cuando está vacía", () => {
    expect(validateLogin({ username: "daniel", password: "" })).toEqual({
      ok: false,
      errors: { password: "Ingresá tu contraseña." },
    });
  });

  it("marca los dos campos cuando faltan ambos", () => {
    expect(validateLogin({ username: "", password: "" })).toEqual({
      ok: false,
      errors: { username: "Ingresá tu usuario.", password: "Ingresá tu contraseña." },
    });
  });
});
