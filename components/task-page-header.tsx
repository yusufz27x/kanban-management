import type { ReactNode } from "react";

type TaskPageHeaderProps = {
  action: ReactNode;
  label?: string;
};

export function TaskPageHeader({ action, label }: TaskPageHeaderProps) {
  return (
    <header className="clearlooks-bar border-b">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        {label ? (
          <p className="min-w-0 truncate text-sm font-semibold text-slate-800">
            {label}
          </p>
        ) : null}
        <div className="ml-auto flex shrink-0 items-center">{action}</div>
      </div>
    </header>
  );
}
