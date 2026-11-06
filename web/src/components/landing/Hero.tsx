import { Icon } from "../icons";
import { SITE } from "@/lib/site";

const STATS = [
  { value: "27 años", label: "en Villa Crespo", accent: false },
  { value: "+3.800", label: "reparaciones registradas", accent: false },
  { value: "4,9/5", label: "valoración de clientes", accent: true },
] as const;

/** Illustrative sample of what the customer sees on the tracking page. Not real data. */
function SampleTicket() {
  const segments = ["bg-navy", "bg-navy", "bg-navy", "bg-[#0E7A8C]", "bg-line", "bg-line"];

  return (
    <div className="anim-float relative rotate-[2.2deg] rounded-xl bg-paper text-ink shadow-[0_40px_70px_-30px_rgba(0,0,0,0.65)]">
      <div className="px-6 pt-5.5 pb-5">
        <div className="flex items-center justify-between gap-3 font-mono text-xs tracking-[0.08em] text-muted uppercase">
          <span>Orden de trabajo</span>
          <span className="text-sm font-semibold text-ink">{SITE.trackingExample}</span>
        </div>
        <div className="mt-4 font-display text-[32px] leading-none font-extrabold font-stretch-[85%]">Fiat Cronos</div>
        <div className="mt-3">
          <span className="inline-flex rounded border-[1.5px] border-t-4 border-ink border-t-navy bg-white px-2 pt-1 pb-0.5 font-mono text-sm font-semibold tracking-[0.06em]">
            ***2KD
          </span>
        </div>
      </div>
      <div className="mx-4.5 border-t-2 border-dashed border-[#C9C5BD]" />
      <div className="px-6 pt-5 pb-6">
        <div className="text-xs font-semibold tracking-[0.06em] text-muted uppercase">Estado actual</div>
        <div className="mt-2 flex items-center gap-2.5 text-[22px] font-bold text-[#0B5563]">
          <span className="anim-ping size-3 rounded-full bg-[#0E7A8C]" />
          En reparación
        </div>
        <div className="mt-4.5 grid grid-cols-6 gap-1" aria-hidden="true">
          {segments.map((color, i) => (
            <span
              key={i}
              className={`h-1.5 origin-left rounded-[3px] ${color}`}
              style={{ animation: i < 4 ? `trGrow .5s ease-out ${0.9 + i * 0.15}s both` : undefined }}
            />
          ))}
        </div>
        <div className="mt-2.5 flex justify-between text-[13px] text-muted">
          <span>Paso 4 de 6</span>
          <span>Actualizado hace 12 min</span>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(900px_520px_at_88%_0%,rgba(228,103,21,0.32),transparent_62%),radial-gradient(800px_600px_at_-5%_105%,rgba(56,110,214,0.45),transparent_60%),linear-gradient(155deg,#01225E_0%,#011A48_55%,#010E2C_100%)] text-white">
      <div
        aria-hidden="true"
        className="anim-drift pointer-events-none absolute -top-30 -right-35 size-[560px] rounded-full bg-[radial-gradient(circle,rgba(228,103,21,0.38),transparent_65%)] blur-[24px]"
      />
      <div
        aria-hidden="true"
        className="anim-drift-rev pointer-events-none absolute -bottom-75 -left-55 size-[640px] rounded-full bg-[radial-gradient(circle,rgba(70,130,235,0.38),transparent_65%)] blur-[30px]"
      />

      <div className="relative mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-14 px-5 pt-[clamp(44px,8vw,104px)] pb-[clamp(56px,8vw,112px)]">
        <div className="max-w-[640px] min-w-0 flex-[1_1_480px]">
          <div
            className="anim-up inline-flex items-center gap-2.5 font-mono text-[13px] font-semibold tracking-[0.08em] text-[#F6A46E] uppercase"
            style={{ animationDelay: "0.05s" }}
          >
            <span className="size-2 rounded-full bg-orange" />
            Mecánica integral, a la vista
          </div>

          <h1
            className="anim-up mt-5 font-display text-[clamp(46px,8.4vw,98px)] leading-[0.94] font-extrabold tracking-[-0.02em] text-balance font-stretch-[78%]"
            style={{ animationDelay: "0.15s" }}
          >
            Sabé en qué está tu auto, <span className="text-orange">sin llamar.</span>
          </h1>

          <p
            className="anim-up mt-5.5 max-w-[520px] text-[clamp(17px,2.2vw,20px)] leading-normal text-[#C9D4EA] text-pretty"
            style={{ animationDelay: "0.28s" }}
          >
            Cada reparación tiene un código. Con él ves el estado de tu vehículo desde el celular, cuando quieras.
          </p>

          <form
            action="/seguimiento"
            method="get"
            className="anim-up mt-8 max-w-[540px]"
            style={{ animationDelay: "0.4s" }}
          >
            <label htmlFor="hero-code" className="mb-2 block text-sm font-semibold text-white">
              Código de seguimiento
            </label>
            <div className="flex flex-wrap gap-2.5">
              <input
                id="hero-code"
                name="codigo"
                required
                maxLength={32}
                autoComplete="off"
                placeholder={SITE.trackingExample}
                className="h-[58px] min-w-0 flex-[1_1_220px] rounded-md border-2 border-transparent bg-white px-4.5 font-mono text-[19px] font-semibold tracking-[0.06em] text-ink uppercase outline-none focus:border-orange"
              />
              <button
                type="submit"
                className="flex h-[58px] flex-none cursor-pointer items-center gap-2.5 rounded-md border-0 bg-orange px-6.5 text-[17px] font-bold text-ink hover:bg-orange-hover"
              >
                Consultar estado
                <Icon name="arrowRight" size={20} stroke={2.2} />
              </button>
            </div>
            <p className="mt-3 text-sm text-[#A9B9DA]">Lo encontrás en el comprobante que te dimos al dejar el vehículo.</p>
          </form>

          <dl
            className="anim-up mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/15 pt-6"
            style={{ animationDelay: "0.55s" }}
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt
                  className={`font-display text-[38px] leading-none font-extrabold font-stretch-[80%] ${stat.accent ? "text-orange" : "text-white"}`}
                >
                  {stat.value}
                </dt>
                <dd className="m-0 mt-1.5 text-sm text-[#A9B9DA]">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="anim-up mx-auto max-w-[400px] flex-[1_1_320px]" style={{ animationDelay: "0.35s" }}>
          <SampleTicket />
          <p className="mt-5.5 text-center font-mono text-xs tracking-[0.08em] text-[#A9B9DA] uppercase">
            Así se ve tu seguimiento
          </p>
        </div>
      </div>
    </section>
  );
}
