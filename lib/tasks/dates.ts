import type { TaskStatus } from "@/lib/supabase/database.types";

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDateOnly(value: string) {
  const match = DATE_ONLY_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function isValidDateOnly(value: string) {
  return parseDateOnly(value) !== null;
}

export function toLocalDateKey(date: Date) {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function addCalendarDays(dateKey: string, days: number) {
  const date = parseDateOnly(dateKey);

  if (!date) {
    return dateKey;
  }

  date.setDate(date.getDate() + days);
  return toLocalDateKey(date);
}

export function formatDateOnly(value: string) {
  const date = parseDateOnly(value);

  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function isTaskOverdue(
  dueDate: string | null,
  status: TaskStatus,
  today: string,
) {
  return Boolean(dueDate && status !== "done" && dueDate < today);
}

export function isTaskDueSoon(
  dueDate: string | null,
  status: TaskStatus,
  today: string,
) {
  return Boolean(
    dueDate &&
      status !== "done" &&
      dueDate >= today &&
      dueDate <= addCalendarDays(today, 7),
  );
}
