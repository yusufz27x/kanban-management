"use client";

import { useMemo, useState } from "react";

import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "@/lib/supabase/database.types";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from "@/lib/tasks/constants";
import {
  isTaskDueSoon,
  isTaskOverdue,
} from "@/lib/tasks/dates";
import { useLocalDate } from "@/lib/tasks/use-local-date";
import type { ShareActionState } from "@/lib/validation/share";

import { ShareControls } from "./share-controls";
import { TaskCard } from "./task-card";
import { TaskForm } from "./task-form";
import { TaskRealtime } from "./task-realtime";

type QuickFilter = "all" | "completed" | "due_soon" | "overdue";

const quickFilters: { label: string; value: QuickFilter }[] = [
  { label: "All tasks", value: "all" },
  { label: "Overdue", value: "overdue" },
  { label: "Due soon", value: "due_soon" },
  { label: "Completed", value: "completed" },
];

type TaskDashboardProps = {
  initialShare: ShareActionState;
  tasks: Task[];
  userId: string;
};

export function TaskDashboard({
  initialShare,
  tasks,
  userId,
}: TaskDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">(
    "all",
  );
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const today = useLocalDate();

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesStatus =
          statusFilter === "all" || task.status === statusFilter;
        const matchesPriority =
          priorityFilter === "all" || task.priority === priorityFilter;
        const matchesQuickFilter =
          quickFilter === "all" ||
          (quickFilter === "completed" && task.status === "done") ||
          (quickFilter === "overdue" &&
            isTaskOverdue(task.due_date, task.status, today)) ||
          (quickFilter === "due_soon" &&
            isTaskDueSoon(task.due_date, task.status, today));

        return matchesStatus && matchesPriority && matchesQuickFilter;
      }),
    [priorityFilter, quickFilter, statusFilter, tasks, today],
  );

  const completedCount = tasks.filter((task) => task.status === "done").length;
  const openCount = tasks.length - completedCount;
  const dueSoonCount = tasks.filter((task) =>
    isTaskDueSoon(task.due_date, task.status, today),
  ).length;
  const filtersActive =
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    quickFilter !== "all";

  function resetFilters() {
    setStatusFilter("all");
    setPriorityFilter("all");
    setQuickFilter("all");
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Personal workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Your tasks
          </h1>
          <p className="mt-2 text-slate-600">
            Headline 1
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm font-medium text-slate-500">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} total
          </p>
          <TaskRealtime userId={userId} />
        </div>
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="lg:sticky lg:top-6">
          <TaskForm />
        </div>

        <div className="min-w-0 space-y-6">
          <ShareControls initialShare={initialShare} />

          <section
            aria-label="Task summary"
            className="grid grid-cols-3 gap-3"
          >
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-2xl font-semibold text-slate-950">{openCount}</p>
              <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                Open
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-2xl font-semibold text-amber-700">
                {dueSoonCount}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                Due soon
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-2xl font-semibold text-emerald-700">
                {completedCount}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                Completed
              </p>
            </div>
          </section>

          <section
            aria-labelledby="task-filters-heading"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2
                className="text-sm font-semibold text-slate-900"
                id="task-filters-heading"
              >
                Filter tasks
              </h2>
              <button
                className="rounded-md text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={!filtersActive}
                onClick={resetFilters}
                type="button"
              >
                Reset all
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Quick filters">
              {quickFilters.map((filter) => (
                <button
                  aria-pressed={quickFilter === filter.value}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 aria-pressed:border-emerald-700 aria-pressed:bg-emerald-700 aria-pressed:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                  key={filter.value}
                  onClick={() => setQuickFilter(filter.value)}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  htmlFor="status-filter"
                >
                  Status
                </label>
                <select
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  id="status-filter"
                  onChange={(event) =>
                    setStatusFilter(event.target.value as TaskStatus | "all")
                  }
                  value={statusFilter}
                >
                  <option value="all">All statuses</option>
                  {TASK_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {TASK_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  htmlFor="priority-filter"
                >
                  Priority
                </label>
                <select
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  id="priority-filter"
                  onChange={(event) =>
                    setPriorityFilter(
                      event.target.value as TaskPriority | "all",
                    )
                  }
                  value={priorityFilter}
                >
                  <option value="all">All priorities</option>
                  {TASK_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {TASK_PRIORITY_LABELS[priority]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {tasks.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <p className="text-lg font-semibold text-slate-900">
                Your task list is clear
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Add your first task.
              </p>
            </section>
          ) : filteredTasks.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <p className="font-semibold text-slate-900">
                No tasks match these filters
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Try another combination or reset all filters.
              </p>
              <button
                className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                onClick={resetFilters}
                type="button"
              >
                Show all tasks
              </button>
            </section>
          ) : (
            <section aria-label="Task list" className="space-y-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={`${task.id}:${task.updated_at}`}
                  task={task}
                  today={today}
                />
              ))}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
