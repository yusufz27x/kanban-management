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

function isCleanSocketClose(error: Error) {
  const cause = error.cause;

  if (!cause || typeof cause !== "object") {
    return false;
  }

  const { code, wasClean } = cause as { code?: unknown; wasClean?: unknown };

  return wasClean === true && (code === 1000 || code === 1001);
}

type TaskRealtimeProps = {
  logLabel?: string;
  topic: string;
};

export function TaskRealtime({
  logLabel = "Task realtime",
  topic,
}: TaskRealtimeProps) {
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
          .channel(topic, { config: { private: true } })
          .on("broadcast", { event: "INSERT" }, scheduleRefresh)
          .on("broadcast", { event: "UPDATE" }, scheduleRefresh)
          .on("broadcast", { event: "DELETE" }, scheduleRefresh)
          .on("broadcast", { event: "changed" }, scheduleRefresh)
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

              if (error && !isCleanSocketClose(error)) {
                console.error(`${logLabel} subscription failed`, error);
              }
            }
          });
      } catch (error) {
        if (!cancelled) {
          console.error(`${logLabel} authentication failed`, error);
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
  }, [logLabel, router, topic]);

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
