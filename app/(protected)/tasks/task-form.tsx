"use client";

import { useActionState, useEffect, useRef } from "react";

import { StatusMessage } from "@/components/status-message";
import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_TITLE_MAX_LENGTH,
} from "@/lib/tasks/constants";
import type { TaskActionState } from "@/lib/validation/task";

import { createTask } from "./actions";

const initialState: TaskActionState = {};

export function TaskForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction, pending] = useActionState(
    createTask,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [onSuccess, state]);

  const titleError = state.fieldErrors?.title?.[0];
  const descriptionError = state.fieldErrors?.description?.[0];
  const priorityError = state.fieldErrors?.priority?.[0];
  const dueDateError = state.fieldErrors?.dueDate?.[0];

  return (
    <form
      action={formAction}
      aria-busy={pending}
      className="space-y-5"
      ref={formRef}
    >
        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-800"
            htmlFor="task-title"
          >
            Title
          </label>
          <input
            aria-describedby={titleError ? "task-title-error" : undefined}
            aria-invalid={Boolean(titleError)}
            autoFocus
            className="clearlooks-input h-11 w-full border px-3.5 text-sm outline-none transition placeholder:text-slate-500 aria-invalid:border-red-500"
            disabled={pending}
            id="task-title"
            maxLength={TASK_TITLE_MAX_LENGTH}
            name="title"
            placeholder="Prepare project notes"
            required
          />
          {titleError ? (
            <p className="mt-2 text-sm text-red-700" id="task-title-error">
              {titleError}
            </p>
          ) : null}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="task-description"
            >
              Description
            </label>
            <span className="text-xs text-slate-600">Optional</span>
          </div>
          <textarea
            aria-describedby={
              descriptionError ? "task-description-error" : undefined
            }
            aria-invalid={Boolean(descriptionError)}
            className="clearlooks-input min-h-28 w-full resize-y border px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-500 aria-invalid:border-red-500"
            disabled={pending}
            id="task-description"
            maxLength={TASK_DESCRIPTION_MAX_LENGTH}
            name="description"
            placeholder="Add any useful context…"
          />
          {descriptionError ? (
            <p
              className="mt-2 text-sm text-red-700"
              id="task-description-error"
            >
              {descriptionError}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-800"
              htmlFor="task-priority"
            >
              Priority
            </label>
            <select
              aria-describedby={
                priorityError ? "task-priority-error" : undefined
              }
              aria-invalid={Boolean(priorityError)}
              className="clearlooks-input h-11 w-full border px-3 text-sm outline-none transition aria-invalid:border-red-500"
              defaultValue="medium"
              disabled={pending}
              id="task-priority"
              name="priority"
            >
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {TASK_PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>
            {priorityError ? (
              <p
                className="mt-2 text-sm text-red-700"
                id="task-priority-error"
              >
                {priorityError}
              </p>
            ) : null}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label
                className="text-sm font-medium text-slate-800"
                htmlFor="task-due-date"
              >
                Due date
              </label>
              <span className="text-xs text-slate-600">Optional</span>
            </div>
            <input
              aria-describedby={
                dueDateError ? "task-due-date-error" : undefined
              }
              aria-invalid={Boolean(dueDateError)}
              className="clearlooks-input h-11 w-full border px-3 text-sm outline-none transition aria-invalid:border-red-500"
              disabled={pending}
              id="task-due-date"
              name="dueDate"
              type="date"
            />
            {dueDateError ? (
              <p
                className="mt-2 text-sm text-red-700"
                id="task-due-date-error"
              >
                {dueDateError}
              </p>
            ) : null}
          </div>
        </div>

        {state.message ? (
          <StatusMessage
            tone={state.status === "success" ? "success" : "error"}
          >
            {state.message}
          </StatusMessage>
        ) : null}

        <button
          className="clearlooks-button-primary flex h-11 w-full items-center justify-center px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Adding task…" : "Add task"}
        </button>
    </form>
  );
}
