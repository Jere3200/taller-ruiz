"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { validateLogin, type LoginErrors } from "@/lib/schemas";
import { Icon } from "../icons";

function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Usuario o contraseña incorrectos.";
    if (error.status === 400) return error.body.message ?? "Revisá los datos ingresados.";
    if (error.status === 429) return "Demasiados intentos. Esperá un momento y volvé a probar.";
    if (error.status === 0) return "No pudimos conectarnos con el servidor. Probá de nuevo en unos minutos.";
  }
  return "Ocurrió un error inesperado. Probá de nuevo.";
}

const inputClass = (invalid: boolean) =>
  `mt-1.5 h-12 w-full rounded-md border-2 bg-white px-3.5 text-base outline-none focus:border-navy focus:shadow-[0_0_0_3px_#E4EAF5] disabled:bg-sand ${invalid ? "border-[#D02A31]" : "border-field"}`;

export function LoginForm() {
  const router = useRouter();
  const { session, ready, login, notice, clearNotice } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // A logged-in employee has nothing to do here.
  useEffect(() => {
    if (ready && session) router.replace("/panel");
  }, [ready, session, router]);

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const result = validateLogin({ username, password });
    if (!result.ok) {
      setErrors(result.errors);
      setFailure(null);
      return;
    }

    setErrors({});
    setFailure(null);
    clearNotice();
    setLoading(true);
    try {
      // The effect above redirects as soon as the session exists.
      await login(result.values.username, result.values.password);
    } catch (error) {
      setFailure(loginErrorMessage(error));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-xl border border-edge bg-white p-8 shadow-[0_24px_50px_-30px_rgba(20,25,28,0.4)]">
      <h1 className="m-0 font-display text-[32px] leading-none font-extrabold text-navy font-stretch-[85%]">Acceso empleados</h1>
      <p className="mt-2 text-muted">Ingresá con tu usuario del taller.</p>

      {notice && (
        <div role="status" className="mt-5 flex items-center gap-2.5 rounded-md bg-[#FCEFD6] px-3.5 py-3 text-sm font-semibold text-[#8A4B00]">
          <Icon name="clock" size={18} />
          {notice}
        </div>
      )}
      {failure && (
        <div role="alert" className="mt-5 rounded-md bg-danger-bg px-3.5 py-3 text-sm font-semibold text-danger">
          {failure}
        </div>
      )}

      <div className="mt-5">
        <label htmlFor="lg-user" className="text-sm font-semibold">
          Usuario
        </label>
        <input
          id="lg-user"
          name="username"
          autoComplete="username"
          value={username}
          disabled={loading}
          aria-invalid={errors.username ? true : undefined}
          aria-describedby={errors.username ? "lg-user-error" : undefined}
          onChange={(e) => {
            setUsername(e.target.value);
            setErrors((current) => ({ ...current, username: undefined }));
          }}
          className={inputClass(Boolean(errors.username))}
        />
        {errors.username && (
          <p id="lg-user-error" className="mt-1.5 text-sm font-semibold text-danger">
            {errors.username}
          </p>
        )}
      </div>

      <div className="mt-4">
        <label htmlFor="lg-pass" className="text-sm font-semibold">
          Contraseña
        </label>
        <input
          id="lg-pass"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          disabled={loading}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "lg-pass-error" : undefined}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((current) => ({ ...current, password: undefined }));
          }}
          className={inputClass(Boolean(errors.password))}
        />
        {errors.password && (
          <p id="lg-pass-error" className="mt-1.5 text-sm font-semibold text-danger">
            {errors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-md border-0 text-base font-bold text-white disabled:cursor-default"
        style={{ background: loading ? "#4A5F8A" : "#01225E" }}
      >
        {loading && <span className="anim-spin size-4 rounded-full border-2 border-white/40 border-t-white" />}
        {loading ? "Ingresando" : "Ingresar"}
      </button>

      <div className="mt-5 text-center">
        <Link href="/" className="text-sm font-semibold text-navy">
          Volver al sitio
        </Link>
      </div>
    </form>
  );
}
