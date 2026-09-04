import type { ReactNode } from "react";

type StatusMessageProps = {
  children: ReactNode;
  className?: string;
  tone?: "error" | "neutral" | "success";
};

export function StatusMessage({
  children,
  className = "",
  tone = "neutral",
}: StatusMessageProps) {
  return (
    <p
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={`clearlooks-alert px-3.5 py-3 text-sm leading-5 ${className}`}
      data-tone={tone}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
