"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_TITLE_MAX_LENGTH,
} from "@/lib/tasks/constants";
import type { TaskActionState } from "@/lib/validation/task";

import { createTask } from "./actions";

const initialState: TaskActionState = {};

export function TaskForm() {
  const [state, formAction, pending] = useActionState(
    createTask,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  const titleError = state.fieldErrors?.title?.[0];
  const descriptionError = state.fieldErrors?.description?.[0];
  const priorityError = state.fieldErrors?.priority?.[0];
  const dueDateError = state.fieldErrors?.dueDate?.[0];

  return (
    <section
      aria-labelledby="create-task-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          New task
        </p>
        <h2
          className="mt-2 text-xl font-semibold tracking-tight text-slate-950"
          id="create-task-heading"
        >
          Add to your list
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Headline 1
        </p>
      </div>

      <form action={formAction} className="space-y-5" ref={formRef}>
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
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 aria-invalid:border-red-500"
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
            <span className="text-xs text-slate-400">Optional</span>
          </div>
          <textarea
            aria-describedby={
              descriptionError ? "task-description-error" : undefined
            }
            aria-invalid={Boolean(descriptionError)}
            className="min-h-28 w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 aria-invalid:border-red-500"
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
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
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 aria-invalid:border-red-500"
              defaultValue="medium"
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
              <span className="text-xs text-slate-400">Optional</span>
            </div>
            <input
              aria-describedby={
                dueDateError ? "task-due-date-error" : undefined
              }
              aria-invalid={Boolean(dueDateError)}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 aria-invalid:border-red-500"
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
          <p
            aria-live="polite"
            className={`rounded-xl border px-3.5 py-3 text-sm ${
              state.status === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
            role={state.status === "error" ? "alert" : "status"}
          >
            {state.message}
          </p>
        ) : null}

        <button
          className="flex h-11 w-full items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Adding task…" : "Add task"}
        </button>
      </form>
    </section>
  );
}
