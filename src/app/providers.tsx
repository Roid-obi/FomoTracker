"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  PersistQueryClientProvider,
  type Persister,
} from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import dynamic from "next/dynamic";
import { type ReactNode, useEffect, useState } from "react";

const GooeyToaster = dynamic(
  () => import("goey-toast").then((mod) => mod.GooeyToaster),
  { ssr: false },
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days cache persistence
      staleTime: 0, // Immediately stale, revalidate in background
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [persister, setPersister] = useState<Persister | null>(null);

  useEffect(() => {
    const storagePersister = createSyncStoragePersister({
      storage: window.localStorage,
    });
    setPersister(storagePersister);

    // Register Service Worker for offline cache storage
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log(
            "Service Worker registered successfully with scope:",
            reg.scope,
          );
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    }
  }, []);

  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        <GooeyToaster position="top-center" />
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
      <GooeyToaster position="top-center" />
    </PersistQueryClientProvider>
  );
}
