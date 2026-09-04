import type { ReactNode } from "react";

type TaskBoardHeaderProps = {
  count: number;
  status?: ReactNode;
  title: string;
};

export function TaskBoardHeader({
  count,
  status,
  title,
}: TaskBoardHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h1>
      <div className="sm:text-right">
        <p className="text-sm font-medium text-slate-600">
          {count} {count === 1 ? "task" : "tasks"}
        </p>
        {status}
      </div>
    </div>
  );
}
