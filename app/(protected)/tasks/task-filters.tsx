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
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 ${
            activeFilters.length > 0
              ? "clearlooks-button-primary"
              : "clearlooks-button"
          }`}
          onClick={() => setOpen((current) => !current)}
          ref={triggerRef}
          type="button"
        >
          Filters
          {activeFilters.length > 0 ? (
            <span className="clearlooks-counter inline-flex min-w-5 justify-center px-1.5 py-0.5 text-xs">
              {activeFilters.length}
            </span>
          ) : null}
        </button>

        {open ? (
          <section
            aria-label="Filters"
            className="clearlooks-popover absolute left-0 z-30 mt-2 w-[calc(100vw-2.5rem)] max-w-96 border p-4"
            id={panelId}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Quick
              </p>
              <div className="mt-2 flex flex-wrap gap-2" role="group">
                {quickFilters.map((filter) => (
                  <button
                    aria-pressed={quick === filter.value}
                    className="clearlooks-toggle border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2"
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
                  className="text-xs font-semibold uppercase tracking-wide text-slate-600"
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
                        className="clearlooks-toggle border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2"
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
                  className="text-xs font-semibold uppercase tracking-wide text-slate-600"
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
                        className="clearlooks-toggle border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2"
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
                className="text-xs font-medium text-slate-600"
              >
                {filteredCount} of {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  className="clearlooks-button px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:text-slate-400"
                  disabled={activeFilters.length === 0}
                  onClick={onReset}
                  type="button"
                >
                  Reset
                </button>
                <button
                  className="clearlooks-button-primary px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
                  onClick={() => {
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
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
          className="clearlooks-chip inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
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
