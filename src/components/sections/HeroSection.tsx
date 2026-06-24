"use client";

import { useEffect, useRef } from "react";

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.classList.add("opacity-100");
  }, []);

  return (
    <section
      id="beranda"
      ref={heroRef}
      className="relative w-full min-h-[100vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')",
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(45,51,40,0.7)] via-[rgba(45,51,40,0.3)] to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-5 text-center flex flex-col items-center gap-6">
        {/* Tagline Pill */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 animate-fade-in"
          style={{ animationDelay: "0.2s", opacity: 0 }}
        >
          <span className="text-[13px] font-medium text-white">
            🏔️ Penginapan Terbaik di Kaki Gunung Merbabu
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-[56px] font-bold text-white leading-[1.1] animate-fade-in"
          style={{
            textShadow: "0 2px 20px rgba(0,0,0,0.3)",
            animationDelay: "0.4s",
            opacity: 0,
            maxWidth: "640px",
          }}
        >
          Rasakan Ketenangan Menginap di Kaki Gunung Merbabu
        </h1>

        {/* Subtitle */}
        <p
          className="text-base sm:text-lg text-white/90 max-w-xl leading-relaxed animate-fade-in"
          style={{ animationDelay: "0.6s", opacity: 0 }}
        >
          Homestay nyaman dengan pemandangan spektakuler, udara segar
          pegunungan, dan fasilitas lengkap untuk liburan keluarga maupun
          petualanganmu.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center gap-4 mt-2 animate-fade-in"
          style={{ animationDelay: "0.8s", opacity: 0 }}
        >
          <a
            href="#kamar"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#7A8B6F] text-white font-semibold text-base transition-all duration-200 hover:bg-[#5C6B52] hover:shadow-xl hover:scale-[1.02]"
          >
            Pesan Sekarang
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
          <a
            href="#kamar"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white text-white font-semibold text-base transition-all duration-200 hover:bg-white/10"
          >
            Lihat Kamar
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce-slow">
        <svg
          className="w-6 h-6 text-white/70"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </section>
  );
}
