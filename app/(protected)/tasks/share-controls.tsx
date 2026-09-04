"use client";

import { useActionState, useState } from "react";

import { StatusMessage } from "@/components/status-message";
import type { ShareActionState } from "@/lib/validation/share";

import { updateSharing } from "./share-actions";

type ShareControlsProps = {
  initialShare: ShareActionState;
};

type ShareFeedback = {
  message: string;
  tone: "error" | "neutral" | "success";
};

export function ShareControls({ initialShare }: ShareControlsProps) {
  const [state, formAction, pending] = useActionState(
    updateSharing,
    initialShare,
  );
  const [copyFeedback, setCopyFeedback] = useState<ShareFeedback>();
  const sharePath = state.token ? `/share/${state.token}` : null;
  const feedback: ShareFeedback | undefined = pending
    ? { message: "Updating sharing…", tone: "neutral" }
    : copyFeedback ??
      (state.message
        ? {
            message: state.message,
            tone: state.status === "error" ? "error" : "success",
          }
        : undefined);

  async function copyShareUrl() {
    if (!sharePath) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        new URL(sharePath, window.location.origin).toString(),
      );
      setCopyFeedback({ message: "Share URL copied.", tone: "success" });
    } catch {
      setCopyFeedback({
        message: "Copy failed. Select the URL and copy it manually.",
        tone: "error",
      });
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Anyone with the link can view. Read-only.
          </p>
        </div>
        <span
          className="clearlooks-badge inline-flex w-fit px-2.5 py-1 text-xs font-semibold"
          data-tone={state.enabled ? "green" : "neutral"}
        >
          {state.enabled ? "On" : "Off"}
        </span>
      </div>

      {sharePath ? (
        <div className="mt-5">
          <label
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600"
            htmlFor="share-url"
          >
            Link
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="clearlooks-input h-10 min-w-0 flex-1 border px-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pending || !state.enabled}
              id="share-url"
              onFocus={(event) => event.currentTarget.select()}
              readOnly
              value={sharePath}
            />
            <button
              className="clearlooks-button h-10 px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pending || !state.enabled}
              onClick={copyShareUrl}
              type="button"
            >
              Copy
            </button>
          </div>
          {!state.enabled ? (
            <p className="mt-2 text-sm text-slate-600">
              Link disabled.
            </p>
          ) : null}
        </div>
      ) : null}

      <form
        action={formAction}
        className="mt-5 flex flex-wrap gap-2"
        onSubmit={() => setCopyFeedback(undefined)}
      >
        <button
          className={`px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
            state.enabled
              ? "clearlooks-button-danger"
              : "clearlooks-button-primary"
          }`}
          disabled={pending}
          name="operation"
          type="submit"
          value={state.enabled ? "disable" : "enable"}
        >
          {state.enabled ? "Disable" : "Enable"}
        </button>
        {state.token ? (
          <button
            className="clearlooks-button px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={pending || !state.enabled}
            name="operation"
            type="submit"
            value="regenerate"
          >
            New link
          </button>
        ) : null}
      </form>

      {feedback ? (
        <StatusMessage className="mt-3" tone={feedback.tone}>
          {feedback.message}
        </StatusMessage>
      ) : null}
    </div>
  );
}
