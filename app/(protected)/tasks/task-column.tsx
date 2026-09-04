"use client";

import { type DragEvent, useRef, useState } from "react";

import type { Task, TaskStatus } from "@/lib/supabase/database.types";
import { TASK_STATUS_LABELS } from "@/lib/tasks/constants";
import { TASK_DRAG_TYPE } from "@/lib/tasks/drag";

import { TaskCard } from "./task-card";

const columnAccentClasses: Record<TaskStatus, string> = {
  todo: "bg-slate-400",
  in_progress: "bg-amber-500",
  done: "bg-emerald-500",
};

type TaskColumnProps = {
  dragDisabled: boolean;
  onMoveTask: (taskId: string, status: TaskStatus) => void;
  status: TaskStatus;
  tasks: Task[];
  today: string;
};

export function TaskColumn({
  dragDisabled,
  onMoveTask,
  status,
  tasks,
  today,
}: TaskColumnProps) {
  const headingId = `task-column-${status}`;
  const dragDepth = useRef(0);
  const [dragOver, setDragOver] = useState(false);

  function acceptsTask(event: DragEvent<HTMLElement>) {
    return event.dataTransfer.types.includes(TASK_DRAG_TYPE);
  }

  function handleDragEnter(event: DragEvent<HTMLElement>) {
    if (dragDisabled || !acceptsTask(event)) {
      return;
    }

    dragDepth.current += 1;
    setDragOver(true);
  }

  function handleDragLeave() {
    dragDepth.current = Math.max(0, dragDepth.current - 1);

    if (dragDepth.current === 0) {
      setDragOver(false);
    }
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    if (dragDisabled || !acceptsTask(event)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setDragOver(false);

    if (dragDisabled) {
      return;
    }

    const taskId = event.dataTransfer.getData(TASK_DRAG_TYPE);

    if (taskId) {
      onMoveTask(taskId, status);
    }
  }

  return (
    <section
      aria-labelledby={headingId}
      className={`clearlooks-column min-w-0 border p-3 transition sm:p-4 ${
        dragOver ? "outline-2 outline-offset-2 outline-[#3465a4]" : ""
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
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
          className="clearlooks-card inline-flex min-w-7 justify-center border px-2 py-1 text-xs font-semibold text-slate-600"
        >
          {tasks.length}
        </span>
      </header>

      <div className="mt-3 space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              dragDisabled={dragDisabled}
              key={`${task.id}:${task.updated_at}`}
              task={task}
              today={today}
            />
          ))
        ) : (
          <div className="clearlooks-card border border-dashed px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-500">No tasks</p>
          </div>
        )}
      </div>
    </section>
  );
}
