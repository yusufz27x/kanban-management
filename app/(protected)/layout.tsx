import type { ReactNode } from "react";
import { redirect } from "next/navigation";

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
      <header className="clearlooks-bar border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <p className="min-w-0 truncate text-sm text-slate-600">
            {data.claims.email ?? "Signed in"}
          </p>
          <form action="/auth/logout" method="post">
            <button
              className="clearlooks-button shrink-0 px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2"
              type="submit"
            >
              Log out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
