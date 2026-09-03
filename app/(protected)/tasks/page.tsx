import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks",
};

export default function TasksPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Workspace ready
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Your tasks
        </h1>
        <p className="mt-3 max-w-xl leading-7 text-slate-600">
          User is authenticated
        </p>
      </section>
    </main>
  );
}
