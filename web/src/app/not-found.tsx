import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-10 text-center">
      <div>
        <div className="flex justify-center">
          <Logo height={40} />
        </div>
        <h1 className="m-0 mt-8 font-display text-[clamp(40px,8vw,64px)] leading-none font-extrabold text-navy font-stretch-[80%]">
          No encontramos esa página
        </h1>
        <p className="mt-3 text-lg text-muted">Puede que el enlace esté mal escrito o que la página ya no exista.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex h-12 items-center rounded-md bg-navy px-6 font-bold text-white no-underline hover:bg-navy-dark hover:text-white">
            Ir al inicio
          </Link>
          <Link href="/seguimiento" className="inline-flex h-12 items-center rounded-md border-2 border-field bg-white px-6 font-semibold text-ink no-underline hover:bg-paper">
            Seguí tu reparación
          </Link>
        </div>
      </div>
    </main>
  );
}
