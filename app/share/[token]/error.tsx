"use client";

import { TaskRouteError } from "@/components/task-route-error";

export default function SharedTasksError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <TaskRouteError
      error={error}
      logMessage="Shared task page rendering failed"
    />
  );
}
