export default function SharedTasksLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading shared tasks"
      className="mx-auto w-full max-w-7xl animate-pulse px-5 py-10 sm:px-8"
      id="main-content"
    >
      <div className="h-4 w-24 rounded bg-slate-200" />
      <div className="mt-4 h-10 w-64 rounded bg-slate-200" />
      <div className="mt-3 h-5 w-full max-w-lg rounded bg-slate-200" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            className="clearlooks-column h-64 border"
            key={item}
          />
        ))}
      </div>
      <span className="sr-only">Loading shared tasks</span>
    </main>
  );
}
