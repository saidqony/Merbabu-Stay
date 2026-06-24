"use client";

export default function QuickBookingBar() {
  return (
    <div className="relative z-10 max-w-5xl mx-auto px-5 -mt-14 md:-mt-16 mb-8">
      <div className="bg-white rounded-[20px] shadow-[0_20px_60px_rgba(45,51,40,0.15)] p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0">
          {/* Check-in */}
          <div className="lg:border-r lg:border-[#EDE7DB] lg:pr-6">
            <label className="block text-[13px] font-medium text-[#6B7560] mb-1">
              Tanggal Masuk
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[#7A8B6F]">📅</span>
              <input
                type="date"
                className="w-full text-sm font-medium text-[#2D3328] bg-transparent border-none outline-none cursor-pointer"
                defaultValue="2026-06-26"
              />
            </div>
          </div>

          {/* Check-out */}
          <div className="lg:border-r lg:border-[#EDE7DB] lg:px-6">
            <label className="block text-[13px] font-medium text-[#6B7560] mb-1">
              Tanggal Keluar
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[#7A8B6F]">📅</span>
              <input
                type="date"
                className="w-full text-sm font-medium text-[#2D3328] bg-transparent border-none outline-none cursor-pointer"
                defaultValue="2026-06-28"
              />
            </div>
          </div>

          {/* Guest Count */}
          <div className="lg:px-6">
            <label className="block text-[13px] font-medium text-[#6B7560] mb-1">
              Jumlah Tamu
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[#7A8B6F]">👥</span>
              <select className="w-full text-sm font-medium text-[#2D3328] bg-transparent border-none outline-none cursor-pointer appearance-none">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Tamu" : "Tamu"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <a
              href="#kamar"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#7A8B6F] text-white font-semibold text-sm transition-all duration-200 hover:bg-[#5C6B52] hover:shadow-lg"
            >
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Cari Kamar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
