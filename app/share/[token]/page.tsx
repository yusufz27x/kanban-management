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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <h1 className="font-semibold text-slate-950">Shared tasks</h1>
          <span className="inline-flex shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Read-only
          </span>
        </div>
      </header>

      <main
        className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10"
        id="main-content"
      >
        <PublicTaskList tasks={tasks} />
      </main>
    </div>
  );
}
