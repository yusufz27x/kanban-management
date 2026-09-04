type TaskBoardLoadingProps = {
  controlCount: number;
  label: string;
  screenReaderText: string;
};

export function TaskBoardLoading({
  controlCount,
  label,
  screenReaderText,
}: TaskBoardLoadingProps) {
  return (
    <main
      aria-busy="true"
      aria-label={label}
      className="mx-auto w-full max-w-7xl animate-pulse px-5 py-8 sm:px-8 sm:py-10"
      id="main-content"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="h-10 w-64 rounded bg-slate-200" />
        <div className="space-y-1 sm:flex sm:flex-col sm:items-end">
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="h-3 w-12 rounded bg-slate-200" />
        </div>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: controlCount }, (_, index) => (
          <div
            className={`h-10 rounded bg-slate-200 ${
              index === 0 ? "w-24" : "w-20"
            }`}
            key={index}
          />
        ))}
      </div>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div className="clearlooks-column h-64 border" key={item} />
        ))}
      </div>
      <span className="sr-only">{screenReaderText}</span>
    </main>
  );
}
