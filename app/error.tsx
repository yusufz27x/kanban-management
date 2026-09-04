"use client";

import { TaskRouteError } from "@/components/task-route-error";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <TaskRouteError
      error={error}
      logMessage="Page rendering failed"
      reset={reset}
      title="Unable to load page"
    />
  );
}
