"use client";

import { type DragEvent, useRef, useState } from "react";

import {
  EmptyTaskColumn,
  TaskColumnFrame,
} from "@/components/task-column-frame";
import type { Task, TaskStatus } from "@/lib/supabase/database.types";
import { TASK_DRAG_TYPE } from "@/lib/tasks/drag";

import { TaskCard } from "./task-card";

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
    <TaskColumnFrame
      className={`transition ${
        dragOver ? "outline-2 outline-offset-2 outline-[#3465a4]" : ""
      }`}
      count={tasks.length}
      headingId={headingId}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      status={status}
    >
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <TaskCard
            dragDisabled={dragDisabled}
            key={task.id}
            task={task}
            today={today}
          />
        ))
      ) : (
        <EmptyTaskColumn />
      )}
    </TaskColumnFrame>
  );
}
