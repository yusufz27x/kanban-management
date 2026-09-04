import type { ComponentPropsWithoutRef } from "react";

import type { TaskStatus } from "@/lib/supabase/database.types";
import { TASK_STATUS_LABELS } from "@/lib/tasks/constants";

const columnAccentClasses: Record<TaskStatus, string> = {
  todo: "bg-slate-400",
  in_progress: "bg-amber-500",
  done: "bg-emerald-500",
};

type TaskColumnFrameProps = ComponentPropsWithoutRef<"section"> & {
  count: number;
  headingId: string;
  status: TaskStatus;
};

export function TaskColumnFrame({
  children,
  className = "",
  count,
  headingId,
  status,
  ...sectionProps
}: TaskColumnFrameProps) {
  return (
    <section
      aria-labelledby={headingId}
      className={`clearlooks-column min-w-0 border p-3 sm:p-4 ${className}`}
      {...sectionProps}
    >
      <header className="flex items-center justify-between gap-3 px-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={`size-2.5 shrink-0 rounded-full ${columnAccentClasses[status]}`}
          />
          <h2
            className="truncate text-sm font-semibold text-slate-900"
            id={headingId}
          >
            {TASK_STATUS_LABELS[status]}
          </h2>
        </div>
        <span
          aria-label={`${count} ${count === 1 ? "task" : "tasks"}`}
          className="clearlooks-card inline-flex min-w-7 justify-center border px-2 py-1 text-xs font-semibold text-slate-600"
        >
          {count}
        </span>
      </header>

      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function EmptyTaskColumn() {
  return (
    <div className="clearlooks-card border border-dashed px-4 py-8 text-center">
      <p className="text-sm font-medium text-slate-600">No tasks</p>
    </div>
  );
}
