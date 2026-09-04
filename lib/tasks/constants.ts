import type { TaskPriority, TaskStatus } from "@/lib/supabase/database.types";

export const TASK_TITLE_MAX_LENGTH = 120;
export const TASK_DESCRIPTION_MAX_LENGTH = 2000;

export const TASK_PRIORITIES = ["low", "medium", "high"] as const satisfies readonly TaskPriority[];
export const TASK_STATUSES = ["todo", "in_progress", "done"] as const satisfies readonly TaskStatus[];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};
