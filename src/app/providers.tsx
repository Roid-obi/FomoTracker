"use client";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  type Persister,
  PersistQueryClientProvider,
} from "@tanstack/react-query-persist-client";
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
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const storagePersister = createSyncStoragePersister({
      storage: window.localStorage,
    });
    setPersister(storagePersister);

    // Hide splash screen transition
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 1500);

    const unmountTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

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

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  const content = (
    <>
      {showSplash && (
        <div
          className={`fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center select-none font-poppins transition-opacity duration-500 ${
            isFading ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-baseline gap-1 mt-6 animate-pulse">
              <span className="font-yellowtail text-5xl font-normal text-primary leading-none">
                Fomo
              </span>
              <span className="font-poppins text-sm font-bold tracking-widest text-primary uppercase leading-none">
                Tracker
              </span>
            </div>
            <p className="text-[10px] text-muted font-light tracking-widest uppercase mt-2 opacity-60">
              Digital Wellbeing Assistant
            </p>
          </div>
        </div>
      )}
      {children}
    </>
  );

  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>
        {content}
        <GooeyToaster position="top-center" />
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {content}
      <GooeyToaster position="top-center" />
    </PersistQueryClientProvider>
  );
}
