import type { Metadata } from "next";
import { Suspense } from "react";
import { PanelShell } from "@/components/panel/PanelShell";
import { ToastProvider } from "@/components/panel/ToastProvider";

export const metadata: Metadata = { title: { default: "Panel", template: "%s | Panel Taller Ruiz" }, robots: { index: false } };

function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper" aria-busy="true">
      <span className="anim-spin size-8 rounded-full border-[3px] border-line border-t-navy" role="status" aria-label="Cargando" />
    </div>
  );
}

export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return (
    <ToastProvider>
      {/* PanelShell reads the current path (a runtime value), so it streams in under Suspense. */}
      <Suspense fallback={<Loading />}>
        <PanelShell>{children}</PanelShell>
      </Suspense>
    </ToastProvider>
  );
}
