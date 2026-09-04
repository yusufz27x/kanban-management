"use client";

import { useCallback, useMemo, useState } from "react";

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

import { Modal } from "./modal";
import { ShareControls } from "./share-controls";
import { TaskColumn } from "./task-column";
import { TaskForm } from "./task-form";
import { TaskRealtime } from "./task-realtime";

type QuickFilter = "all" | "completed" | "due_soon" | "overdue";
type DashboardDialog = "filters" | "new-task" | "sharing";

const quickFilters: { label: string; value: QuickFilter }[] = [
  { label: "All", value: "all" },
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
  const [activeDialog, setActiveDialog] = useState<DashboardDialog>();
  const [taskFormVersion, setTaskFormVersion] = useState(0);
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

  const tasksByStatus = useMemo(
    () =>
      Object.fromEntries(
        TASK_STATUSES.map((status) => [
          status,
          filteredTasks.filter((task) => task.status === status),
        ]),
      ) as Record<TaskStatus, Task[]>,
    [filteredTasks],
  );
  const filtersActive =
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    quickFilter !== "all";
  const activeFilterCount =
    Number(statusFilter !== "all") +
    Number(priorityFilter !== "all") +
    Number(quickFilter !== "all");

  const closeDialog = useCallback(() => setActiveDialog(undefined), []);
  const handleTaskCreated = useCallback(() => {
    setActiveDialog(undefined);
    setTaskFormVersion((version) => version + 1);
  }, []);

  function resetFilters() {
    setStatusFilter("all");
    setPriorityFilter("all");
    setQuickFilter("all");
  }

  return (
    <main
      className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10"
      id="main-content"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Tasks
          </h1>
        </div>
        <div className="sm:text-right">
          <p className="text-sm font-medium text-slate-500">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </p>
          <TaskRealtime userId={userId} />
        </div>
      </div>

      <div
        aria-label="Task controls"
        className="mb-7 flex flex-wrap items-center gap-2"
        role="group"
      >
        <button
          aria-expanded={activeDialog === "new-task"}
          aria-haspopup="dialog"
          className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          onClick={() => setActiveDialog("new-task")}
          type="button"
        >
          New task
        </button>
        <button
          aria-expanded={activeDialog === "sharing"}
          aria-haspopup="dialog"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
          onClick={() => setActiveDialog("sharing")}
          type="button"
        >
          Sharing
        </button>
        <button
          aria-expanded={activeDialog === "filters"}
          aria-haspopup="dialog"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
          onClick={() => setActiveDialog("filters")}
          type="button"
        >
          Filters
          {activeFilterCount > 0 ? (
            <span className="inline-flex min-w-5 justify-center rounded-full bg-emerald-700 px-1.5 py-0.5 text-xs text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      <Modal
        onClose={closeDialog}
        open={activeDialog === "new-task"}
        title="New task"
      >
        <TaskForm key={taskFormVersion} onSuccess={handleTaskCreated} />
      </Modal>

      <Modal
        onClose={closeDialog}
        open={activeDialog === "sharing"}
        title="Sharing"
      >
        <ShareControls initialShare={initialShare} />
      </Modal>

      <Modal
        onClose={closeDialog}
        open={activeDialog === "filters"}
        title="Filters"
      >
        <div
          aria-label="Quick filters"
          className="flex flex-wrap gap-2"
          role="group"
        >
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

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              htmlFor="status-filter"
            >
              Status
            </label>
            <select
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
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
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              id="priority-filter"
              onChange={(event) =>
                setPriorityFilter(event.target.value as TaskPriority | "all")
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

        <p
          aria-atomic="true"
          aria-live="polite"
          className="mt-5 text-sm font-medium text-slate-500"
        >
          {filteredTasks.length} of {tasks.length}{" "}
          {tasks.length === 1 ? "task" : "tasks"}
        </p>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <button
            className="rounded-lg px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
            disabled={!filtersActive}
            onClick={resetFilters}
            type="button"
          >
            Reset
          </button>
          <button
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            onClick={closeDialog}
            type="button"
          >
            Done
          </button>
        </div>
      </Modal>

      {tasks.length > 0 && filteredTasks.length === 0 ? (
        <section className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
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
        <section aria-label="Task board" className="mt-7">
          <div className="grid items-start gap-4 md:grid-cols-3">
            {TASK_STATUSES.map((status) => (
              <TaskColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                today={today}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
