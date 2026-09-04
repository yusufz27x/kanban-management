import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { TaskDashboard } from "./task-dashboard";

export const metadata: Metadata = {
  title: "Tasks",
};

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();

  if (!authData?.claims) {
    redirect("/login");
  }

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", authData.claims.sub)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Task loading failed", { code: error.code });

    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8">
        <section className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-950">
            Tasks could not be loaded
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Refresh the page to try again.
          </p>
        </section>
      </main>
    );
  }

  return <TaskDashboard tasks={tasks} />;
}
