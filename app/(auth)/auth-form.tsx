"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AuthActionState } from "@/lib/validation/auth";

type AuthAction = (
  state: AuthActionState,
  formData: FormData,
) => Promise<AuthActionState>;

type AuthFormProps = {
  action: AuthAction;
  initialMessage?: string;
  mode: "login" | "signup";
};

export function AuthForm({ action, initialMessage, mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const [state, formAction, pending] = useActionState(action, {
    message: initialMessage,
    status: initialMessage ? "error" : undefined,
  });
  const emailError = state.fieldErrors?.email?.[0];
  const passwordError = state.fieldErrors?.password?.[0];

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {isLogin ? "Sign in" : "Create account"}
      </h1>

      <form
        action={formAction}
        aria-busy={pending}
        className="mt-7 space-y-5"
      >
        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-800"
            htmlFor="email"
          >
            Email
          </label>
          <input
            aria-describedby={emailError ? "email-error" : undefined}
            aria-invalid={Boolean(emailError)}
            autoComplete="email"
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 aria-invalid:border-red-500 aria-invalid:ring-red-100"
            disabled={pending}
            id="email"
            maxLength={254}
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
          {emailError ? (
            <p className="mt-2 text-sm text-red-700" id="email-error">
              {emailError}
            </p>
          ) : null}
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-800"
            htmlFor="password"
          >
            Password
          </label>
          <input
            aria-describedby={
              passwordError
                ? "password-error"
                : isLogin
                  ? undefined
                  : "password-help"
            }
            aria-invalid={Boolean(passwordError)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 aria-invalid:border-red-500 aria-invalid:ring-red-100"
            disabled={pending}
            id="password"
            maxLength={72}
            minLength={8}
            name="password"
            placeholder="At least 8 characters"
            required
            type="password"
          />
          {passwordError ? (
            <p className="mt-2 text-sm text-red-700" id="password-error">
              {passwordError}
            </p>
          ) : !isLogin ? (
            <p className="mt-2 text-sm text-slate-500" id="password-help">
              Use at least 8 characters.
            </p>
          ) : null}
        </div>

        {state.message ? (
          <div
            aria-live="polite"
            className={`rounded-xl border px-4 py-3 text-sm leading-6 ${
              state.status === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
            role={state.status === "error" ? "alert" : "status"}
          >
            {state.message}
          </div>
        ) : null}

        <button
          className="flex h-12 w-full items-center justify-center rounded-xl bg-emerald-700 px-5 font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending
            ? isLogin
              ? "Signing in…"
              : "Creating account…"
            : isLogin
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        {isLogin ? "No account?" : "Have an account?"}{" "}
        <Link
          className="font-semibold text-emerald-700 underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          href={isLogin ? "/signup" : "/login"}
        >
          {isLogin ? "Create one" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
