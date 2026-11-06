"use client";

// Generic message on purpose: the details of an unexpected error never reach the screen.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-10 text-center">
      <div role="alert">
        <h1 className="m-0 font-display text-[clamp(36px,7vw,56px)] leading-none font-extrabold text-navy font-stretch-[80%]">
          Algo salió mal
        </h1>
        <p className="mt-3 text-lg text-muted">Ocurrió un error inesperado. Probá de nuevo en unos instantes.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-7 h-12 cursor-pointer rounded-md border-0 bg-navy px-6 font-bold text-white hover:bg-navy-dark"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
