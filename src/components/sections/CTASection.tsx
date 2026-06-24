export default function CTASection() {
  return (
    <section className="relative bg-[#5C6B52] py-20 md:py-24 overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 left-4 text-white text-[200px] leading-none font-serif">
          🌿
        </div>
        <div className="absolute bottom-4 right-4 text-white text-[200px] leading-none font-serif rotate-180">
          🌿
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-[42px] font-semibold text-white leading-tight mb-4">
          Siap untuk Pengalaman Menginap yang Tak Terlupakan?
        </h2>
        <p className="text-base md:text-lg text-white/80 max-w-xl mx-auto mb-8">
          Pesan kamar Anda sekarang dan nikmati liburan menyenangkan di kaki
          Gunung Merbabu.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#kamar"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-xl bg-[#C4956A] text-white font-semibold text-base transition-all duration-200 hover:bg-[#D4A76A] hover:shadow-xl hover:scale-[1.02]"
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
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-xl border-2 border-white/60 text-white font-semibold text-base transition-all duration-200 hover:bg-white/10"
          >
            💬 Hubungi Kami
          </a>
        </div>
      </div>
    </section>
  );
}
