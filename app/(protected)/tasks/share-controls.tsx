"use client";

import { useActionState, useState } from "react";

import type { ShareActionState } from "@/lib/validation/share";

import { updateSharing } from "./share-actions";

type ShareControlsProps = {
  initialShare: ShareActionState;
};

export function ShareControls({ initialShare }: ShareControlsProps) {
  const [state, formAction, pending] = useActionState(
    updateSharing,
    initialShare,
  );
  const [copyMessage, setCopyMessage] = useState<string>();
  const sharePath = state.token ? `/share/${state.token}` : null;

  async function copyShareUrl() {
    if (!sharePath) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        new URL(sharePath, window.location.origin).toString(),
      );
      setCopyMessage("Share URL copied.");
    } catch {
      setCopyMessage("Copy failed. Select the URL and copy it manually.");
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
          className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${
            state.enabled
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          {state.enabled ? "On" : "Off"}
        </span>
      </div>

      {sharePath ? (
        <div className="mt-5">
          <label
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            htmlFor="share-url"
          >
            Link
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="clearlooks-input h-10 min-w-0 flex-1 border px-3 text-sm outline-none"
              id="share-url"
              onFocus={(event) => event.currentTarget.select()}
              readOnly
              value={sharePath}
            />
            <button
              className="clearlooks-button h-10 px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!state.enabled}
              onClick={copyShareUrl}
              type="button"
            >
              Copy
            </button>
          </div>
          {!state.enabled ? (
            <p className="mt-2 text-sm text-slate-500">
              Link disabled.
            </p>
          ) : null}
        </div>
      ) : null}

      <form
        action={formAction}
        className="mt-5 flex flex-wrap gap-2"
        onSubmit={() => setCopyMessage(undefined)}
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

      <p
        aria-live="polite"
        className={`mt-3 min-h-5 text-sm ${
          state.status === "error" ? "text-red-700" : "text-blue-700"
        }`}
        role={state.status === "error" ? "alert" : "status"}
      >
        {pending ? "Updating sharing…" : copyMessage || state.message}
      </p>
    </div>
  );
}
