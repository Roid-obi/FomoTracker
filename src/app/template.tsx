"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Reset scroll position to top instantly when a page mounts
    window.scrollTo(0, 0);
  }, [pathname]);

  return <div className="flex-1 flex flex-col">{children}</div>;
}
