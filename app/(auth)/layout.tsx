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
    <main className="grid min-h-screen flex-1 bg-white lg:grid-cols-[minmax(320px,0.9fr)_1.1fr]">
      <section className="relative hidden overflow-hidden bg-emerald-950 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div
          aria-hidden="true"
          className="absolute -right-32 -top-28 size-96 rounded-full border border-emerald-700/50"
        />
        <div
          aria-hidden="true"
          className="absolute -right-12 top-10 size-72 rounded-full border border-emerald-600/40"
        />

        <div className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-emerald-400 text-lg font-bold text-emerald-950">
            N
          </span>
          <span className="font-semibold tracking-wide">Kanban Task Management</span>
        </div>

        <div className="relative max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Headline 1
          </p>
          <p className="mt-6 text-4xl font-medium leading-tight tracking-tight xl:text-5xl">
            Headline 2
          </p>
          <p className="mt-6 max-w-md text-base leading-7 text-emerald-100/75">
            Headline 3
          </p>
        </div>

        <p className="relative text-sm text-emerald-100/60">
          Headline 4
        </p>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        {children}
      </section>
    </main>
  );
}
