"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/app/(protected)/tasks/modal";
import {
  TaskFilters,
  type QuickFilter,
} from "@/app/(protected)/tasks/task-filters";
import {
  TaskCardPreview,
  TaskDetails,
} from "@/components/task-card-content";
import {
  EmptyTaskColumn,
  TaskColumnFrame,
} from "@/components/task-column-frame";
import type {
  PublicTask,
  TaskPriority,
  TaskStatus,
} from "@/lib/supabase/database.types";
import { TASK_STATUSES } from "@/lib/tasks/constants";
import {
  isTaskDueSoon,
  isTaskOverdue,
} from "@/lib/tasks/dates";
import { useLocalDate } from "@/lib/tasks/use-local-date";

export function PublicTaskList({ tasks }: { tasks: PublicTask[] }) {
  const [statusFilters, setStatusFilters] = useState<TaskStatus[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<TaskPriority[]>([]);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const today = useLocalDate();

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesStatus =
          statusFilters.length === 0 || statusFilters.includes(task.status);
        const matchesPriority =
          priorityFilters.length === 0 ||
          priorityFilters.includes(task.priority);
        const matchesQuickFilter =
          quickFilter === "all" ||
          (quickFilter === "overdue" &&
            isTaskOverdue(task.due_date, task.status, today)) ||
          (quickFilter === "due_soon" &&
            isTaskDueSoon(task.due_date, task.status, today));

        return matchesStatus && matchesPriority && matchesQuickFilter;
      }),
    [priorityFilters, quickFilter, statusFilters, tasks, today],
  );

  const tasksByStatus = useMemo(
    () =>
      Object.fromEntries(
        TASK_STATUSES.map((status) => [
          status,
          filteredTasks.filter((task) => task.status === status),
        ]),
      ) as Record<TaskStatus, PublicTask[]>,
    [filteredTasks],
  );
  const visibleStatuses =
    statusFilters.length > 0
      ? TASK_STATUSES.filter((status) => statusFilters.includes(status))
      : TASK_STATUSES;
  const boardGridClasses =
    visibleStatuses.length === 2
      ? "md:grid-cols-2"
      : visibleStatuses.length === 3
        ? "md:grid-cols-3"
        : "";

  function resetFilters() {
    setStatusFilters([]);
    setPriorityFilters([]);
    setQuickFilter("all");
  }

  return (
    <>
      <div
        aria-label="Shared task controls"
        className="flex flex-wrap items-center gap-2"
        role="group"
      >
        <TaskFilters
          filteredCount={filteredTasks.length}
          onPrioritiesChange={setPriorityFilters}
          onQuickChange={setQuickFilter}
          onReset={resetFilters}
          onStatusesChange={setStatusFilters}
          priorities={priorityFilters}
          quick={quickFilter}
          statuses={statusFilters}
          totalCount={tasks.length}
        />
      </div>

      {tasks.length > 0 && filteredTasks.length === 0 ? (
        <section className="clearlooks-panel mt-7 border border-dashed px-6 py-12 text-center">
          <p className="font-semibold text-slate-900">No matches</p>
          <button
            className="clearlooks-button-primary mt-5 px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={resetFilters}
            type="button"
          >
            Reset
          </button>
        </section>
      ) : (
        <section aria-label="Shared task board" className="mt-7">
          <div className={`grid items-start gap-4 ${boardGridClasses}`}>
            {visibleStatuses.map((status) => (
              <PublicTaskColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                today={today}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function PublicTaskColumn({
  status,
  tasks,
  today,
}: {
  status: TaskStatus;
  tasks: PublicTask[];
  today: string;
}) {
  const headingId = `public-task-column-${status}`;

  return (
    <TaskColumnFrame
      count={tasks.length}
      headingId={headingId}
      status={status}
    >
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <PublicTaskCard key={task.id} task={task} today={today} />
        ))
      ) : (
        <EmptyTaskColumn />
      )}
    </TaskColumnFrame>
  );
}

function PublicTaskCard({
  task,
  today,
}: {
  task: PublicTask;
  today: string;
}) {
  const [open, setOpen] = useState(false);
  const overdue = isTaskOverdue(task.due_date, task.status, today);
  const titleId = `public-task-title-${task.id}`;

  return (
    <>
      <article
        aria-labelledby={titleId}
        className="clearlooks-card clearlooks-card-interactive overflow-hidden border transition hover:-translate-y-0.5"
        data-overdue={overdue}
      >
        <button
          aria-haspopup="dialog"
          className="block w-full p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#3465a4] sm:p-3.5"
          onClick={() => setOpen(true)}
          type="button"
        >
          <TaskCardPreview task={task} titleId={titleId} today={today} />
        </button>
      </article>

      <Modal onClose={() => setOpen(false)} open={open} title="Task">
        <TaskDetails task={task} today={today} />
      </Modal>
    </>
  );
}
