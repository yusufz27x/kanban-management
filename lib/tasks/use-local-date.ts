"use client";

import { useSyncExternalStore } from "react";

import { toLocalDateKey } from "@/lib/tasks/dates";

function subscribeToLocalDate(onStoreChange: () => void) {
  const interval = window.setInterval(onStoreChange, 60_000);
  return () => window.clearInterval(interval);
}

function getLocalDateSnapshot() {
  return toLocalDateKey(new Date());
}

function getServerDateSnapshot() {
  return "";
}

export function useLocalDate() {
  return useSyncExternalStore(
    subscribeToLocalDate,
    getLocalDateSnapshot,
    getServerDateSnapshot,
  );
}
