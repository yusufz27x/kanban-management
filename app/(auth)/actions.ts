"use server";

import type { AuthError } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { authSchema, type AuthActionState } from "@/lib/validation/auth";

function validationErrors(
  result: Extract<ReturnType<typeof authSchema.safeParse>, { success: false }>,
): AuthActionState {
  return {
    fieldErrors: result.error.flatten().fieldErrors,
    message: "Check the highlighted fields and try again.",
    status: "error",
  };
}

function authErrorMessage(error: AuthError, intent: "login" | "signup") {
  switch (error.code) {
    case "invalid_credentials":
      return "Email or password is incorrect.";
    case "email_not_confirmed":
      return "Confirm your email address before signing in.";
    case "email_address_invalid":
      return "Enter a valid email address.";
    case "weak_password":
      return "Choose a stronger password and try again.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts. Wait a moment and try again.";
    case "email_provider_disabled":
      return "Email authentication is not available right now.";
    case "signup_disabled":
      return "New account registration is currently unavailable.";
    default:
      return intent === "login"
        ? "We couldn't sign you in. Please try again."
        : "We couldn't create your account. Please try again.";
  }
}

export async function login(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validated = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return validationErrors(validated);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(validated.data);

  if (error) {
    return {
      message: authErrorMessage(error, "login"),
      status: "error",
    };
  }

  revalidatePath("/", "layout");
  redirect("/tasks");
}

export async function signup(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validated = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return validationErrors(validated);
  }

  const requestHeaders = await headers();
  const requestOrigin = requestHeaders.get("origin");
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ??
    requestOrigin ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...validated.data,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  });

  if (error) {
    return {
      message: authErrorMessage(error, "signup"),
      status: "error",
    };
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/tasks");
  }

  return {
    message: "Check your inbox and confirm your email to finish signing up.",
    status: "success",
  };
}
