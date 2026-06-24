"use client";

import { useState } from "react";
import type { Kamar } from "@/types";
import RoomCard from "@/components/rooms/RoomCard";
import { cn } from "@/lib/utils";

const FILTER_TABS = [
  { label: "Semua", value: "all" },
  { label: "Standard", value: "standard" },
  { label: "Deluxe", value: "deluxe" },
  { label: "Family", value: "family" },
  { label: "Villa", value: "villa" },
];

interface RoomsGridProps {
  kamar: Kamar[];
}

export default function RoomsGrid({ kamar }: RoomsGridProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? kamar
      : kamar.filter((k) => k.tipe === activeFilter);

  return (
    <section id="kamar" className="bg-[#FAF7F2] py-20 md:py-[100px]">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-block text-[13px] font-semibold tracking-[2px] uppercase text-[#C4956A] mb-3">
            PILIHAN KAMAR
          </span>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-[42px] font-semibold text-[#5C6B52] leading-tight max-w-xl mx-auto">
            Temukan Kamar Ideal untuk Liburan Anda
          </h2>
          <p className="mt-4 text-base text-[#6B7560] max-w-lg mx-auto">
            Dari kamar cozy untuk solo traveler hingga villa keluarga dengan
            pemandangan gunung
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-10 md:mb-12">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeFilter === tab.value
                  ? "bg-[#5C6B52] text-white"
                  : "bg-transparent text-[#5C6B52] border border-[#5C6B52] hover:bg-[#5C6B52]/10"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filtered.map((room) => (
            <RoomCard key={room.id} kamar={room} />
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#6B7560] text-lg">
              Tidak ada kamar untuk kategori ini.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
