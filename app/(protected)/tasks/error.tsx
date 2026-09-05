"use client";

import { TaskRouteError } from "@/components/task-route-error";

export default function TasksError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <TaskRouteError
      error={error}
      logMessage="Task dashboard rendering failed"
    />
  );
}
