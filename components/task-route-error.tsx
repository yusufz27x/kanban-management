"use client";

import { useEffect } from "react";

import { TaskRouteState } from "./task-route-state";

type TaskRouteErrorProps = {
  error: Error & { digest?: string };
  logMessage: string;
  title?: string;
};

export function TaskRouteError({
  error,
  logMessage,
  title = "Unable to load tasks",
}: TaskRouteErrorProps) {
  useEffect(() => {
    console.error(logMessage, error);
  }, [error, logMessage]);

  return (
    <TaskRouteState
      action={
        <button
          className="clearlooks-button-primary mt-5 px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => window.location.reload()}
          type="button"
        >
          Try again
        </button>
      }
      title={title}
      tone="error"
    />
  );
}
