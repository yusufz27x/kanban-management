"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";

type ModalProps = {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
};

export function Modal({ children, onClose, open, title }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      aria-labelledby={titleId}
      className="clearlooks-dialog m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-hidden p-0 text-slate-950 backdrop:bg-slate-950/45 backdrop:backdrop-blur-[1px]"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onClose={() => {
        if (open) {
          onClose();
        }
      }}
      ref={dialogRef}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <header className="clearlooks-bar flex shrink-0 items-center justify-between gap-4 border-b px-5 py-3.5 sm:px-6">
          <h2 className="text-lg font-semibold text-slate-950" id={titleId}>
            {title}
          </h2>
          <button
            aria-label={`Close ${title}`}
            className="clearlooks-button px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </header>
        <div className="overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </dialog>
  );
}
