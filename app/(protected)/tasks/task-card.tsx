"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "@/lib/supabase/database.types";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from "@/lib/tasks/constants";
import {
  formatDateOnly,
  isTaskDueSoon,
  isTaskOverdue,
} from "@/lib/tasks/dates";

import { deleteTask } from "./actions";
import { Modal } from "./modal";
import { TaskEditForm } from "./task-edit-form";

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

type TaskCardProps = {
  task: Task;
  today: string;
};

export function TaskCard({ task, today }: TaskCardProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteTask,
    {},
  );
  const overdue = isTaskOverdue(task.due_date, task.status, today);
  const dueSoon = isTaskDueSoon(task.due_date, task.status, today);
  const titleId = `task-title-${task.id}`;
  const deletePromptId = `delete-prompt-${task.id}`;

  const closeTask = useCallback(() => {
    setOpen(false);
    setEditing(false);
    setConfirmingDelete(false);
  }, []);

  useEffect(() => {
    if (confirmingDelete) {
      cancelDeleteRef.current?.focus();
    }
  }, [confirmingDelete]);

  const dueDate = task.due_date ? formatDateOnly(task.due_date) : "No due date";

  return (
    <>
      <article
        aria-labelledby={titleId}
        className={`clearlooks-card overflow-hidden border transition hover:-translate-y-0.5 ${
          overdue ? "border-red-300" : "border-slate-200"
        }`}
      >
        <button
          aria-haspopup="dialog"
          className="block w-full p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#3465a4] sm:p-3.5"
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

      <Modal onClose={closeTask} open={open} title="Task">
        {editing ? (
          <TaskEditForm
            onCancel={() => setEditing(false)}
            onSuccess={closeTask}
            task={task}
          />
        ) : (
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

            {confirmingDelete ? (
              <div
                aria-labelledby={deletePromptId}
                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3"
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setConfirmingDelete(false);
                  }
                }}
                role="group"
              >
                <p
                  className="text-sm font-medium text-red-800"
                  id={deletePromptId}
                >
                  Permanently delete this task?
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    className="clearlooks-button px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
                    disabled={deletePending}
                    onClick={() => setConfirmingDelete(false)}
                    ref={cancelDeleteRef}
                    type="button"
                  >
                    Cancel
                  </button>
                  <form action={deleteAction} aria-busy={deletePending}>
                    <input name="taskId" type="hidden" value={task.id} />
                    <button
                      className="clearlooks-button-danger px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={deletePending}
                      type="submit"
                    >
                      {deletePending ? "Deleting…" : "Delete"}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  className="clearlooks-button-danger px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
                  onClick={() => setConfirmingDelete(true)}
                  type="button"
                >
                  Delete
                </button>
                <button
                  className="clearlooks-button-primary px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
                  onClick={() => setEditing(true)}
                  type="button"
                >
                  Edit
                </button>
              </div>
            )}

            {deleteState.status === "error" ? (
              <p className="mt-3 text-sm text-red-700" role="alert">
                {deleteState.message}
              </p>
            ) : null}
          </div>
        )}
      </Modal>
    </>
  );
}
