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
    <section
      aria-labelledby="sharing-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            className="text-lg font-semibold text-slate-950"
            id="sharing-heading"
          >
            Sharing
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            Anyone with the link can view. Read-only.
          </p>
        </div>
        <span
          className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${
            state.enabled
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
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
              className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              id="share-url"
              onFocus={(event) => event.currentTarget.select()}
              readOnly
              value={sharePath}
            />
            <button
              className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending || state.enabled}
          name="operation"
          type="submit"
          value="enable"
        >
          {state.token ? "Re-enable" : "Enable"}
        </button>
        {state.token ? (
          <>
            <button
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pending}
              name="operation"
              type="submit"
              value="regenerate"
            >
              New link
            </button>
            <button
              className="rounded-lg px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pending || !state.enabled}
              name="operation"
              type="submit"
              value="disable"
            >
              Disable
            </button>
          </>
        ) : null}
      </form>

      <p
        aria-live="polite"
        className={`mt-3 min-h-5 text-sm ${
          state.status === "error" ? "text-red-700" : "text-emerald-700"
        }`}
        role={state.status === "error" ? "alert" : "status"}
      >
        {pending ? "Updating sharing…" : copyMessage || state.message}
      </p>
    </section>
  );
}
