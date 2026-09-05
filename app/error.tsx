"use client";

import { TaskRouteError } from "@/components/task-route-error";

export default function RootError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <TaskRouteError
      error={error}
      logMessage="Page rendering failed"
      title="Unable to load page"
    />
  );
}
