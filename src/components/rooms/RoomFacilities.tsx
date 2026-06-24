import { FASILITAS_MAP } from "@/lib/utils";

interface RoomFacilitiesProps {
  facilities: string[];
}

export default function RoomFacilities({ facilities }: RoomFacilitiesProps) {
  return (
    <div className="bg-[#FAF7F2] rounded-2xl p-6 md:p-8 border border-[#EDE7DB]/80 shadow-sm">
      <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#5C6B52] mb-6 flex items-center gap-2">
        <span>🛋️</span> Fasilitas Kamar
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {facilities.map((itemKey) => {
          const matched = FASILITAS_MAP[itemKey.toLowerCase()] || {
            label: itemKey,
            icon: "✨",
          };
          return (
            <div
              key={itemKey}
              className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#EDE7DB]/50 shadow-[0_2px_8px_rgba(45,51,40,0.02)] hover:border-[#7A8B6F]/40 transition-colors"
            >
              <span className="text-xl leading-none" role="img" aria-label={matched.label}>
                {matched.icon}
              </span>
              <span className="text-sm font-medium text-[#2D3328]">{matched.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
