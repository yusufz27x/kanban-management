import type { ReactNode } from "react";

export default function SharedTasksLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="clearlooks-app min-h-screen">
      <header className="clearlooks-bar border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <p className="font-semibold text-slate-950">Shared tasks</p>
          <span className="inline-flex shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Read-only
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}
