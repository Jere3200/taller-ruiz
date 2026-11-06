"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "../icons";

interface MobileMenuProps {
  links: readonly { href: string; label: string }[];
}

/** Only the toggle and its panel are client code; the rest of the header stays on the server. */
export function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-[820px]:hidden">
      <button
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
        className="grid size-11 cursor-pointer place-items-center rounded-md border-0 bg-white/10 text-white"
      >
        <Icon name={open ? "close" : "menu"} size={22} />
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full flex flex-col gap-0.5 border-t border-white/10 bg-navy-dark px-5 pt-2 pb-4"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-3.5 text-[17px] text-white no-underline"
            >
              {link.label}
            </a>
          ))}
          <Link href="/login" className="mt-1 border-t border-white/10 py-3.5 text-sm text-[#A9B9DA] no-underline">
            Acceso empleados
          </Link>
        </div>
      )}
    </div>
  );
}
