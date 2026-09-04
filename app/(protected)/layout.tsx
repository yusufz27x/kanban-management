import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { TaskPageHeader } from "@/components/task-page-header";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  return (
    <div className="clearlooks-app min-h-screen">
      <TaskPageHeader
        action={
          <form action="/auth/logout" method="post">
            <button
              className="clearlooks-button shrink-0 px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2"
              type="submit"
            >
              Log out
            </button>
          </form>
        }
        label={data.claims.email ?? "Signed in"}
      />
      {children}
    </div>
  );
}
