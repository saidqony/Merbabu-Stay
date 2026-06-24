"use client";

import { useState } from "react";

const TESTIMONIALS = [
  {
    quote:
      "Pengalaman menginap yang luar biasa! Kamar bersih, pemandangan gunung yang menakjubkan, dan host sangat ramah. Pasti akan kembali lagi!",
    name: "Budi S.",
    from: "Jakarta",
    date: "Jun 2026",
    rating: 5,
  },
  {
    quote:
      "Pemandangan dari kamar sungguh luar biasa. Sunrise dari balkon indah banget! Best stay ever di area Merbabu.",
    name: "Sarah M.",
    from: "Bandung",
    date: "Mei 2026",
    rating: 5,
  },
  {
    quote:
      "Anak-anak sangat senang dengan ruang bermain dan area terbuka. Villa-nya sangat luas dan nyaman. Pasti akan kembali!",
    name: "Keluarga Wijaya",
    from: "Surabaya",
    date: "Jun 2026",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="bg-[#F5F0E8] py-20 md:py-[100px]">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-14">
          <span className="inline-block text-[13px] font-semibold tracking-[2px] uppercase text-[#7A8B6F] mb-3">
            TESTIMONI TAMU
          </span>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-[42px] font-semibold text-[#5C6B52] leading-tight">
            Apa Kata Tamu Kami?
          </h2>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {TESTIMONIALS.map((t, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
            >
              {/* Quote Icon */}
              <span className="block text-4xl font-serif text-[#C4956A] opacity-50 leading-none mb-4">
                &ldquo;
              </span>

              {/* Quote */}
              <p className="text-[15px] text-[#2D3328] leading-relaxed mb-6">
                {t.quote}
              </p>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-[#D4A76A]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Guest Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EDE7DB] flex items-center justify-center text-sm font-semibold text-[#5C6B52]">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2D3328]">
                    {t.name}
                  </p>
                  <p className="text-xs text-[#6B7560]">
                    {t.from} · {t.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots Navigation */}
        <div className="flex items-center justify-center gap-2 mt-8 md:hidden">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === activeIndex ? "bg-[#7A8B6F]" : "bg-[#EDE7DB]"
              }`}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
