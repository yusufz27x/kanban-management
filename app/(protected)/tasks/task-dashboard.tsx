"use client";

import {
  startTransition,
  useCallback,
  useMemo,
  useOptimistic,
  useState,
} from "react";

import { TaskBoardHeader } from "@/components/task-board-header";
import { TaskRealtime } from "@/components/task-realtime";
import { StatusMessage } from "@/components/status-message";
import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "@/lib/supabase/database.types";
import { TASK_STATUSES } from "@/lib/tasks/constants";
import {
  isTaskDueSoon,
  isTaskOverdue,
} from "@/lib/tasks/dates";
import { useLocalDate } from "@/lib/tasks/use-local-date";
import type { ShareActionState } from "@/lib/validation/share";

import { moveTask } from "./actions";
import { Modal } from "./modal";
import { ShareControls } from "./share-controls";
import { TaskColumn } from "./task-column";
import { TaskFilters, type QuickFilter } from "./task-filters";
import { TaskForm } from "./task-form";

type DashboardDialog = "new-task" | "sharing";

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
  const [shareControlsVersion, setShareControlsVersion] = useState(0);
  const [statusFilters, setStatusFilters] = useState<TaskStatus[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<TaskPriority[]>([]);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [moveError, setMoveError] = useState<string>();
  const [moving, setMoving] = useState(false);
  const [optimisticTasks, moveOptimistically] = useOptimistic(
    tasks,
    (
      currentTasks,
      move: { status: TaskStatus; taskId: string; updatedAt: string },
    ) => {
      const movedTask = currentTasks.find((task) => task.id === move.taskId);

      if (!movedTask) {
        return currentTasks;
      }

      return [
        {
          ...movedTask,
          status: move.status,
          updated_at: move.updatedAt,
        },
        ...currentTasks.filter((task) => task.id !== move.taskId),
      ];
    },
  );
  const today = useLocalDate();

  const filteredTasks = useMemo(
    () =>
      optimisticTasks.filter((task) => {
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
    [optimisticTasks, priorityFilters, quickFilter, statusFilters, today],
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
  const closeDialog = useCallback(() => setActiveDialog(undefined), []);
  const closeSharing = useCallback(() => {
    setActiveDialog(undefined);
    setShareControlsVersion((version) => version + 1);
  }, []);
  const handleTaskCreated = useCallback(() => {
    setActiveDialog(undefined);
    setTaskFormVersion((version) => version + 1);
  }, []);

  function resetFilters() {
    setStatusFilters([]);
    setPriorityFilters([]);
    setQuickFilter("all");
  }

  function handleMoveTask(taskId: string, status: TaskStatus) {
    const task = optimisticTasks.find((candidate) => candidate.id === taskId);

    if (!task || task.status === status || moving) {
      return;
    }

    setMoveError(undefined);
    setMoving(true);

    startTransition(async () => {
      moveOptimistically({
        status,
        taskId,
        updatedAt: new Date().toISOString(),
      });

      const result = await moveTask({ status, taskId });

      if (result.status === "error") {
        setMoveError(result.message ?? "Task could not be moved.");
      }

      setMoving(false);
    });
  }

  return (
    <main
      className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10"
      id="main-content"
    >
      <TaskBoardHeader
        count={tasks.length}
        status={<TaskRealtime topic={`tasks:${userId}`} />}
        title="Tasks"
      />

      <div
        aria-label="Task controls"
        className="flex flex-wrap items-center gap-2"
        role="group"
      >
        <button
          aria-expanded={activeDialog === "new-task"}
          aria-haspopup="dialog"
          className="clearlooks-button-primary px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => setActiveDialog("new-task")}
          type="button"
        >
          New task
        </button>
        <button
          aria-expanded={activeDialog === "sharing"}
          aria-haspopup="dialog"
          className="clearlooks-button px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => setActiveDialog("sharing")}
          type="button"
        >
          Sharing
        </button>
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

      {moveError ? (
        <StatusMessage className="mt-5" tone="error">
          {moveError}
        </StatusMessage>
      ) : null}

      <Modal
        onClose={closeDialog}
        open={activeDialog === "new-task"}
        title="New task"
      >
        <TaskForm key={taskFormVersion} onSuccess={handleTaskCreated} />
      </Modal>

      <Modal
        onClose={closeSharing}
        open={activeDialog === "sharing"}
        title="Sharing"
      >
        <ShareControls key={shareControlsVersion} initialShare={initialShare} />
      </Modal>

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
        <section aria-label="Task board" className="mt-7">
          <div className={`grid items-start gap-4 ${boardGridClasses}`}>
            {visibleStatuses.map((status) => (
              <TaskColumn
                dragDisabled={moving}
                key={status}
                onMoveTask={handleMoveTask}
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
