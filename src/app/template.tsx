"use client";

import { useEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Reset scroll position to top instantly when a page mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="animate-page-enter flex-1 flex flex-col">{children}</div>
  );
}
