"use client";

import {
  type DragEvent,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { StatusMessage } from "@/components/status-message";
import {
  TaskCardPreview,
  TaskDetails,
} from "@/components/task-card-content";
import type { Task } from "@/lib/supabase/database.types";
import { isTaskOverdue } from "@/lib/tasks/dates";
import { TASK_DRAG_TYPE } from "@/lib/tasks/drag";

import { deleteTask } from "./actions";
import { Modal } from "./modal";
import { TaskEditForm } from "./task-edit-form";

type TaskCardProps = {
  dragDisabled: boolean;
  task: Task;
  today: string;
};

export function TaskCard({
  dragDisabled,
  task,
  today,
}: TaskCardProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [dragging, setDragging] = useState(false);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteTask,
    {},
  );
  const overdue = isTaskOverdue(task.due_date, task.status, today);
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

  function cancelDelete() {
    setConfirmingDelete(false);
    requestAnimationFrame(() => deleteButtonRef.current?.focus());
  }

  function handleDragStart(event: DragEvent<HTMLElement>) {
    if (dragDisabled) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(TASK_DRAG_TYPE, task.id);
    setDragging(true);
  }

  return (
    <>
      <article
        aria-labelledby={titleId}
        className={`clearlooks-card clearlooks-card-interactive overflow-hidden border transition hover:-translate-y-0.5 ${
          dragging ? "opacity-50" : ""
        }`}
        data-overdue={overdue}
        draggable={!dragDisabled}
        onDragEnd={() => setDragging(false)}
        onDragStart={handleDragStart}
      >
        <button
          aria-haspopup="dialog"
          className={`block w-full p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#3465a4] sm:p-3.5 ${
            dragDisabled
              ? "cursor-wait"
              : "cursor-grab active:cursor-grabbing"
          }`}
          onClick={() => setOpen(true)}
          type="button"
        >
          <TaskCardPreview task={task} titleId={titleId} today={today} />
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
            <TaskDetails task={task} today={today} />

            {confirmingDelete ? (
              <div
                aria-labelledby={deletePromptId}
                className="clearlooks-alert mt-5 p-3"
                data-tone="error"
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    cancelDelete();
                  }
                }}
                role="group"
              >
                <p className="text-sm font-medium" id={deletePromptId}>
                  Permanently delete this task?
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    className="clearlooks-button px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
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
                  ref={deleteButtonRef}
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
              <StatusMessage className="mt-3" tone="error">
                {deleteState.message}
              </StatusMessage>
            ) : null}
          </div>
        )}
      </Modal>
    </>
  );
}
