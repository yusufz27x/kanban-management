import Link from "next/link";

export default function SharedTasksNotFound() {
  return (
    <main
      className="grid min-h-screen place-items-center px-5 py-12"
      id="main-content"
    >
      <section className="clearlooks-panel w-full max-w-lg border p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-950">
          Link unavailable
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Invalid or disabled.
        </p>
        <Link
          className="clearlooks-button-primary mt-6 inline-flex px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2"
          href="/login"
        >
          Log in
        </Link>
      </section>
    </main>
  );
}
