import Link from "next/link";
import { Logo } from "../Logo";

export function LandingFooter() {
  return (
    <footer className="bg-navy-deep px-5 py-9 text-[#C9D4EA]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6">
        <Logo variant="light" height={34} />
        <nav aria-label="Pie de página" className="flex gap-6 text-sm">
          <Link href="/seguimiento" className="text-[#C9D4EA] hover:text-white">
            Seguí tu reparación
          </Link>
          <Link href="/login" className="text-[#C9D4EA] hover:text-white">
            Acceso empleados
          </Link>
        </nav>
        <p className="m-0 w-full text-[13px] text-[#8FA0C4]">© 2026 Taller Ruiz. Proyecto universitario, prueba de concepto.</p>
      </div>
    </footer>
  );
}
