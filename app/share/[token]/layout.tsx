import type { ReactNode } from "react";

import { TaskPageHeader } from "@/components/task-page-header";

export default function SharedTasksLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="clearlooks-app min-h-screen">
      <TaskPageHeader
        action={
          <span className="inline-flex h-9 shrink-0 items-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600">
            Read-only
          </span>
        }
      />
      {children}
    </div>
  );
}
