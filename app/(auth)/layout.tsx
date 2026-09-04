import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/tasks");
  }

  return (
    <main
      className="clearlooks-app flex min-h-screen flex-1 items-center justify-center px-6 py-12 sm:px-10"
      id="main-content"
    >
      {children}
    </main>
  );
}
