"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isExcluded =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/insight") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/settings");

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  if (isExcluded) return null;

  return (
    <div className="sticky top-4 z-50 w-full px-4 sm:px-6">
      <header className="mx-auto max-w-5xl rounded-2xl border border-border bg-card/85 backdrop-blur-md shadow-md shadow-primary/5 p-4 md:py-3 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-baseline gap-0.5 sm:gap-1 select-none"
          >
            <span className="font-yellowtail text-3xl sm:text-4xl font-normal text-primary leading-none">
              Fomo
            </span>
            <span className="font-poppins text-[9px] sm:text-[10px] md:text-xs font-bold tracking-widest text-primary uppercase leading-none">
              Tracker
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              href={pathname === "/" ? "#features" : "/#features"}
              className="text-primary/80 hover:text-primary transition-colors font-poppins"
            >
              Home
            </Link>
            <Link
              href="/panduan"
              className={`font-poppins transition-colors ${
                pathname === "/panduan"
                  ? "text-secondary font-semibold"
                  : "text-primary/80 hover:text-primary"
              }`}
            >
              Panduan
            </Link>
            <Link
              href="/tentang"
              className={`font-poppins transition-colors ${
                pathname === "/tentang"
                  ? "text-secondary font-semibold"
                  : "text-primary/80 hover:text-primary"
              }`}
            >
              Tentang
            </Link>
            <Link
              href="/test-get-indicator-mobile"
              className={`font-poppins transition-colors ${
                pathname === "/test-get-indicator-mobile"
                  ? "text-secondary font-semibold"
                  : "text-primary/80 hover:text-primary"
              }`}
            >
              Test-get-android
            </Link>
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center">
            <Link
              href="/auth/login"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-secondary transition-all shadow-sm cursor-pointer font-poppins"
            >
              Masuk
            </Link>
          </div>

          {/* Mobile Hamburger Button with Animation */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col justify-center items-center w-8 h-8 rounded-lg text-primary hover:bg-muted-light focus:outline-none transition-all relative cursor-pointer"
              aria-label="Toggle menu"
            >
              <span
                className={`block absolute h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${
                  isMenuOpen ? "rotate-45" : "-translate-y-1.5"
                }`}
              />
              <span
                className={`block absolute h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block absolute h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${
                  isMenuOpen ? "-rotate-45" : "translate-y-1.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "max-h-64 opacity-100 mt-4 border-t border-border pt-4"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <nav className="flex flex-col gap-3 pb-2">
            <Link
              href={pathname === "/" ? "#features" : "/#features"}
              onClick={handleLinkClick}
              className="text-sm font-medium hover:text-secondary transition-colors px-2 py-2 rounded-lg hover:bg-muted-light font-poppins"
            >
              Home
            </Link>
            <Link
              href="/panduan"
              onClick={handleLinkClick}
              className={`text-sm font-medium transition-colors px-2 py-2 rounded-lg hover:bg-muted-light font-poppins ${
                pathname === "/panduan"
                  ? "text-secondary font-semibold bg-muted-light/55"
                  : "hover:text-secondary"
              }`}
            >
              Panduan
            </Link>
            <Link
              href="/tentang"
              onClick={handleLinkClick}
              className={`text-sm font-medium transition-colors px-2 py-2 rounded-lg hover:bg-muted-light font-poppins ${
                pathname === "/tentang"
                  ? "text-secondary font-semibold bg-muted-light/55"
                  : "hover:text-secondary"
              }`}
            >
              Tentang
            </Link>
            <Link
              href="/test-get-indicator-mobile"
              onClick={handleLinkClick}
              className={`text-sm font-medium transition-colors px-2 py-2 rounded-lg hover:bg-muted-light font-poppins ${
                pathname === "/test-get-indicator-mobile"
                  ? "text-secondary font-semibold bg-muted-light/55"
                  : "hover:text-secondary"
              }`}
            >
              Test-get-android
            </Link>
            <Link
              href="/auth/login"
              onClick={handleLinkClick}
              className="w-full text-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-secondary transition-all shadow-sm cursor-pointer mt-2 font-poppins"
            >
              Masuk
            </Link>
          </nav>
        </div>
      </header>
    </div>
  );
}
