import type {
  PublicTask,
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

const priorityBadgeTones: Record<TaskPriority, string> = {
  low: "blue",
  medium: "amber",
  high: "red",
};

const statusBadgeTones: Record<TaskStatus, string> = {
  todo: "neutral",
  in_progress: "amber",
  done: "green",
};

type TaskContentProps = {
  task: PublicTask;
  today: string;
};

export function TaskCardPreview({
  task,
  titleId,
  today,
}: TaskContentProps & { titleId: string }) {
  const overdue = isTaskOverdue(task.due_date, task.status, today);
  const dueSoon = isTaskDueSoon(task.due_date, task.status, today);
  const dueDate = task.due_date ? formatDateOnly(task.due_date) : "No due date";

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <span
          className="clearlooks-badge inline-flex px-2 py-0.5 text-xs font-semibold"
          data-tone={priorityBadgeTones[task.priority]}
        >
          {TASK_PRIORITY_LABELS[task.priority]}
        </span>
        <span
          className={`shrink-0 text-right text-xs font-medium ${
            overdue
              ? "text-red-700"
              : dueSoon
                ? "text-amber-700"
                : "text-slate-600"
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
          task.status === "done" ? "line-through decoration-slate-400" : ""
        }`}
        id={titleId}
      >
        {task.title}
      </h3>
      {task.description ? (
        <p className="mt-1.5 line-clamp-2 break-words text-xs leading-5 text-slate-600">
          {task.description}
        </p>
      ) : null}
    </>
  );
}

export function TaskDetails({ task, today }: TaskContentProps) {
  const overdue = isTaskOverdue(task.due_date, task.status, today);
  const dueSoon = isTaskDueSoon(task.due_date, task.status, today);
  const dueDate = task.due_date ? formatDateOnly(task.due_date) : "No due date";

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <span
          className="clearlooks-badge inline-flex px-2.5 py-1 text-xs font-semibold"
          data-tone={priorityBadgeTones[task.priority]}
        >
          {TASK_PRIORITY_LABELS[task.priority]}
        </span>
        <span
          className="clearlooks-badge inline-flex px-2.5 py-1 text-xs font-semibold"
          data-tone={statusBadgeTones[task.status]}
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
        <p className="mt-3 text-sm text-slate-600">No description</p>
      )}

      <dl className="mt-5 border-y border-slate-200 py-4">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm font-medium text-slate-600">Due date</dt>
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
    </>
  );
}
