import Link from "next/link";

export default function SharedTasksNotFound() {
  return (
    <main
      className="grid min-h-screen place-items-center px-5 py-12"
      id="main-content"
    >
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">
          Link unavailable
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Invalid or disabled.
        </p>
        <Link
          className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          href="/login"
        >
          Log in
        </Link>
      </section>
    </main>
  );
}
