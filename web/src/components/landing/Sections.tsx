import { Icon, type IconName } from "../icons";
import { SITE } from "@/lib/site";

const BRANDS = ["Volkswagen", "Fiat", "Toyota", "Ford", "Chevrolet", "Peugeot", "Renault", "Citroën", "Nissan", "Honda", "Jeep"];

export function BrandMarquee() {
  // The list is rendered twice so the loop is seamless; the copy is hidden from assistive tech.
  return (
    <div className="flex items-center gap-7 overflow-hidden border-b border-line bg-white py-5">
      <span className="flex-none pl-5 font-mono text-xs font-semibold tracking-[0.08em] whitespace-nowrap text-muted uppercase">
        Todas las marcas
      </span>
      <div className="flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="anim-marquee flex w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex" aria-hidden={copy === 1 ? true : undefined}>
              {BRANDS.map((brand) => (
                <span
                  key={brand}
                  className="inline-flex items-center gap-7 pr-7 font-display text-[22px] font-bold whitespace-nowrap text-navy font-stretch-[85%]"
                >
                  {brand}
                  <span className="size-2 rotate-45 bg-orange" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div
      className={`font-mono text-[13px] font-semibold tracking-[0.1em] uppercase ${light ? "text-[#F6A46E]" : "text-orange-text"}`}
    >
      {children}
    </div>
  );
}

const SERVICES: { icon: IconName; title: string; text: string; tag: string }[] = [
  { icon: "wrench", title: "Mecánica general", text: "Motor, embrague, distribución y caja de cambios.", tag: "Presupuesto sin cargo" },
  { icon: "brake", title: "Frenos", text: "Pastillas, discos, campanas y líquido de frenos.", tag: "Revisión en el día" },
  { icon: "steering", title: "Tren delantero", text: "Alineación, balanceo, amortiguadores y rótulas.", tag: "Alineación computada" },
  { icon: "bolt", title: "Electricidad", text: "Batería, alternador, arranque e iluminación.", tag: "Control de batería gratis" },
  { icon: "drop", title: "Service y mantenimiento", text: "Cambio de aceite, filtros y controles según el manual.", tag: "Cada 10.000 km" },
  { icon: "scan", title: "Diagnóstico computarizado", text: "Lectura de fallas con escáner multimarca.", tag: "Resultado en 1 hora" },
];

export function Services() {
  return (
    <section id="servicios" className="bg-paper px-5 py-[clamp(64px,9vw,112px)]">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[640px]">
            <SectionLabel>01 Servicios</SectionLabel>
            <h2 className="mt-3.5 font-display text-[clamp(36px,5.4vw,60px)] leading-none font-extrabold tracking-[-0.01em] text-balance text-navy font-stretch-[82%]">
              Todo lo que tu auto necesita, en un solo lugar.
            </h2>
          </div>
          <p className="max-w-[380px] text-[17px] leading-normal text-muted text-pretty">
            Trabajamos con todas las marcas. Antes de cualquier reparación te pasamos el presupuesto para que lo apruebes.
          </p>
        </div>

        <ul className="m-0 mt-12 grid list-none grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 p-0">
          {SERVICES.map((service) => (
            <li
              key={service.title}
              className="rounded-xl border border-line bg-white p-7 transition-[box-shadow,border-color] duration-200 hover:border-navy hover:shadow-[0_18px_40px_-24px_rgba(1,34,94,0.45)]"
            >
              <div className="grid size-13 place-items-center rounded-lg bg-[#E4EAF5] text-navy">
                <Icon name={service.icon} size={26} />
              </div>
              <h3 className="mt-5 text-xl font-bold">{service.title}</h3>
              <p className="mt-2 leading-normal text-muted">{service.text}</p>
              <div className="mt-4.5 inline-block rounded bg-paper px-2.5 py-1 font-mono text-xs font-semibold tracking-[0.04em] text-navy">
                {service.tag}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const STEPS: { icon: IconName; title: string; text: React.ReactNode }[] = [
  { icon: "key", title: "Dejás el auto", text: "Lo revisamos con vos y abrimos la orden de trabajo." },
  {
    icon: "ticket",
    title: "Recibís tu código",
    text: (
      <>
        Te damos un código único, por ejemplo{" "}
        <span className="rounded bg-sand px-1.5 py-0.5 font-mono text-sm font-semibold text-ink">{SITE.trackingExample}</span>.
      </>
    ),
  },
  { icon: "phoneScreen", title: "Consultás el estado online", text: "Entrás a Seguimiento y ves en qué etapa está, sin llamar." },
  { icon: "checkCircle", title: "Te avisamos cuando está listo", text: "Cuando pasa a Listo para retirar, te contactamos para coordinar." },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-y border-line bg-white px-5 py-[clamp(64px,9vw,112px)]">
      <div className="mx-auto max-w-[1200px]">
        <SectionLabel>02 Cómo funciona</SectionLabel>
        <h2 className="mt-3.5 max-w-[760px] font-display text-[clamp(36px,5.4vw,60px)] leading-none font-extrabold tracking-[-0.01em] text-balance text-navy font-stretch-[82%]">
          Seguí la reparación de punta a punta.
        </h2>
        <ol className="m-0 mt-14 grid list-none grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-8 p-0">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <div className="flex items-center gap-3.5 text-navy">
                <span className="font-mono text-sm font-semibold text-orange-text">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon name={step.icon} size={34} stroke={1.7} />
              </div>
              <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 leading-normal text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const REASONS = [
  { title: "Presupuesto antes de tocar nada.", text: "No arrancamos ninguna reparación sin tu aprobación." },
  { title: "Todo queda registrado.", text: "Cada cambio de estado se guarda con fecha y hora, y lo ves al instante." },
  { title: "Equipo chico, trato directo.", text: "Cuatro mecánicos que conocen tu auto y te atienden en persona." },
];

export function WhyUs() {
  return (
    <section className="bg-[radial-gradient(700px_400px_at_100%_0%,rgba(228,103,21,0.18),transparent_60%),linear-gradient(180deg,#011a48,#010e2c)] px-5 py-[clamp(64px,9vw,104px)] text-white">
      <div className="mx-auto max-w-[1200px]">
        <SectionLabel light>03 Por qué elegirnos</SectionLabel>
        <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-px overflow-hidden rounded-xl bg-white/15">
          {REASONS.map((reason) => (
            <div key={reason.title} className="bg-navy-dark p-8">
              <h3 className="font-display text-[28px] leading-[1.05] font-extrabold font-stretch-[85%]">{reason.title}</h3>
              <p className="mt-3.5 leading-normal text-[#C9D4EA]">{reason.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  { quote: "Dejé el auto un lunes y sin llamar una sola vez supe cuándo pasar a buscarlo.", name: "Martina S.", car: "Fiat Cronos" },
  { quote: "Me pasaron el presupuesto antes de arrancar y no hubo sorpresas en la factura.", name: "Jorge F.", car: "Volkswagen Gol Trend" },
  { quote: "Hablé directo con el mecánico que trabajó en la camioneta. Se nota que saben.", name: "Ricardo B.", car: "Toyota Hilux" },
];

export function Testimonials() {
  return (
    <section className="bg-sand px-5 py-[clamp(64px,9vw,112px)]">
      <div className="mx-auto max-w-[1200px]">
        <SectionLabel>Lo que dicen nuestros clientes</SectionLabel>
        <h2 className="mt-3.5 max-w-[760px] font-display text-[clamp(32px,4.6vw,52px)] leading-none font-extrabold tracking-[-0.01em] text-balance text-navy font-stretch-[82%]">
          Confianza que se ve en cada orden.
        </h2>
        <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
          {TESTIMONIALS.map((item) => (
            <figure key={item.name} className="m-0 rounded-xl border border-line bg-white p-7">
              <div role="img" aria-label="5 de 5 estrellas" className="flex gap-0.5 text-orange">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Icon key={i} name="star" size={18} fill="currentColor" stroke={1} />
                ))}
              </div>
              <blockquote className="m-0 mt-4 text-lg leading-normal">“{item.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-navy font-bold text-white">{item.name[0]}</span>
                <span className="flex flex-col text-sm">
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-muted">{item.car}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

const CONTACT: { icon: IconName; label: string; value: React.ReactNode }[] = [
  { icon: "pin", label: "Dirección", value: SITE.address },
  {
    icon: "phone",
    label: "Teléfono",
    value: (
      <a href={SITE.phoneHref} className="text-navy">
        {SITE.phone}
      </a>
    ),
  },
  { icon: "chat", label: "WhatsApp", value: SITE.whatsapp },
  { icon: "mail", label: "Email", value: SITE.email },
  {
    icon: "clock",
    label: "Horarios",
    value: SITE.hours.map((line, i) => (
      <span key={line}>
        {i > 0 && <br />}
        {line}
      </span>
    )),
  },
];

export function Contact() {
  return (
    <section id="contacto" className="bg-paper px-5 py-[clamp(64px,9vw,112px)]">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-14">
        <div>
          <SectionLabel>04 Contacto</SectionLabel>
          <h2 className="mt-3.5 font-display text-[clamp(36px,5.4vw,60px)] leading-none font-extrabold tracking-[-0.01em] text-navy font-stretch-[82%]">
            Vení a vernos.
          </h2>
          <dl className="m-0 mt-8 flex flex-col gap-5">
            {CONTACT.map((item) => (
              <div key={item.label} className="flex items-start gap-3.5">
                <span className="mt-0.5 text-navy">
                  <Icon name={item.icon} size={22} />
                </span>
                <div>
                  <dt className="text-xs font-semibold tracking-[0.06em] text-muted uppercase">{item.label}</dt>
                  <dd className="m-0 mt-0.5 text-[17px]">{item.value}</dd>
                </div>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-muted">Datos de contacto ficticios, solo de ejemplo.</p>
        </div>

        {/* Decorative placeholder for a map. It carries no information of its own. */}
        <div
          aria-hidden="true"
          className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-[#E9E6E0] bg-[linear-gradient(#DEDAD3_1px,transparent_1px),linear-gradient(90deg,#DEDAD3_1px,transparent_1px)] bg-[size:36px_36px]"
        >
          <div className="absolute inset-x-0 top-[46%] h-9 -rotate-6 bg-white" />
          <div className="absolute inset-y-0 left-[38%] w-7 rotate-3 bg-white" />
          <div className="absolute top-[40%] left-[30%] flex flex-col items-center">
            <span className="grid size-12 place-items-center rounded-full bg-orange text-white shadow-lg">
              <Icon name="pin" size={24} />
            </span>
            <span className="mt-2 rounded bg-navy px-3 py-1.5 text-center text-xs font-semibold text-white">
              Taller Ruiz
              <br />
              <span className="font-normal text-[#C9D4EA]">Av. Warnes 1450</span>
            </span>
          </div>
          <span className="absolute right-3 bottom-3 rounded bg-white/90 px-2 py-1 font-mono text-[11px] text-muted">
            Mapa ilustrativo
          </span>
        </div>
      </div>
    </section>
  );
}
