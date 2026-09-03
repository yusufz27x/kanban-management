import type { Metadata } from "next";

import { AuthForm } from "../auth-form";
import { signup } from "../actions";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignupPage() {
  return <AuthForm action={signup} mode="signup" />;
}
