import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, mapKamarRecord } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";

export const dynamic = "force-dynamic";
export const revalidate = 0;
import Footer from "@/components/layout/Footer";
import RoomGallery from "@/components/rooms/RoomGallery";
import RoomFacilities from "@/components/rooms/RoomFacilities";
import BookingWidget from "@/components/rooms/BookingWidget";
import { formatRupiah } from "@/lib/utils";
import type { Kamar } from "@/types";

// Mock database fallback for robust running without DB
const SAMPLE_KAMAR: Kamar[] = [
  {
    id: "1",
    nama: "Kamar Pemandangan Gunung",
    slug: "kamar-pemandangan-gunung",
    deskripsi:
      "Nikmati kenyamanan ekstra di kamar Deluxe kami yang dirancang khusus untuk memberikan pengalaman menginap terbaik. Dilengkapi dengan jendela kaca besar yang menghadap langsung ke panorama megah Gunung Merbabu, Anda dapat menikmati keindahan alam dan udara segar pegunungan langsung dari ranjang Anda. Kamar ini didekorasi dengan sentuhan kayu hangat dan warna alam yang menenangkan.",
    deskripsi_singkat:
      "Kamar dengan pemandangan Gunung Merbabu langsung dari jendela dan balkon pribadi",
    tipe: "deluxe",
    kapasitas_tamu: 2,
    jumlah_bed: 1,
    tipe_bed: "queen",
    harga_per_malam: 425000,
    harga_weekend: 525000,
    fasilitas: [
      "wifi",
      "tv",
      "water_heater",
      "breakfast",
      "mountain_view",
      "balcony",
      "parking",
    ],
    foto_utama: null,
    images: [] as any[], // fallback
    jumlah_foto: 5,
    is_active: true,
    is_popular: true,
    meta_title: "Kamar Pemandangan Gunung | MerbabuStay",
    meta_description: "Menginap nyaman dengan view langsung Gunung Merbabu di Selo, Boyolali.",
    created_at: "",
    updated_at: "",
  } as any,
  {
    id: "2",
    nama: "Suite Sunrise Deluxe",
    slug: "suite-sunrise-deluxe",
    deskripsi:
      "Suite termewah kami yang berada di lantai teratas, menawarkan pandangan panorama 180 derajat pegunungan dan lembah Selo yang menakjubkan. Dirancang khusus untuk momen romantis atau liburan premium Anda. Nikmati fasilitas berkelas mulai dari bathtub pribadi dengan pemandangan langsung ke gunung, smart TV ukuran besar, minibar lengkap, hingga akses balkon pribadi yang luas untuk menyaksikan momen matahari terbit (sunrise) terbaik.",
    deskripsi_singkat:
      "Suite deluxe dengan panorama 180° pegunungan dan pemandangan sunrise terbaik",
    tipe: "deluxe",
    kapasitas_tamu: 2,
    jumlah_bed: 1,
    tipe_bed: "king",
    harga_per_malam: 650000,
    harga_weekend: 750000,
    fasilitas: [
      "wifi",
      "smart_tv",
      "ac",
      "water_heater",
      "breakfast",
      "mountain_view",
      "balcony",
      "minibar",
      "bathtub",
      "parking",
    ],
    foto_utama: null,
    images: [] as any[], // fallback
    jumlah_foto: 8,
    is_active: true,
    is_popular: true,
    meta_title: "Suite Sunrise Deluxe - Pemandangan Terindah | MerbabuStay",
    meta_description: "Nikmati kemewahan suite sunrise dengan fasilitas bathtub dan balkon pribadi panorama 180 derajat.",
    created_at: "",
    updated_at: "",
  } as any,
  {
    id: "3",
    nama: "Villa Keluarga Merbabu",
    slug: "villa-keluarga-merbabu",
    deskripsi:
      "Pilihan sempurna untuk liburan keluarga besar atau kumpul bersama teman-teman terdekat. Villa berukuran luas ini memiliki 3 kamar tidur yang nyaman, ruang tamu komunal yang hangat, dapur lengkap siap pakai, taman pribadi yang indah, gazebo kayu klasik, serta fasilitas BBQ area di halaman belakang. Rasakan kebersamaan yang hangat dalam balutan udara sejuk pegunungan Merbabu.",
    deskripsi_singkat:
      "Villa 3 kamar untuk keluarga besar, taman pribadi, gazebo, kapasitas 8 orang",
    tipe: "villa",
    kapasitas_tamu: 8,
    jumlah_bed: 3,
    tipe_bed: "mixed",
    harga_per_malam: 1200000,
    harga_weekend: 1500000,
    fasilitas: [
      "wifi",
      "tv",
      "ac",
      "water_heater",
      "kitchen",
      "breakfast",
      "garden",
      "gazebo",
      "bbq",
      "parking",
    ],
    foto_utama: null,
    images: [] as any[], // fallback
    jumlah_foto: 10,
    is_active: true,
    is_popular: false,
    meta_title: "Villa Keluarga Merbabu - 3 Kamar Tidur | MerbabuStay",
    meta_description: "Booking villa keluarga luas di kaki Gunung Merbabu lengkap dengan dapur, taman, gazebo, dan BBQ.",
    created_at: "",
    updated_at: "",
  } as any,
  {
    id: "4",
    nama: "Kamar Cozy Standard",
    slug: "kamar-cozy-standard",
    deskripsi:
      "Dirancang untuk solo traveler, backpaker, atau pasangan dengan budget hemat yang mengutamakan kenyamanan beristirahat setelah seharian beraktivitas di luar. Kamar Cozy Standard menawarkan kamar tidur yang bersih, kasur empuk berkualitas tinggi, kamar mandi dalam dengan air hangat yang menyegarkan, serta koneksi WiFi berkecepatan tinggi gratis untuk menunjang aktivitas digital Anda.",
    deskripsi_singkat:
      "Kamar nyaman terjangkau, ideal untuk solo traveler atau pasangan budget hemat",
    tipe: "standard",
    kapasitas_tamu: 2,
    jumlah_bed: 1,
    tipe_bed: "double",
    harga_per_malam: 295000,
    harga_weekend: 350000,
    fasilitas: ["wifi", "water_heater", "parking"],
    foto_utama: null,
    images: [] as any[], // fallback
    jumlah_foto: 3,
    is_active: true,
    is_popular: false,
    meta_title: "Kamar Cozy Standard Hemat | MerbabuStay",
    meta_description: "Pilihan kamar terjangkau, bersih, nyaman dengan fasilitas lengkap di Selo Boyolali.",
    created_at: "",
    updated_at: "",
  } as any,
];

async function getRoomBySlug(slug: string): Promise<Kamar | null> {
  try {
    // 0. Try querying by slug directly first (in case the slug column has been added to the database!)
    try {
      const { data, error } = await supabase
        .from("kamar")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      
      if (data && !error) {
        const mapped = mapKamarRecord(data);
        if (mapped.is_active) {
          return mapped as Kamar;
        }
      }
    } catch (e) {
      // Ignore: if slug column doesn't exist yet, we catch it and proceed to fallbacks below
    }

    // 1. If it's a UUID-based slug (kamar-[uuid]), query by ID directly!
    const uuidMatch = slug.match(/^kamar-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
    if (uuidMatch) {
      const id = uuidMatch[1];
      const { data, error } = await supabase
        .from("kamar")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (data && !error) {
        const mapped = mapKamarRecord(data);
        if (mapped.is_active) {
          return mapped as Kamar;
        }
      }
    }

    // 2. Otherwise, fetch all rooms and find the matching mapped slug in memory.
    // This is 100% schema-agnostic and guarantees we find the room even if there's no slug column!
    const { data, error } = await supabase.from("kamar").select("*");
    if (data && !error) {
      const mappedRooms = data.map(mapKamarRecord);
      const found = mappedRooms.find((r: any) => r.slug === slug);
      if (found && found.is_active) {
        return found as Kamar;
      }
    }
  } catch (err) {
    console.error("Error fetching room from Supabase:", err);
  }

  // Fallback to sample data
  const fallback = SAMPLE_KAMAR.find((k) => k.slug === slug);
  return fallback || null;
}

export async function generateStaticParams() {
  try {
    const { data } = await supabase.from("kamar").select("*");
    if (data && data.length > 0) {
      return data
        .map(mapKamarRecord)
        .filter((r: any) => r.is_active)
        .map((room: any) => ({ slug: room.slug }));
    }
  } catch (err) {}

  return SAMPLE_KAMAR.map((room) => ({ slug: room.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);

  if (!room) {
    return {
      title: "Kamar Tidak Ditemukan",
    };
  }

  return {
    title: room.meta_title || room.nama,
    description:
      room.meta_description ||
      room.deskripsi_singkat ||
      `Detail kamar dan pemesanan online untuk ${room.nama} di MerbabuStay.`,
  };
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);

  if (!room) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 md:pt-28 bg-[#F5F0E8] pb-20">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          {/* Breadcrumb / Back Link */}
          <div className="mb-6">
            <Link
              href="/#kamar"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A8B6F] hover:text-[#5C6B52] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Pilihan Kamar
            </Link>
          </div>

          {/* Title Section */}
          <div className="mb-8">
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl font-bold text-[#5C6B52] mb-3 leading-tight">
              {room.nama}
            </h1>
            <p className="text-sm md:text-base text-[#6B7560] max-w-3xl">
              {room.deskripsi_singkat}
            </p>
          </div>

          {/* Grid Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Gallery, Description, Facilities */}
            <div className="lg:col-span-2 space-y-8">
              {/* Photo Gallery */}
              <RoomGallery nama={room.nama} fotoUtama={room.foto_utama} tipe={room.tipe} />

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#EDE7DB]/80 shadow-sm">
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#5C6B52] mb-4">
                  Tentang Kamar
                </h3>
                <p className="text-[#2D3328] leading-relaxed text-sm md:text-base whitespace-pre-line">
                  {room.deskripsi}
                </p>
              </div>

              {/* Facilities */}
              <RoomFacilities facilities={room.fasilitas} />
            </div>

            {/* Right Column: Booking Widget */}
            <div>
              <BookingWidget
                kamarId={room.id}
                hargaPerMalam={room.harga_per_malam}
                hargaWeekend={room.harga_weekend}
                kapasitasTamu={room.kapasitas_tamu}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
