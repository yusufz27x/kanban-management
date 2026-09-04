import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  createAuthenticatedDataClient,
  createClient,
} from "@/lib/supabase/server";

import { TaskDashboard } from "./task-dashboard";

export const metadata: Metadata = {
  title: "Tasks",
};

export default async function TasksPage() {
  const authClient = await createClient();
  const { data: sessionData, error: sessionError } =
    await authClient.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (sessionError || !accessToken) {
    redirect("/login");
  }

  const { data: authData, error: authError } =
    await authClient.auth.getClaims(accessToken);

  if (authError || !authData?.claims) {
    redirect("/login");
  }

  const supabase = createAuthenticatedDataClient(accessToken);

  const [taskResult, shareResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", authData.claims.sub)
      .order("created_at", { ascending: false }),
    supabase
      .from("task_shares")
      .select("enabled, token")
      .eq("user_id", authData.claims.sub)
      .maybeSingle(),
  ]);

  if (taskResult.error || shareResult.error) {
    console.error("Dashboard loading failed", {
      shareCode: shareResult.error?.code,
      taskCode: taskResult.error?.code,
    });

    throw new Error("The task dashboard could not be loaded.");
  }

  return (
    <TaskDashboard
      initialShare={
        shareResult.data ?? {
          enabled: false,
          token: null,
        }
      }
      tasks={taskResult.data}
      userId={authData.claims.sub}
    />
  );
}
