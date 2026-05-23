"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isExcluded = pathname.startsWith("/auth") || pathname.startsWith("/dashboard");

  if (isExcluded) return null;
  return (
    <footer className="mt-auto border-t border-border bg-card py-12 text-muted">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-8 mb-8 text-left">
          <div>
            <div className="flex items-baseline gap-0.5 sm:gap-1 select-none mb-4">
              <span className="font-yellowtail text-3xl font-normal text-primary leading-none">
                Fomo
              </span>
              <span className="font-poppins text-[9px] sm:text-[10px] md:text-xs font-bold tracking-widest text-primary uppercase leading-none">
                Tracker
              </span>
            </div>
            <p className="text-sm font-light leading-relaxed font-poppins">
              Membantu kamu memahami pola penggunaan media sosial dan membangun kebiasaan digital yang lebih sehat.
            </p>
          </div>
          <div>
            <h4 className="text-primary font-semibold text-sm mb-4 font-poppins">Tautan Pintas</h4>
            <div className="flex flex-col gap-2.5 text-sm font-poppins">
              <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
              <Link href="/panduan" className="hover:text-primary transition-colors">Panduan Pengguna</Link>
              <Link href="/tentang" className="hover:text-primary transition-colors">Tentang Kami</Link>
            </div>
          </div>
          <div>
            <h4 className="text-primary font-semibold text-sm mb-4 font-poppins">Dampak Sosial</h4>
            <p className="text-xs font-light leading-relaxed mb-3 font-poppins">
              FomoTracker berkontribusi pada pencapaian SDGs PBB (Kesehatan Baik, Pendidikan Berkualitas, Pertumbuhan Ekonomi).
            </p>
            <span className="inline-block text-[10px] font-medium bg-muted-light text-primary px-2.5 py-1 rounded-full font-poppins">
              Platform Nirlaba Dampak Sosial
            </span>
          </div>
        </div>
        
        <div className="border-t border-border/60 pt-6 text-center text-xs">
          <p className="font-poppins">
            © {new Date().getFullYear()} FomoTracker. Dibuat dengan cinta menggunakan Next.js & Tailwind CSS.
          </p>
        </div>
      </div>
    </footer>
  );
}
