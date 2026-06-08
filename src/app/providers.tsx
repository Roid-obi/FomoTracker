"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const GooeyToaster = dynamic(
  () => import("goey-toast").then((mod) => mod.GooeyToaster),
  { ssr: false },
);

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <GooeyToaster />
    </QueryClientProvider>
  );
}
