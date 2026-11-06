import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/Logo";
import { TrackingForm } from "@/components/tracking/TrackingForm";
import { TrackingResult } from "@/components/tracking/TrackingResult";
import { createApiClient } from "@/lib/api";
import { clientIpFromForwarded, trustedHopsFromEnv } from "@/lib/clientIp";
import { SITE } from "@/lib/site";
import { normalizeCode, resolveTracking } from "@/lib/tracking";

export const metadata: Metadata = {
  title: "Seguí tu reparación",
  description: "Consultá el estado de tu vehículo con el código de tu comprobante.",
};

// Public endpoint: no token and no personal data. The client never has a session here.
const publicApi = createApiClient({ getToken: () => null, onUnauthorized: () => undefined });

function Notice({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div role="alert" className="anim-in mt-8 rounded-xl border border-edge bg-white p-7 text-center">
      <div className="mx-auto grid size-13 place-items-center rounded-full bg-sand text-navy">
        <Icon name="search" size={26} />
      </div>
      <p className="m-0 mt-4 text-lg font-bold">{title}</p>
      {children && <p className="m-0 mt-1.5 text-muted">{children}</p>}
      {action}
    </div>
  );
}

// Runtime data (searchParams + fetch): it must live under <Suspense> with Cache Components.
async function TrackingContent({ searchParams }: { searchParams: PageProps<"/seguimiento">["searchParams"] }) {
  const code = normalizeCode((await searchParams).codigo);
  // The API only sees this server, so the visitor address is forwarded for its per-visitor rate limit.
  // Only the entry added by our own trusted proxies counts; the rest of X-Forwarded-For is client-controlled.
  const clientIp = clientIpFromForwarded(
    (await headers()).get("x-forwarded-for"),
    trustedHopsFromEnv(process.env.TRUSTED_PROXY_HOPS),
  );
  const outcome = await resolveTracking(publicApi, code, clientIp);

  return (
    <>
      <TrackingForm defaultCode={code} error={outcome.kind === "empty" ? "Ingresá el código de seguimiento." : undefined} />

      {outcome.kind === "idle" && (
        <div className="mt-8 rounded-xl border border-dashed border-field p-6 text-[15px] text-muted">
          Vas a ver el estado actual, las etapas de la reparación y el historial de cambios. No mostramos datos personales.
        </div>
      )}
      {outcome.kind === "notfound" && (
        <Notice title="No encontramos una orden con ese código. Revisá que esté bien escrito.">
          El formato es TR seguido de un número, por ejemplo {SITE.trackingExample}.
        </Notice>
      )}
      {outcome.kind === "ratelimited" && (
        <Notice title="Hiciste muchas consultas seguidas.">Esperá un momento y volvé a probar.</Notice>
      )}
      {outcome.kind === "error" && (
        <Notice
          title="No pudimos hacer la consulta."
          action={
            <Link
              href={`/seguimiento?codigo=${encodeURIComponent(code ?? "")}`}
              className="mt-5 inline-flex h-11 items-center rounded-md bg-navy px-6 font-bold text-white no-underline hover:bg-navy-dark hover:text-white"
            >
              Reintentar
            </Link>
          }
        >
          Revisá tu conexión y probá de nuevo.
        </Notice>
      )}
      {outcome.kind === "ok" && <TrackingResult data={outcome.data} />}
    </>
  );
}

function TrackingSkeleton() {
  return (
    <div className="mt-8 space-y-3" aria-busy="true" aria-label="Cargando">
      <div className="anim-pulse h-14 rounded-md bg-sand" />
      <div className="anim-pulse h-40 rounded-xl bg-sand" />
      <div className="anim-pulse h-56 rounded-xl bg-sand" />
    </div>
  );
}

export default function TrackingPage({ searchParams }: PageProps<"/seguimiento">) {
  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-[68px] max-w-[720px] items-center justify-between px-5">
          <Link href="/" aria-label="Taller Ruiz, ir al inicio">
            <Logo height={36} />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-navy no-underline hover:underline">
            <Icon name="arrowLeft" size={18} />
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-5 pt-8 pb-18">
        <h1 className="m-0 font-display text-[clamp(34px,6vw,48px)] leading-none font-extrabold text-navy font-stretch-[82%]">
          Seguí tu reparación
        </h1>
        <p className="mt-3 text-[17px] text-muted">Ingresá el código que figura en tu comprobante.</p>
        <Suspense fallback={<TrackingSkeleton />}>
          <TrackingContent searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
