export default function SharedTasksLoading() {
  return (
    <main className="mx-auto w-full max-w-4xl animate-pulse px-5 py-10 sm:px-8">
      <div className="h-4 w-24 rounded bg-slate-200" />
      <div className="mt-4 h-10 w-64 rounded bg-slate-200" />
      <div className="mt-3 h-5 w-full max-w-lg rounded bg-slate-200" />
      <div className="mt-8 space-y-4">
        {[0, 1, 2].map((item) => (
          <div
            className="h-36 rounded-2xl border border-slate-200 bg-white"
            key={item}
          />
        ))}
      </div>
      <span className="sr-only">Loading shared tasks</span>
    </main>
  );
}
