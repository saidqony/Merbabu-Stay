"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Beranda", href: "/#beranda" },
  { label: "Kamar", href: "/#kamar" },
  { label: "Tentang", href: "/#tentang" },
  { label: "Kontak", href: "/#kontak" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      id="navbar"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#F5F0E8]/95 backdrop-blur-md border-b border-[#EDE7DB]/80 shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex flex-col">
            <span className={cn(
              "font-[family-name:var(--font-playfair)] text-lg md:text-xl font-bold tracking-tight transition-colors duration-300",
              scrolled ? "text-[#5C6B52]" : "text-white"
            )}>
              🌿 MerbabuStay
            </span>
            <span className={cn(
              "text-[8px] font-semibold tracking-[3px] uppercase -mt-0.5 transition-colors duration-300",
              scrolled ? "text-[#7A8B6F]" : "text-white/80"
            )}>
              HOMESTAY
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors duration-200 relative py-1",
                scrolled ? "text-[#2D3328]" : "text-white",
                "hover:text-[#7A8B6F]",
                "after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#7A8B6F]",
                "after:transition-all after:duration-300 hover:after:w-full"
              )}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#kamar"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#7A8B6F] text-white text-sm font-semibold transition-all duration-200 hover:bg-[#5C6B52] hover:shadow-lg"
          >
            Book Now
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span
            className={cn(
              "block w-6 h-0.5 transition-all duration-300 origin-center",
              scrolled ? "bg-[#2D3328]" : "bg-white",
              mobileOpen && "rotate-45 translate-y-2"
            )}
          />
          <span
            className={cn(
              "block w-6 h-0.5 transition-all duration-300",
              scrolled ? "bg-[#2D3328]" : "bg-white",
              mobileOpen && "opacity-0"
            )}
          />
          <span
            className={cn(
              "block w-6 h-0.5 transition-all duration-300 origin-center",
              scrolled ? "bg-[#2D3328]" : "bg-white",
              mobileOpen && "-rotate-45 -translate-y-2"
            )}
          />
        </button>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={cn(
          "md:hidden fixed inset-0 top-16 bg-[#F5F0E8]/98 backdrop-blur-lg transition-all duration-300 z-40",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex flex-col items-center gap-6 pt-12">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-lg font-medium text-[#2D3328] hover:text-[#7A8B6F] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#kamar"
            onClick={() => setMobileOpen(false)}
            className="mt-4 px-8 py-3 rounded-full bg-[#7A8B6F] text-white font-semibold hover:bg-[#5C6B52] transition-colors"
          >
            Book Now
          </a>
        </div>
      </div>
    </header>
  );
}
