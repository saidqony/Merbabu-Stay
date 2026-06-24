"use client";

import { useState } from "react";

interface RoomGalleryProps {
  nama: string;
  fotoUtama: string | null;
  tipe: string;
}

export default function RoomGallery({ nama, fotoUtama, tipe }: RoomGalleryProps) {
  // Fallback placeholder images by room type
  // High-quality alpine chalet & rustic mountain homestay images by room type
  const ROOM_IMAGES: Record<string, string[]> = {
    deluxe: [
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&h=800&fit=crop&q=80", // Premium wooden mountain chalet room
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop&q=80", // Cozy rustic bedroom with forest/mountain view window
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&h=800&fit=crop&q=80", // Warm wooden bedroom cabin theme
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&h=800&fit=crop&q=80", // Breathtaking mountain sunrise
    ],
    standard: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&h=800&fit=crop&q=80", // Cozy warm bedroom with wood accents
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&h=800&fit=crop&q=80", // Charming mountain guest house bedroom
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&h=800&fit=crop&q=80", // Cozy mountain lodge room interior
    ],
    villa: [
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&h=800&fit=crop&q=80", // Gorgeous cottage in the misty woods
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop&q=80", // Beautiful green mountain backdrop
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&h=800&fit=crop&q=80", // Cozy wooden glamping/cabin campfire lawn
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&h=800&fit=crop&q=80", // Spacious family chalet interior
    ],
    family: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&h=800&fit=crop&q=80", // Cozy wooden family suite
      "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&h=800&fit=crop&q=80", // Rustic wooden interior with high forest windows
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=800&fit=crop&q=80", // Forest view cabin lounge area
    ],
  };

  const images = ROOM_IMAGES[tipe] || ROOM_IMAGES.standard;
  const displayImages = fotoUtama ? [fotoUtama, ...images.slice(1)] : images;

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <div className="w-full">
      {/* Main Image Container */}
      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-md group">
        <img
          src={displayImages[activeIndex]}
          alt={`${nama} - Foto ${activeIndex + 1}`}
          className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 hover:scale-[1.01]"
          onClick={() => setLightboxOpen(true)}
        />

        {/* Floating Index indicator */}
        <span className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
          {activeIndex + 1} / {displayImages.length}
        </span>

        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-[#2D3328] shadow-md flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Foto sebelumnya"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-[#2D3328] shadow-md flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Foto berikutnya"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
        {displayImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`relative flex-shrink-0 aspect-[4/3] w-20 sm:w-24 rounded-lg overflow-hidden border-2 transition-all ${
              idx === activeIndex
                ? "border-[#7A8B6F] ring-2 ring-[#7A8B6F]/25 scale-95"
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-[#A8B89E] transition-colors"
            aria-label="Tutup galeri"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative max-w-5xl w-full aspect-[16/10] max-h-[80vh]">
            <img
              src={displayImages[activeIndex]}
              alt={nama}
              className="w-full h-full object-contain rounded-lg"
            />

            {/* Lightbox navigation */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="mt-4 text-white/80 text-sm">
            {activeIndex + 1} / {displayImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
