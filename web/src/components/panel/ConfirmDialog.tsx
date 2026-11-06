"use client";

import { useEffect, useRef } from "react";
import { Icon } from "../icons";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  text: string;
  confirmLabel: string;
  /** `danger` is for cancelling; `primary` for closing the order as delivered. */
  tone: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

/** Native <dialog>: focus trap, Escape to close and inert background come from the browser. */
export function ConfirmDialog({ open, title, text, confirmLabel, tone, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const danger = tone === "danger";

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-text"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
      className="m-auto w-[min(440px,calc(100vw-32px))] rounded-xl border-0 p-0 shadow-2xl backdrop:bg-ink/55"
    >
      <div className="p-7">
        <div className="grid size-11 place-items-center rounded-full" style={{ background: danger ? "#FBE1E1" : "#E4EAF5", color: danger ? "#C0262D" : "#01225E" }}>
          <Icon name="warning" size={22} />
        </div>
        <h2 id="confirm-title" className="m-0 mt-4 text-xl font-bold">
          {title}
        </h2>
        <p id="confirm-text" className="m-0 mt-2 leading-normal text-muted">
          {text}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2.5">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className="h-11 cursor-pointer rounded-md border-2 border-field bg-white px-5 font-semibold text-ink hover:bg-paper"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-11 cursor-pointer rounded-md border-0 px-5 font-bold text-white"
            style={{ background: danger ? "#C0262D" : "#01225E" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
