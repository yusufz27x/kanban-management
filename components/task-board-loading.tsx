type TaskBoardLoadingProps = {
  label: string;
  screenReaderText: string;
};

export function TaskBoardLoading({
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
      <div className="h-4 w-36 rounded bg-slate-200" />
      <div className="mt-4 h-10 w-64 rounded bg-slate-200" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div className="clearlooks-column h-64 border" key={item} />
        ))}
      </div>
      <span className="sr-only">{screenReaderText}</span>
    </main>
  );
}
