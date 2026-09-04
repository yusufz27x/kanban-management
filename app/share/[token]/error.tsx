"use client";

import { TaskRouteError } from "@/components/task-route-error";

export default function SharedTasksError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <TaskRouteError
      error={error}
      logMessage="Shared task page rendering failed"
      retry={retry}
    />
  );
}
