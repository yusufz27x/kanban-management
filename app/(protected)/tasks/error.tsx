"use client";

import { useEffect } from "react";

export default function TasksError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Task dashboard rendering failed", error);
  }, [error]);

  return (
    <main
      className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8"
      id="main-content"
    >
      <section className="clearlooks-panel border border-red-300 p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-950">
          Unable to load tasks
        </h1>
        <button
          className="clearlooks-button-primary mt-5 px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={retry}
          type="button"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
