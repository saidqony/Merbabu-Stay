const FEATURES = [
  {
    icon: (
      <svg className="w-12 h-12 text-[#7A8B6F]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: "Lokasi Strategis",
    description:
      "Hanya 5 menit dari basecamp pendakian Gunung Merbabu. Akses mudah dan dekat dengan objek wisata lokal.",
  },
  {
    icon: (
      <svg className="w-12 h-12 text-[#7A8B6F]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5V19.5a1.5 1.5 0 001.5 1.5z" />
      </svg>
    ),
    title: "Pemandangan Memukau",
    description:
      "Nikmati sunrise & sunset Gunung Merbabu langsung dari balkon kamar Anda. Pengalaman tak terlupakan.",
  },
  {
    icon: (
      <svg className="w-12 h-12 text-[#7A8B6F]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12 20.5h.01" />
      </svg>
    ),
    title: "Fasilitas Lengkap",
    description:
      "WiFi cepat, TV, dapur bersama, air panas, dan area parkir luas. Semua kebutuhan Anda tersedia.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="tentang" className="bg-[#F5F0E8] py-20 md:py-[100px]">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-14 md:mb-16">
          <span className="inline-block text-[13px] font-semibold tracking-[2px] uppercase text-[#7A8B6F] mb-3">
            MENGAPA MEMILIH KAMI
          </span>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-[42px] font-semibold text-[#5C6B52] leading-tight max-w-xl mx-auto">
            Pengalaman Menginap yang Berkesan dan Nyaman
          </h2>
          <p className="mt-4 text-base text-[#6B7560] max-w-lg mx-auto">
            Kami hadir untuk memastikan setiap momen liburan Anda di Merbabu
            menjadi pengalaman tak terlupakan
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="bg-[#FAF7F2] rounded-2xl p-8 md:p-10 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(45,51,40,0.1)]"
            >
              <div className="flex justify-center mb-5">{feature.icon}</div>
              <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#5C6B52] mb-3">
                {feature.title}
              </h3>
              <p className="text-[15px] text-[#6B7560] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
