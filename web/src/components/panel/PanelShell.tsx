"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Icon } from "../icons";
import { Logo } from "../Logo";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function PanelSkeleton() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper" aria-busy="true">
      <span className="anim-spin size-8 rounded-full border-[3px] border-line border-t-navy" role="status" aria-label="Cargando" />
    </div>
  );
}

const navItem = "flex h-11 w-full items-center gap-3 rounded-md px-3 text-[15px] font-medium no-underline";

/** Guards everything under /panel: without a session the visitor goes to /login. */
export function PanelShell({ children }: { children: React.ReactNode }) {
  const { session, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const inDetail = pathname.startsWith("/panel/ordenes/");

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  if (!ready || !session) return <PanelSkeleton />;

  return (
    <div className="grid min-h-screen grid-cols-[76px_1fr] bg-paper min-[980px]:grid-cols-[244px_1fr]">
      <aside className="sticky top-0 flex h-screen flex-col gap-1 bg-navy px-3 py-4 text-white">
        <div className="mb-5 flex h-11 items-center justify-center min-[980px]:justify-start min-[980px]:px-1">
          <span className="min-[980px]:hidden">
            <Logo variant="markLight" height={34} />
          </span>
          <span className="hidden min-[980px]:block">
            <Logo variant="light" height={34} />
          </span>
        </div>

        <Link
          href="/panel"
          title="Órdenes"
          aria-current={pathname === "/panel" || inDetail ? "page" : undefined}
          className={`${navItem} justify-center bg-white/10 text-white min-[980px]:justify-start`}
        >
          <Icon name="orders" size={20} />
          <span className="hidden min-[980px]:inline">Órdenes</span>
        </Link>
        <Link
          href="/"
          title="Ver sitio público"
          className={`${navItem} justify-center text-[#C9D4EA] hover:bg-white/10 hover:text-white min-[980px]:justify-start`}
        >
          <Icon name="external" size={20} />
          <span className="hidden min-[980px]:inline">Ver sitio público</span>
        </Link>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-edge bg-white px-[clamp(16px,3vw,32px)]">
          <nav aria-label="Ruta" className="flex items-center gap-2 text-[15px]">
            <Link href="/panel" className={`font-semibold no-underline ${inDetail ? "text-navy" : "text-ink"}`}>
              Órdenes
            </Link>
            {inDetail && (
              <>
                <Icon name="chevronRight" size={14} className="text-faint" />
                <span className="font-semibold text-ink" aria-current="page">
                  Detalle de la orden
                </span>
              </>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-3.5">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-full bg-[#E4EAF5] text-[13px] font-bold text-navy"
              >
                {initials(session.user.name)}
              </span>
              <span className="hidden text-[15px] font-semibold min-[980px]:inline">{session.user.name}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-field bg-white px-3.5 text-sm font-semibold hover:bg-paper"
            >
              <Icon name="logout" size={16} />
              Cerrar sesión
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
