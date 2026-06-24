import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import QuickBookingBar from "@/components/sections/QuickBookingBar";
import FeaturesSection from "@/components/sections/FeaturesSection";
import RoomsGrid from "@/components/sections/RoomsGrid";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CTASection from "@/components/sections/CTASection";
import { supabase, mapKamarRecord } from "@/lib/supabase";
import type { Kamar } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  // Fetch active rooms from Supabase
  const { data: kamar } = await supabase
    .from("kamar")
    .select("*")
    .order("harga_per_malam", { ascending: true });

  // Fallback sample data for when Supabase is empty or not configured
  const sampleKamar: Kamar[] = [
    {
      id: "1",
      nama: "Kamar Pemandangan Gunung",
      slug: "kamar-pemandangan-gunung",
      deskripsi:
        "Kamar nyaman dengan jendela besar menghadap langsung ke Gunung Merbabu.",
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
      jumlah_foto: 5,
      is_active: true,
      is_popular: true,
      meta_title: null,
      meta_description: null,
      created_at: "",
      updated_at: "",
    },
    {
      id: "2",
      nama: "Suite Sunrise Deluxe",
      slug: "suite-sunrise-deluxe",
      deskripsi:
        "Suite mewah di lantai atas dengan panorama 180 derajat pegunungan.",
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
      jumlah_foto: 8,
      is_active: true,
      is_popular: true,
      meta_title: null,
      meta_description: null,
      created_at: "",
      updated_at: "",
    },
    {
      id: "3",
      nama: "Villa Keluarga Merbabu",
      slug: "villa-keluarga-merbabu",
      deskripsi:
        "Villa luas untuk keluarga besar atau grup teman. 3 kamar tidur.",
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
      jumlah_foto: 10,
      is_active: true,
      is_popular: false,
      meta_title: null,
      meta_description: null,
      created_at: "",
      updated_at: "",
    },
    {
      id: "4",
      nama: "Kamar Cozy Standard",
      slug: "kamar-cozy-standard",
      deskripsi:
        "Kamar nyaman dan terjangkau dengan fasilitas lengkap untuk solo traveler.",
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
      jumlah_foto: 3,
      is_active: true,
      is_popular: false,
      meta_title: null,
      meta_description: null,
      created_at: "",
      updated_at: "",
    },
  ];

  const rooms = (kamar && kamar.length > 0 
    ? kamar.map(mapKamarRecord).filter((r: any) => r.is_active) 
    : sampleKamar) as Kamar[];

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <QuickBookingBar />
        <FeaturesSection />
        <RoomsGrid kamar={rooms} />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
