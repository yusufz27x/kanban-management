"use client";

import type { PublicTask, TaskPriority } from "@/lib/supabase/database.types";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from "@/lib/tasks/constants";
import {
  formatDateOnly,
  isTaskDueSoon,
  isTaskOverdue,
} from "@/lib/tasks/dates";
import { useLocalDate } from "@/lib/tasks/use-local-date";

const badgeClasses: Record<TaskPriority, string> = {
  low: "border-sky-200 bg-sky-50 text-sky-700",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-red-200 bg-red-50 text-red-700",
};

export function PublicTaskList({ tasks }: { tasks: PublicTask[] }) {
  const today = useLocalDate();

  if (tasks.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <p className="text-lg font-semibold text-slate-900">
          This task list is clear
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          There are no tasks to show right now.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Shared task list" className="space-y-4">
      {tasks.map((task) => {
        const overdue = isTaskOverdue(task.due_date, task.status, today);
        const dueSoon = isTaskDueSoon(task.due_date, task.status, today);

        return (
          <article
            className={`rounded-2xl border bg-white p-5 shadow-sm sm:p-6 ${
              overdue ? "border-red-300" : "border-slate-200"
            }`}
            key={task.id}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClasses[task.priority]}`}
                  >
                    {TASK_PRIORITY_LABELS[task.priority]} priority
                  </span>
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {TASK_STATUS_LABELS[task.status]}
                  </span>
                </div>
                <h2
                  className={`mt-4 break-words text-lg font-semibold leading-7 text-slate-950 ${
                    task.status === "done"
                      ? "line-through decoration-slate-400"
                      : ""
                  }`}
                >
                  {task.title}
                </h2>
                {task.description ? (
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                    {task.description}
                  </p>
                ) : null}
              </div>

              <div
                className={`flex shrink-0 items-center rounded-xl px-3 py-2 text-sm font-medium sm:text-right ${
                  overdue
                    ? "bg-red-50 text-red-700"
                    : dueSoon
                      ? "bg-amber-50 text-amber-800"
                      : "bg-slate-50 text-slate-600"
                }`}
              >
                {task.due_date ? (
                  <>
                    {overdue ? "Overdue · " : dueSoon ? "Due soon · " : "Due "}
                    <time dateTime={task.due_date}>
                      {formatDateOnly(task.due_date)}
                    </time>
                  </>
                ) : (
                  "No due date"
                )}
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
