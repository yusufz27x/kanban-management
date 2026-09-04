"use client";

import { TaskRouteError } from "@/components/task-route-error";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Unable to load page | Tasks</title>
      </head>
      <body
        className="clearlooks-app min-h-screen"
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        <TaskRouteError
          error={error}
          logMessage="Application rendering failed"
          reset={reset}
          title="Unable to load page"
        />
      </body>
    </html>
  );
}
