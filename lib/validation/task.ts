import { z } from "zod";

import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TITLE_MAX_LENGTH,
} from "@/lib/tasks/constants";
import { isValidDateOnly } from "@/lib/tasks/dates";

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Enter a task title.")
    .max(
      TASK_TITLE_MAX_LENGTH,
      `Title must be ${TASK_TITLE_MAX_LENGTH} characters or fewer.`,
    ),
  description: z
    .string()
    .trim()
    .max(
      TASK_DESCRIPTION_MAX_LENGTH,
      `Description must be ${TASK_DESCRIPTION_MAX_LENGTH} characters or fewer.`,
    )
    .transform((value) => value || null),
  priority: z.enum(TASK_PRIORITIES, {
    error: "Choose a valid priority.",
  }),
  dueDate: z
    .string()
    .trim()
    .refine((value) => value === "" || isValidDateOnly(value), {
      message: "Enter a valid due date.",
    })
    .transform((value) => value || null),
});

export const updateTaskSchema = createTaskSchema.extend({
  taskId: z.uuid("Task could not be found."),
  status: z.enum(TASK_STATUSES, {
    error: "Choose a valid status.",
  }),
});

export const deleteTaskSchema = z.object({
  taskId: z.uuid("Task could not be found."),
});

export const moveTaskSchema = z.object({
  taskId: z.uuid("Task could not be found."),
  status: z.enum(TASK_STATUSES, {
    error: "Choose a valid status.",
  }),
});

export type TaskActionState = {
  fieldErrors?: {
    description?: string[];
    dueDate?: string[];
    priority?: string[];
    status?: string[];
    title?: string[];
  };
  message?: string;
  status?: "error" | "success";
};
