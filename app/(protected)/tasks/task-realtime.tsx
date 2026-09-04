"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type ConnectionState = "connecting" | "live" | "paused";

const connectionLabels: Record<ConnectionState, string> = {
  connecting: "Connecting",
  live: "Live",
  paused: "Offline",
};

const indicatorClasses: Record<ConnectionState, string> = {
  connecting: "bg-slate-400",
  live: "bg-emerald-500",
  paused: "bg-amber-500",
};

export function TaskRealtime({ userId }: { userId: string }) {
  const router = useRouter();
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | undefined;
    let refreshTimeout: number | undefined;

    function scheduleRefresh() {
      if (cancelled) {
        return;
      }

      window.clearTimeout(refreshTimeout);
      refreshTimeout = window.setTimeout(() => router.refresh(), 150);
    }

    async function subscribe() {
      try {
        await supabase.realtime.setAuth();

        if (cancelled) {
          return;
        }

        channel = supabase
          .channel(`tasks:${userId}`, { config: { private: true } })
          .on("broadcast", { event: "INSERT" }, scheduleRefresh)
          .on("broadcast", { event: "UPDATE" }, scheduleRefresh)
          .on("broadcast", { event: "DELETE" }, scheduleRefresh)
          .subscribe((status, error) => {
            if (cancelled) {
              return;
            }

            if (status === "SUBSCRIBED") {
              setConnectionState("live");
              return;
            }

            if (
              status === "CHANNEL_ERROR" ||
              status === "TIMED_OUT" ||
              status === "CLOSED"
            ) {
              setConnectionState("paused");

              if (error) {
                console.error("Task realtime subscription failed", error);
              }
            }
          });
      } catch (error) {
        if (!cancelled) {
          console.error("Task realtime authentication failed", error);
          setConnectionState("paused");
        }
      }
    }

    void subscribe();

    return () => {
      cancelled = true;
      window.clearTimeout(refreshTimeout);

      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [router, userId]);

  return (
    <p
      aria-live="polite"
      className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"
    >
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${indicatorClasses[connectionState]}`}
      />
      {connectionLabels[connectionState]}
    </p>
  );
}
