"use client";

import { useEffect } from "react";

export default function SharedTasksError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Shared task page rendering failed", error);
  }, [error]);

  return (
    <main
      className="grid min-h-screen place-items-center px-5 py-12"
      id="main-content"
    >
      <section className="clearlooks-panel w-full max-w-lg border border-red-300 p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-950">
          Unable to load tasks
        </h1>
        <button
          className="clearlooks-button-primary mt-6 px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={retry}
          type="button"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
