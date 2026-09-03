import type { Metadata } from "next";

import { AuthForm } from "../auth-form";
import { login } from "../actions";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthForm
      action={login}
      initialMessage={
        error === "confirmation_failed"
          ? "That confirmation link is invalid or has expired. Please sign up again."
          : undefined
      }
      mode="login"
    />
  );
}
