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
          <span
            className="clearlooks-badge inline-flex h-9 shrink-0 items-center px-4 text-sm font-semibold"
            data-tone="neutral"
          >
            Read-only
          </span>
        }
      />
      {children}
    </div>
  );
}
