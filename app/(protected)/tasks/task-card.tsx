"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import type {
  Task,
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

import { deleteTask, updateTaskStatus } from "./actions";

const badgeClasses: Record<TaskPriority, string> = {
  low: "border-sky-200 bg-sky-50 text-sky-700",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-red-200 bg-red-50 text-red-700",
};

type TaskCardProps = {
  task: Task;
  today: string;
};

export function TaskCard({ task, today }: TaskCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const [statusState, statusAction, statusPending] = useActionState(
    updateTaskStatus,
    {},
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteTask,
    {},
  );
  const overdue = isTaskOverdue(task.due_date, task.status, today);
  const dueSoon = isTaskDueSoon(task.due_date, task.status, today);
  const titleId = `task-title-${task.id}`;
  const statusErrorId = `status-error-${task.id}`;
  const deleteConfirmationId = `delete-confirmation-${task.id}`;
  const deletePromptId = `delete-prompt-${task.id}`;

  useEffect(() => {
    if (confirmingDelete) {
      cancelDeleteRef.current?.focus();
    }
  }, [confirmingDelete]);

  function cancelDelete() {
    setConfirmingDelete(false);
    window.requestAnimationFrame(() => deleteButtonRef.current?.focus());
  }

  return (
    <article
      aria-labelledby={titleId}
      className={`rounded-2xl border bg-white p-5 shadow-sm transition sm:p-6 ${
        overdue ? "border-red-300" : "border-slate-200"
      }`}
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
          <h3
            className={`mt-4 break-words text-lg font-semibold leading-7 text-slate-950 ${
              task.status === "done" ? "line-through decoration-slate-400" : ""
            }`}
            id={titleId}
          >
            {task.title}
          </h3>
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

      <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 lg:flex-row lg:items-end lg:justify-between">
        <form
          action={statusAction}
          aria-busy={statusPending}
          className="flex flex-wrap items-end gap-2"
        >
          <input name="taskId" type="hidden" value={task.id} />
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              htmlFor={`status-${task.id}`}
            >
              Status
            </label>
            <select
              aria-describedby={
                statusState.status === "error" ? statusErrorId : undefined
              }
              aria-invalid={statusState.status === "error"}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              defaultValue={task.status}
              disabled={statusPending}
              id={`status-${task.id}`}
              name="status"
            >
              {TASK_STATUSES.map((status: TaskStatus) => (
                <option key={status} value={status}>
                  {TASK_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <button
            className="h-10 rounded-lg bg-slate-900 px-3.5 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={statusPending}
            type="submit"
          >
            {statusPending ? "Saving…" : "Save"}
          </button>
        </form>

        {confirmingDelete ? (
          <div
            aria-labelledby={deletePromptId}
            className="rounded-xl border border-red-200 bg-red-50 p-3"
            id={deleteConfirmationId}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                cancelDelete();
              }
            }}
            role="group"
          >
            <p
              className="break-words text-sm font-medium text-red-800"
              id={deletePromptId}
            >
              Permanently delete “{task.title}”?
            </p>
            <div className="mt-2 flex gap-2">
              <button
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
                disabled={deletePending}
                onClick={cancelDelete}
                ref={cancelDeleteRef}
                type="button"
              >
                Cancel
              </button>
              <form action={deleteAction} aria-busy={deletePending}>
                <input name="taskId" type="hidden" value={task.id} />
                <button
                  aria-label={`Permanently delete ${task.title}`}
                  className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={deletePending}
                  type="submit"
                >
                  {deletePending ? "Deleting…" : "Delete task"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <button
            aria-controls={deleteConfirmationId}
            aria-label={`Delete ${task.title}`}
            className="self-start rounded-lg px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 lg:self-auto"
            onClick={() => setConfirmingDelete(true)}
            ref={deleteButtonRef}
            type="button"
          >
            Delete
          </button>
        )}
      </div>

      {statusState.status === "error" ? (
        <p
          className="mt-3 text-sm text-red-700"
          id={statusErrorId}
          role="alert"
        >
          {statusState.message}
        </p>
      ) : null}
      {deleteState.status === "error" ? (
        <p aria-live="polite" className="mt-3 text-sm text-red-700" role="alert">
          {deleteState.message}
        </p>
      ) : null}
    </article>
  );
}
