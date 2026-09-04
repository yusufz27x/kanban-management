import Link from "next/link";
import type { ReactNode } from "react";

type TaskRouteStateProps = {
  action: ReactNode;
  message?: string;
  title: string;
  tone?: "error" | "neutral";
};

export function TaskRouteState({
  action,
  message,
  title,
  tone = "neutral",
}: TaskRouteStateProps) {
  return (
    <main
      className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8"
      id="main-content"
    >
      <section
        className="clearlooks-panel border p-8 text-center"
        data-tone={tone}
      >
        <h1 className="text-xl font-semibold text-slate-950">{title}</h1>
        {message ? (
          <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        ) : null}
        {action}
      </section>
    </main>
  );
}

type TaskNotFoundProps = {
  actionLabel: string;
  href: string;
  message: string;
  title: string;
};

export function TaskNotFound({
  actionLabel,
  href,
  message,
  title,
}: TaskNotFoundProps) {
  return (
    <TaskRouteState
      action={
        <Link
          className="clearlooks-button-primary mt-5 inline-flex px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
          href={href}
        >
          {actionLabel}
        </Link>
      }
      message={message}
      title={title}
    />
  );
}
