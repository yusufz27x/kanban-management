"use client";

import { TaskRouteError } from "@/components/task-route-error";

export default function TasksError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <TaskRouteError
      error={error}
      logMessage="Task dashboard rendering failed"
      retry={retry}
    />
  );
}
