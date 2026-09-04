export default function TasksLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading tasks"
      className="mx-auto w-full max-w-7xl animate-pulse px-5 py-8 sm:px-8 sm:py-10"
      id="main-content"
    >
      <div className="h-4 w-36 rounded bg-slate-200" />
      <div className="mt-4 h-10 w-64 rounded bg-slate-200" />
      <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="h-[34rem] rounded-2xl bg-slate-200" />
        <div className="space-y-4">
          <div className="h-24 rounded-2xl bg-slate-200" />
          <div className="h-44 rounded-2xl bg-slate-200" />
          <div className="h-56 rounded-2xl bg-slate-200" />
        </div>
      </div>
      <span className="sr-only">Loading your tasks…</span>
    </main>
  );
}
