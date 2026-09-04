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
      <section className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-950">
          Unable to load tasks
        </h1>
        <button
          className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          onClick={retry}
          type="button"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
