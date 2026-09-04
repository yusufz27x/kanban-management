"use client";

import { TaskRouteError } from "@/components/task-route-error";

export default function TasksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <TaskRouteError
      error={error}
      logMessage="Task dashboard rendering failed"
      reset={reset}
    />
  );
}
