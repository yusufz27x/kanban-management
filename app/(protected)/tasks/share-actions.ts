"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  type ShareActionState,
  shareOperationSchema,
} from "@/lib/validation/share";

async function getAuthenticatedContext() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  return { supabase, userId: data.claims.sub };
}

function shareError(
  previousState: ShareActionState,
  message = "Sharing could not be updated. Please try again.",
): ShareActionState {
  return { ...previousState, message, status: "error" };
}

export async function updateSharing(
  previousState: ShareActionState,
  formData: FormData,
): Promise<ShareActionState> {
  const { supabase, userId } = await getAuthenticatedContext();
  const operation = shareOperationSchema.safeParse(formData.get("operation"));

  if (!operation.success) {
    return shareError(previousState, "Choose a valid sharing action.");
  }

  if (operation.data === "regenerate") {
    const { data, error } = await supabase
      .rpc("regenerate_task_share")
      .single();

    if (error || !data) {
      if (error) {
        console.error("Share token regeneration failed", { code: error.code });
      }

      return shareError(previousState);
    }

    revalidatePath("/tasks");
    return {
      enabled: data.enabled,
      message: "A new share link is ready.",
      status: "success",
      token: data.token,
    };
  }

  const enabled = operation.data === "enable";
  let result;

  result = await supabase
    .from("task_shares")
    .update({ enabled })
    .eq("user_id", userId)
    .select("enabled, token")
    .maybeSingle();

  if (enabled && !result.error && !result.data) {
    result = await supabase
      .from("task_shares")
      .insert({ enabled: true })
      .select("enabled, token")
      .single();
  }

  if (result.error || !result.data) {
    if (result.error) {
      console.error("Share setting update failed", { code: result.error.code });
    }

    return shareError(previousState);
  }

  revalidatePath("/tasks");
  return {
    enabled: result.data.enabled,
    message: enabled
      ? "Public sharing is enabled."
      : "Public sharing is disabled.",
    status: "success",
    token: result.data.token,
  };
}
