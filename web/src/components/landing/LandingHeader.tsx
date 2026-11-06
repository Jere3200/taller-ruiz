import Link from "next/link";
import { Logo } from "../Logo";
import { MobileMenu } from "./MobileMenu";

export const NAV_LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#contacto", label: "Contacto" },
] as const;

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(1,30,84,0.88)] text-white backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1200px] items-center gap-7 px-5">
        <Link href="/" aria-label="Taller Ruiz, ir al inicio" className="flex items-center">
          <Logo variant="light" height={40} priority />
        </Link>

        <nav aria-label="Principal" className="hidden gap-1 min-[820px]:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2.5 text-[15px] font-medium text-[#D8E0EF] no-underline hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4.5">
          <Link
            href="/login"
            className="hidden text-[13px] text-[#A9B9DA] underline hover:text-white min-[820px]:inline"
          >
            Acceso empleados
          </Link>
          <Link
            href="/seguimiento"
            className="inline-flex h-11 items-center whitespace-nowrap rounded-md bg-orange px-4.5 text-[15px] font-bold text-ink no-underline hover:bg-orange-hover hover:text-ink"
          >
            Seguí tu reparación
          </Link>
          <MobileMenu links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
