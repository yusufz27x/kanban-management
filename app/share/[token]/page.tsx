import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TaskBoardHeader } from "@/components/task-board-header";
import { TaskRealtime } from "@/components/task-realtime";
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
  title: "Shared Tasks",
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
    .order("updated_at", { ascending: false })
    .order("title", { ascending: true });

  if (taskError) {
    console.error("Public task loading failed", { code: taskError.code });
    throw new Error("The shared task list could not be loaded.");
  }

  return (
    <main
      className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10"
      id="main-content"
    >
      <TaskBoardHeader
        count={tasks.length}
        status={
          <TaskRealtime
            logLabel="Shared task realtime"
            topic={`task-share:${parsedToken.data}`}
          />
        }
        title="Shared Tasks"
      />
      <PublicTaskList tasks={tasks} />
    </main>
  );
}
