import Link from "next/link";

export default function SharedTasksNotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Link unavailable
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">
          This shared task list cannot be found
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The link may be incorrect, expired, or disabled by its owner.
        </p>
        <Link
          className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          href="/login"
        >
          Go to log in
        </Link>
      </section>
    </main>
  );
}
