"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function logout() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error("Unable to sign out. Please try again.");
    }
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
