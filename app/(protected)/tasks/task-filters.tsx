"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { TaskPriority, TaskStatus } from "@/lib/supabase/database.types";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from "@/lib/tasks/constants";

export type QuickFilter = "all" | "due_soon" | "overdue";

const quickFilters: { label: string; value: QuickFilter }[] = [
  { label: "All", value: "all" },
  { label: "Overdue", value: "overdue" },
  { label: "Due soon", value: "due_soon" },
];

type TaskFiltersProps = {
  filteredCount: number;
  onPrioritiesChange: (priorities: TaskPriority[]) => void;
  onQuickChange: (filter: QuickFilter) => void;
  onReset: () => void;
  onStatusesChange: (statuses: TaskStatus[]) => void;
  priorities: TaskPriority[];
  quick: QuickFilter;
  statuses: TaskStatus[];
  totalCount: number;
};

export function TaskFilters({
  filteredCount,
  onPrioritiesChange,
  onQuickChange,
  onReset,
  onStatusesChange,
  priorities,
  quick,
  statuses,
  totalCount,
}: TaskFiltersProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const statusLabelId = useId();
  const priorityLabelId = useId();
  const activeFilters = [
    quick !== "all"
      ? {
          key: "quick",
          label: quickFilters.find((filter) => filter.value === quick)!.label,
          onClear: () => onQuickChange("all"),
        }
      : null,
    ...statuses.map((status) => ({
      key: `status:${status}`,
      label: `Status · ${TASK_STATUS_LABELS[status]}`,
      onClear: () =>
        onStatusesChange(statuses.filter((value) => value !== status)),
    })),
    ...priorities.map((priority) => ({
      key: `priority:${priority}`,
      label: `Priority · ${TASK_PRIORITY_LABELS[priority]}`,
      onClear: () =>
        onPrioritiesChange(
          priorities.filter((value) => value !== priority),
        ),
    })),
  ].filter((filter) => filter !== null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div
      className="flex w-full flex-wrap items-center gap-2 sm:contents"
      ref={containerRef}
    >
      <div className="relative">
        <button
          aria-controls={panelId}
          aria-expanded={open}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
            activeFilters.length > 0
              ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
          }`}
          onClick={() => setOpen((current) => !current)}
          ref={triggerRef}
          type="button"
        >
          Filters
          {activeFilters.length > 0 ? (
            <span className="inline-flex min-w-5 justify-center rounded-full bg-emerald-700 px-1.5 py-0.5 text-xs text-white">
              {activeFilters.length}
            </span>
          ) : null}
        </button>

        {open ? (
          <section
            aria-label="Filters"
            className="absolute left-0 z-30 mt-2 w-[calc(100vw-2.5rem)] max-w-96 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
            id={panelId}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Quick
              </p>
              <div className="mt-2 flex flex-wrap gap-2" role="group">
                {quickFilters.map((filter) => (
                  <button
                    aria-pressed={quick === filter.value}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 aria-pressed:border-emerald-700 aria-pressed:bg-emerald-700 aria-pressed:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                    key={filter.value}
                    onClick={() => onQuickChange(filter.value)}
                    type="button"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                  id={statusLabelId}
                >
                  Status
                </p>
                <div
                  aria-labelledby={statusLabelId}
                  className="mt-2 flex flex-wrap gap-2"
                  role="group"
                >
                  {TASK_STATUSES.map((status) => {
                    const selected = statuses.includes(status);

                    return (
                      <button
                        aria-pressed={selected}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 aria-pressed:border-emerald-700 aria-pressed:bg-emerald-700 aria-pressed:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                        key={status}
                        onClick={() =>
                          onStatusesChange(
                            selected
                              ? statuses.filter((value) => value !== status)
                              : [...statuses, status],
                          )
                        }
                        type="button"
                      >
                        {TASK_STATUS_LABELS[status]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4">
                <p
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                  id={priorityLabelId}
                >
                  Priority
                </p>
                <div
                  aria-labelledby={priorityLabelId}
                  className="mt-2 flex flex-wrap gap-2"
                  role="group"
                >
                  {TASK_PRIORITIES.map((priority) => {
                    const selected = priorities.includes(priority);

                    return (
                      <button
                        aria-pressed={selected}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 aria-pressed:border-emerald-700 aria-pressed:bg-emerald-700 aria-pressed:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                        key={priority}
                        onClick={() =>
                          onPrioritiesChange(
                            selected
                              ? priorities.filter(
                                  (value) => value !== priority,
                                )
                              : [...priorities, priority],
                          )
                        }
                        type="button"
                      >
                        {TASK_PRIORITY_LABELS[priority]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
              <p
                aria-live="polite"
                className="text-xs font-medium text-slate-500"
              >
                {filteredCount} of {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
                  disabled={activeFilters.length === 0}
                  onClick={onReset}
                  type="button"
                >
                  Reset
                </button>
                <button
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  Done
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      {activeFilters.map((filter) => (
        <button
          aria-label={`Clear ${filter.label} filter`}
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          key={filter.key}
          onClick={filter.onClear}
          type="button"
        >
          {filter.label}
          <span aria-hidden="true">×</span>
        </button>
      ))}
    </div>
  );
}
