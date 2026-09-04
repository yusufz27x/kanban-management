import type { Task, TaskStatus } from "@/lib/supabase/database.types";
import { TASK_STATUS_LABELS } from "@/lib/tasks/constants";

import { TaskCard } from "./task-card";

const columnAccentClasses: Record<TaskStatus, string> = {
  todo: "bg-slate-400",
  in_progress: "bg-amber-500",
  done: "bg-emerald-500",
};

type TaskColumnProps = {
  status: TaskStatus;
  tasks: Task[];
  today: string;
};

export function TaskColumn({ status, tasks, today }: TaskColumnProps) {
  const headingId = `task-column-${status}`;

  return (
    <section
      aria-labelledby={headingId}
      className="clearlooks-column min-w-0 border p-3 sm:p-4"
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
          aria-label={`${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`}
          className="clearlooks-card inline-flex min-w-7 justify-center border px-2 py-1 text-xs font-semibold text-slate-600"
        >
          {tasks.length}
        </span>
      </header>

      <div className="mt-3 space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={`${task.id}:${task.updated_at}`}
              task={task}
              today={today}
            />
          ))
        ) : (
          <div className="clearlooks-card border border-dashed px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-500">No tasks</p>
          </div>
        )}
      </div>
    </section>
  );
}
