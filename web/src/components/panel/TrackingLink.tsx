"use client";

import { useState } from "react";
import { Icon } from "../icons";
import { useToast } from "./ToastProvider";

/** Lets the employee copy the public tracking link to share it with the customer. */
export function TrackingLink({ code }: { code: string }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const path = `/seguimiento?codigo=${encodeURIComponent(code)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
      toast("ok", "Link de seguimiento copiado.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast("error", "No pudimos copiar el link. Copialo a mano.");
    }
  }

  return (
    <section className="rounded-[10px] border border-edge bg-white p-5.5">
      <h2 className="m-0 text-lg font-bold">Link de seguimiento</h2>
      <p className="m-0 mt-2 text-muted">Compartilo con el cliente para que consulte el estado sin llamar.</p>
      <div className="mt-3.5 overflow-x-auto rounded-md bg-paper px-3.5 py-2.5 font-mono text-sm">{path}</div>
      <button
        type="button"
        onClick={copy}
        className="mt-3.5 flex h-11 cursor-pointer items-center gap-2 rounded-md border-2 border-field bg-white px-5 font-semibold hover:bg-paper"
      >
        <Icon name={copied ? "check" : "copy"} size={18} />
        {copied ? "Link copiado" : "Copiar link"}
      </button>
    </section>
  );
}
