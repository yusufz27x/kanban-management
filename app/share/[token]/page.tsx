import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createPublicShareClient } from "@/lib/supabase/public";
import { shareTokenSchema } from "@/lib/validation/share";

import { PublicTaskList } from "./public-task-list";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  referrer: "no-referrer",
  robots: {
    follow: false,
    index: false,
  },
  title: "Shared tasks",
};

export default async function SharedTasksPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const parsedToken = shareTokenSchema.safeParse((await params).token);

  if (!parsedToken.success) {
    notFound();
  }

  const supabase = createPublicShareClient(parsedToken.data);
  const { data: share, error: shareError } = await supabase
    .from("task_shares")
    .select("enabled")
    .maybeSingle();

  if (shareError) {
    console.error("Public share validation failed", { code: shareError.code });
    throw new Error("The shared task list could not be loaded.");
  }

  if (!share?.enabled) {
    notFound();
  }

  const { data: tasks, error: taskError } = await supabase
    .from("tasks")
    .select("id, title, description, priority, status, due_date")
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("title", { ascending: true });

  if (taskError) {
    console.error("Public task loading failed", { code: taskError.code });
    throw new Error("The shared task list could not be loaded.");
  }

  return (
    <div className="min-h-screen bg-[#f5f7f4]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-700 font-bold text-white">
              N
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-slate-950">
                Kanban Task Management
              </p>
              <p className="text-sm text-slate-500">Shared task list</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Read-only
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Public view
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Shared tasks
          </h1>
          <p className="mt-2 text-slate-600">
            This list is shared for viewing only. Changes can be made only by
            its owner.
          </p>
        </div>

        <PublicTaskList tasks={tasks} />
      </main>
    </div>
  );
}
