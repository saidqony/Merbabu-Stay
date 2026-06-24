import Link from "next/link";
import { formatRupiah, getRoomBadge } from "@/lib/utils";
import type { Kamar } from "@/types";

interface RoomCardProps {
  kamar: Kamar;
}

export default function RoomCard({ kamar }: RoomCardProps) {
  const badge = getRoomBadge(kamar);

  // Beautiful, theme-appropriate alpine cabin & cozy homestay images by room type
  const ROOM_IMAGES: Record<string, string> = {
    deluxe:
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=600&fit=crop&q=80", // Premium wooden mountain chalet room
    standard:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop&q=80", // Cozy warm bedroom with wood accents
    villa:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&h=600&fit=crop&q=80", // Gorgeous cottage in the misty woods
    family:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop&q=80", // Cozy wooden family suite
  };

  const imageUrl =
    kamar.foto_utama || ROOM_IMAGES[kamar.tipe] || ROOM_IMAGES.standard;

  return (
    <div className="group bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(45,51,40,0.12)]">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={kamar.nama}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {badge && (
          <span
            className="absolute top-0 left-0 px-3 py-1 text-xs font-semibold text-white rounded-[0_8px_0_8px]"
            style={{ backgroundColor: badge.bgColor }}
          >
            {badge.text}
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 md:p-6">
        {/* Room Name */}
        <h3 className="font-[family-name:var(--font-playfair)] text-lg md:text-xl font-semibold text-[#5C6B52] mb-2">
          {kamar.nama}
        </h3>

        {/* Specs Row */}
        <div className="flex items-center gap-4 text-[13px] text-[#6B7560] mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            {kamar.kapasitas_tamu} Tamu
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            {kamar.jumlah_bed} {kamar.tipe_bed === "king" ? "King Bed" : kamar.tipe_bed === "queen" ? "Queen Bed" : "Bed"}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#EDE7DB] my-3" />

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-[#C4956A]">
              {formatRupiah(kamar.harga_per_malam)}
            </span>
            <span className="text-[13px] text-[#6B7560] ml-1">/malam</span>
          </div>
          <Link
            href={`/kamar/${kamar.slug}`}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#7A8B6F] text-white text-sm font-medium transition-all duration-200 hover:bg-[#5C6B52]"
          >
            Lihat Detail
            <svg
              className="w-3.5 h-3.5"
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
          </Link>
        </div>
      </div>
    </div>
  );
}
