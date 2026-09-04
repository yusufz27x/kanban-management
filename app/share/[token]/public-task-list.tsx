"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/app/(protected)/tasks/modal";
import {
  TaskFilters,
  type QuickFilter,
} from "@/app/(protected)/tasks/task-filters";
import type {
  PublicTask,
  TaskPriority,
  TaskStatus,
} from "@/lib/supabase/database.types";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from "@/lib/tasks/constants";
import {
  formatDateOnly,
  isTaskDueSoon,
  isTaskOverdue,
} from "@/lib/tasks/dates";
import { useLocalDate } from "@/lib/tasks/use-local-date";

const priorityBadgeClasses: Record<TaskPriority, string> = {
  low: "border-sky-200 bg-sky-50 text-sky-700",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-red-200 bg-red-50 text-red-700",
};

const statusBadgeClasses: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-amber-100 text-amber-800",
  done: "bg-emerald-100 text-emerald-800",
};

const columnAccentClasses: Record<TaskStatus, string> = {
  todo: "bg-slate-400",
  in_progress: "bg-amber-500",
  done: "bg-emerald-500",
};

export function PublicTaskList({ tasks }: { tasks: PublicTask[] }) {
  const [statusFilters, setStatusFilters] = useState<TaskStatus[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<TaskPriority[]>([]);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const today = useLocalDate();

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesStatus =
          statusFilters.length === 0 || statusFilters.includes(task.status);
        const matchesPriority =
          priorityFilters.length === 0 ||
          priorityFilters.includes(task.priority);
        const matchesQuickFilter =
          quickFilter === "all" ||
          (quickFilter === "overdue" &&
            isTaskOverdue(task.due_date, task.status, today)) ||
          (quickFilter === "due_soon" &&
            isTaskDueSoon(task.due_date, task.status, today));

        return matchesStatus && matchesPriority && matchesQuickFilter;
      }),
    [priorityFilters, quickFilter, statusFilters, tasks, today],
  );

  const tasksByStatus = useMemo(
    () =>
      Object.fromEntries(
        TASK_STATUSES.map((status) => [
          status,
          filteredTasks.filter((task) => task.status === status),
        ]),
      ) as Record<TaskStatus, PublicTask[]>,
    [filteredTasks],
  );
  const visibleStatuses =
    statusFilters.length > 0
      ? TASK_STATUSES.filter((status) => statusFilters.includes(status))
      : TASK_STATUSES;
  const boardGridClasses =
    visibleStatuses.length === 2
      ? "md:grid-cols-2"
      : visibleStatuses.length === 3
        ? "md:grid-cols-3"
        : "";

  function resetFilters() {
    setStatusFilters([]);
    setPriorityFilters([]);
    setQuickFilter("all");
  }

  if (tasks.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <p className="text-lg font-semibold text-slate-900">No tasks</p>
      </section>
    );
  }

  return (
    <>
      <div
        aria-label="Shared task controls"
        className="mb-7 flex flex-wrap items-center gap-2"
        role="group"
      >
        <TaskFilters
          filteredCount={filteredTasks.length}
          onPrioritiesChange={setPriorityFilters}
          onQuickChange={setQuickFilter}
          onReset={resetFilters}
          onStatusesChange={setStatusFilters}
          priorities={priorityFilters}
          quick={quickFilter}
          statuses={statusFilters}
          totalCount={tasks.length}
        />
      </div>

      {filteredTasks.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="font-semibold text-slate-900">No matches</p>
          <button
            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            onClick={resetFilters}
            type="button"
          >
            Reset
          </button>
        </section>
      ) : (
        <section aria-label="Shared task board">
          <div className={`grid items-start gap-4 ${boardGridClasses}`}>
            {visibleStatuses.map((status) => (
              <PublicTaskColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                today={today}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function PublicTaskColumn({
  status,
  tasks,
  today,
}: {
  status: TaskStatus;
  tasks: PublicTask[];
  today: string;
}) {
  const headingId = `public-task-column-${status}`;

  return (
    <section
      aria-labelledby={headingId}
      className="min-w-0 rounded-2xl border border-slate-200 bg-slate-100/80 p-3 sm:p-4"
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
          className="inline-flex min-w-7 justify-center rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm"
        >
          {tasks.length}
        </span>
      </header>

      <div className="mt-3 space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <PublicTaskCard key={task.id} task={task} today={today} />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-500">No tasks</p>
          </div>
        )}
      </div>
    </section>
  );
}

function PublicTaskCard({
  task,
  today,
}: {
  task: PublicTask;
  today: string;
}) {
  const [open, setOpen] = useState(false);
  const overdue = isTaskOverdue(task.due_date, task.status, today);
  const dueSoon = isTaskDueSoon(task.due_date, task.status, today);
  const dueDate = task.due_date ? formatDateOnly(task.due_date) : "No due date";
  const titleId = `public-task-title-${task.id}`;

  return (
    <>
      <article
        aria-labelledby={titleId}
        className={`overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
          overdue ? "border-red-300" : "border-slate-200"
        }`}
      >
        <button
          aria-haspopup="dialog"
          className="block w-full p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-emerald-700 sm:p-3.5"
          onClick={() => setOpen(true)}
          type="button"
        >
          <div className="flex items-center justify-between gap-3">
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${priorityBadgeClasses[task.priority]}`}
            >
              {TASK_PRIORITY_LABELS[task.priority]}
            </span>
            <span
              className={`shrink-0 text-right text-xs font-medium ${
                overdue
                  ? "text-red-700"
                  : dueSoon
                    ? "text-amber-700"
                    : "text-slate-500"
              }`}
            >
              {overdue ? "Overdue · " : dueSoon ? "Due soon · " : ""}
              {task.due_date ? (
                <time dateTime={task.due_date}>{dueDate}</time>
              ) : (
                dueDate
              )}
            </span>
          </div>
          <h3
            className={`mt-2 line-clamp-2 break-words text-sm font-semibold leading-5 text-slate-950 ${
              task.status === "done"
                ? "line-through decoration-slate-400"
                : ""
            }`}
            id={titleId}
          >
            {task.title}
          </h3>
          {task.description ? (
            <p className="mt-1.5 line-clamp-2 break-words text-xs leading-5 text-slate-500">
              {task.description}
            </p>
          ) : null}
        </button>
      </article>

      <Modal onClose={() => setOpen(false)} open={open} title="Task">
        <div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityBadgeClasses[task.priority]}`}
            >
              {TASK_PRIORITY_LABELS[task.priority]} priority
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClasses[task.status]}`}
            >
              {TASK_STATUS_LABELS[task.status]}
            </span>
          </div>

          <h3 className="mt-4 break-words text-xl font-semibold text-slate-950">
            {task.title}
          </h3>

          {task.description ? (
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
              {task.description}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No description</p>
          )}

          <dl className="mt-5 border-y border-slate-200 py-4">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm font-medium text-slate-500">Due date</dt>
              <dd
                className={`text-sm font-semibold ${
                  overdue
                    ? "text-red-700"
                    : dueSoon
                      ? "text-amber-700"
                      : "text-slate-800"
                }`}
              >
                {overdue ? "Overdue · " : dueSoon ? "Due soon · " : ""}
                {task.due_date ? (
                  <time dateTime={task.due_date}>{dueDate}</time>
                ) : (
                  dueDate
                )}
              </dd>
            </div>
          </dl>
        </div>
      </Modal>
    </>
  );
}
