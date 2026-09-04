"use client";

import { useActionState, useEffect, useId } from "react";

import { StatusMessage } from "@/components/status-message";
import type { Task } from "@/lib/supabase/database.types";
import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_TITLE_MAX_LENGTH,
} from "@/lib/tasks/constants";
import type { TaskActionState } from "@/lib/validation/task";

import { updateTask } from "./actions";

const initialState: TaskActionState = {};

type TaskEditFormProps = {
  onCancel: () => void;
  onSuccess: () => void;
  task: Task;
};

export function TaskEditForm({
  onCancel,
  onSuccess,
  task,
}: TaskEditFormProps) {
  const [state, formAction, pending] = useActionState(
    updateTask,
    initialState,
  );
  const formId = useId();
  const titleId = `${formId}-title`;
  const descriptionId = `${formId}-description`;
  const priorityId = `${formId}-priority`;
  const statusId = `${formId}-status`;
  const dueDateId = `${formId}-due-date`;

  useEffect(() => {
    if (state.status === "success") {
      onSuccess();
    }
  }, [onSuccess, state.status]);

  const titleError = state.fieldErrors?.title?.[0];
  const descriptionError = state.fieldErrors?.description?.[0];
  const priorityError = state.fieldErrors?.priority?.[0];
  const statusError = state.fieldErrors?.status?.[0];
  const dueDateError = state.fieldErrors?.dueDate?.[0];

  return (
    <form action={formAction} aria-busy={pending} className="space-y-5">
      <input name="taskId" type="hidden" value={task.id} />

      <div>
        <label
          className="mb-2 block text-sm font-medium text-slate-800"
          htmlFor={titleId}
        >
          Title
        </label>
        <input
          aria-describedby={titleError ? `${titleId}-error` : undefined}
          aria-invalid={Boolean(titleError)}
          autoFocus
          className="clearlooks-input h-11 w-full border px-3.5 text-sm outline-none transition aria-invalid:border-red-500"
          defaultValue={task.title}
          disabled={pending}
          id={titleId}
          maxLength={TASK_TITLE_MAX_LENGTH}
          name="title"
          required
        />
        {titleError ? (
          <p className="mt-2 text-sm text-red-700" id={`${titleId}-error`}>
            {titleError}
          </p>
        ) : null}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor={descriptionId}
          >
            Description
          </label>
          <span className="text-xs text-slate-600">Optional</span>
        </div>
        <textarea
          aria-describedby={
            descriptionError ? `${descriptionId}-error` : undefined
          }
          aria-invalid={Boolean(descriptionError)}
          className="clearlooks-input min-h-28 w-full resize-y border px-3.5 py-3 text-sm outline-none transition aria-invalid:border-red-500"
          defaultValue={task.description ?? ""}
          disabled={pending}
          id={descriptionId}
          maxLength={TASK_DESCRIPTION_MAX_LENGTH}
          name="description"
        />
        {descriptionError ? (
          <p
            className="mt-2 text-sm text-red-700"
            id={`${descriptionId}-error`}
          >
            {descriptionError}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-800"
            htmlFor={priorityId}
          >
            Priority
          </label>
          <select
            aria-describedby={priorityError ? `${priorityId}-error` : undefined}
            aria-invalid={Boolean(priorityError)}
            className="clearlooks-input h-11 w-full border px-3 text-sm outline-none transition aria-invalid:border-red-500"
            defaultValue={task.priority}
            disabled={pending}
            id={priorityId}
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
              id={`${priorityId}-error`}
            >
              {priorityError}
            </p>
          ) : null}
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-800"
            htmlFor={statusId}
          >
            Status
          </label>
          <select
            aria-describedby={statusError ? `${statusId}-error` : undefined}
            aria-invalid={Boolean(statusError)}
            className="clearlooks-input h-11 w-full border px-3 text-sm outline-none transition aria-invalid:border-red-500"
            defaultValue={task.status}
            disabled={pending}
            id={statusId}
            name="status"
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TASK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          {statusError ? (
            <p className="mt-2 text-sm text-red-700" id={`${statusId}-error`}>
              {statusError}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor={dueDateId}
          >
            Due date
          </label>
          <span className="text-xs text-slate-600">Optional</span>
        </div>
        <input
          aria-describedby={dueDateError ? `${dueDateId}-error` : undefined}
          aria-invalid={Boolean(dueDateError)}
          className="clearlooks-input h-11 w-full border px-3 text-sm outline-none transition aria-invalid:border-red-500"
          defaultValue={task.due_date ?? ""}
          disabled={pending}
          id={dueDateId}
          name="dueDate"
          type="date"
        />
        {dueDateError ? (
          <p className="mt-2 text-sm text-red-700" id={`${dueDateId}-error`}>
            {dueDateError}
          </p>
        ) : null}
      </div>

      {state.message && state.status === "error" ? (
        <StatusMessage tone="error">
          {state.message}
        </StatusMessage>
      ) : null}

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <button
          className="clearlooks-button px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="clearlooks-button-primary px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
