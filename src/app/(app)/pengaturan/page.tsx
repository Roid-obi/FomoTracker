"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PengaturanPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/pengaturan/profil");
  }, [router]);

  return null;
}
