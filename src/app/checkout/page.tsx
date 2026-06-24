"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatRupiah, formatTanggal, hitungMalam, isValidPhoneIndonesia } from "@/lib/utils";
import type { Kamar } from "@/types";

// Local fallback database of rooms for robust offline/scaffold execution
const SAMPLE_KAMAR: Kamar[] = [
  {
    id: "1",
    nama: "Kamar Pemandangan Gunung",
    slug: "kamar-pemandangan-gunung",
    deskripsi: "Kamar nyaman dengan jendela besar menghadap langsung ke Gunung Merbabu.",
    deskripsi_singkat: "Kamar dengan pemandangan Gunung Merbabu langsung dari jendela dan balkon pribadi",
    tipe: "deluxe",
    kapasitas_tamu: 2,
    jumlah_bed: 1,
    tipe_bed: "queen",
    harga_per_malam: 425000,
    harga_weekend: 525000,
    fasilitas: ["wifi", "tv", "water_heater", "breakfast", "mountain_view", "balcony", "parking"],
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
    deskripsi: "Suite mewah di lantai atas dengan panorama 180 derajat pegunungan.",
    deskripsi_singkat: "Suite deluxe dengan panorama 180° pegunungan dan pemandangan sunrise terbaik",
    tipe: "deluxe",
    kapasitas_tamu: 2,
    jumlah_bed: 1,
    tipe_bed: "king",
    harga_per_malam: 650000,
    harga_weekend: 750000,
    fasilitas: ["wifi", "smart_tv", "ac", "water_heater", "breakfast", "mountain_view", "balcony", "minibar", "bathtub", "parking"],
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
    deskripsi: "Villa luas untuk keluarga besar atau kumpul kumpul teman.",
    deskripsi_singkat: "Villa 3 kamar untuk keluarga besar, taman pribadi, gazebo, kapasitas 8 orang",
    tipe: "villa",
    kapasitas_tamu: 8,
    jumlah_bed: 3,
    tipe_bed: "mixed",
    harga_per_malam: 1200000,
    harga_weekend: 1500000,
    fasilitas: ["wifi", "tv", "ac", "water_heater", "kitchen", "breakfast", "garden", "gazebo", "bbq", "parking"],
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
    deskripsi: "Kamar nyaman dan terjangkau dengan fasilitas lengkap.",
    deskripsi_singkat: "Kamar nyaman terjangkau, ideal untuk solo traveler atau pasangan budget hemat",
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

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const kamarId = searchParams.get("kamar_id") || "";
  const checkIn = searchParams.get("check_in") || "";
  const checkOut = searchParams.get("check_out") || "";
  const tamuParam = Number(searchParams.get("tamu")) || 1;

  const [room, setRoom] = useState<Kamar | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);

  // Form states
  const [namaLengkap, setNamaLengkap] = useState("");
  const [email, setEmail] = useState("");
  const [noHp, setNoHp] = useState("");
  const [catatan, setCatatan] = useState("");
  
  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch room info from Supabase or fallback
  useEffect(() => {
    if (!kamarId) {
      setLoadingRoom(false);
      return;
    }

    async function fetchRoom() {
      try {
        // We import client supabase directly
        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase
          .from("kamar")
          .select("*")
          .eq("id", kamarId)
          .single();

        if (data && !error) {
          setRoom(data as Kamar);
        } else {
          // Fallback to sample
          const found = SAMPLE_KAMAR.find((k) => k.id === kamarId);
          setRoom(found || null);
        }
      } catch (err) {
        const found = SAMPLE_KAMAR.find((k) => k.id === kamarId);
        setRoom(found || null);
      } finally {
        setLoadingRoom(false);
      }
    }

    fetchRoom();
  }, [kamarId]);

  if (loadingRoom) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg className="animate-spin h-10 w-10 text-[#7A8B6F] mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-[#6B7560] text-sm">Memuat formulir pemesanan...</p>
      </div>
    );
  }

  if (!room || !checkIn || !checkOut) {
    return (
      <div className="text-center py-20 max-w-md mx-auto px-5">
        <span className="text-5xl block mb-4">⚠️</span>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#5C6B52] mb-3">
          Detail Pemesanan Tidak Valid
        </h2>
        <p className="text-sm text-[#6B7560] mb-6">
          Maaf, data kamar atau tanggal pemesanan tidak ditemukan. Silakan kembali ke halaman beranda dan pilih kamar lagi.
        </p>
        <Link
          href="/#kamar"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7A8B6F] text-white font-semibold text-sm hover:bg-[#5C6B52] transition-colors"
        >
          Kembali ke Pilihan Kamar
        </Link>
      </div>
    );
  }

  const nights = hitungMalam(checkIn, checkOut);
  
  // Calculate pricing
  let totalHarga = 0;
  const tempDate = new Date(checkIn);
  for (let i = 0; i < nights; i++) {
    const day = tempDate.getDay();
    const isWeekend = day === 5 || day === 6;
    const rate = (isWeekend && room.harga_weekend) ? room.harga_weekend : room.harga_per_malam;
    totalHarga += rate;
    tempDate.setDate(tempDate.getDate() + 1);
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validations
    if (!namaLengkap.trim()) {
      setErrorMsg("Nama lengkap wajib diisi.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Email tidak valid.");
      return;
    }
    if (!isValidPhoneIndonesia(noHp)) {
      setErrorMsg("Nomor HP tidak valid (gunakan format 08xx atau +628xx).");
      return;
    }

    setSubmitting(true);

    try {
      // Send creation payload to API
      const response = await fetch("/api/pesanan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kamar_id: room.id,
          nama_lengkap: namaLengkap,
          email,
          no_hp: noHp,
          catatan,
          check_in: checkIn,
          check_out: checkOut,
          jumlah_tamu: tamuParam,
        }),
      });

      const data = await response.json();

      if (response.ok && data.payment_url) {
        // Redirect to Duitku payment gateway page
        window.location.href = data.payment_url;
      } else {
        setErrorMsg(data.message || "Gagal memproses pemesanan. Silakan coba beberapa saat lagi.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("Error submitting checkout:", err);
      // For scaffold flow, if API is not implemented yet, simulate success redirect
      setErrorMsg("Koneksi gagal atau API Route belum siap. Mengalihkan ke halaman simulasi...");
      setTimeout(() => {
        router.push(`/pesanan/pending?order_id=MBS-DEMO-999&payment_url=https://sandbox.duitku.com`);
      }, 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Columns: Guest Form */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 md:p-8 border border-[#EDE7DB] shadow-sm space-y-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#5C6B52] pb-4 border-b border-[#EDE7DB]">
          Formulir Informasi Pemesan
        </h2>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-[#BA1A1A] font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-[#2D3328] mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Budi Susanto"
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] outline-none focus:border-[#7A8B6F] focus:ring-1 focus:ring-[#7A8B6F]/30 transition-all"
            />
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#2D3328] mb-1.5">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="Contoh: budi@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] outline-none focus:border-[#7A8B6F] focus:ring-1 focus:ring-[#7A8B6F]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#2D3328] mb-1.5">
                Nomor Handphone (WhatsApp) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="Contoh: 081234567890"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] outline-none focus:border-[#7A8B6F] focus:ring-1 focus:ring-[#7A8B6F]/30 transition-all"
              />
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-sm font-semibold text-[#2D3328] mb-1.5">
              Catatan Tambahan <span className="text-gray-400 text-xs font-normal">(Opsional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Minta kamar di lantai atas, late check-in jam 15.00, atau kasur tambahan..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] outline-none focus:border-[#7A8B6F] focus:ring-1 focus:ring-[#7A8B6F]/30 transition-all resize-none"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-[#C4956A] hover:bg-[#D4A76A] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-base transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses Pembayaran...
                </>
              ) : (
                "Lanjut ke Pembayaran"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Order Summary */}
      <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#EDE7DB] shadow-sm space-y-5">
        <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#5C6B52] pb-3 border-b border-[#EDE7DB]/80">
          Ringkasan Pemesanan
        </h3>

        {/* Room details */}
        <div>
          <h4 className="font-bold text-[#2D3328] text-base">{room.nama}</h4>
          <p className="text-xs text-[#6B7560] mt-1 uppercase tracking-wide font-semibold">
            Tipe: {room.tipe} · {tamuParam} Tamu
          </p>
        </div>

        {/* Dates */}
        <div className="space-y-2.5 pt-3 border-t border-[#EDE7DB]/60 text-sm">
          <div className="flex justify-between items-start">
            <span className="text-[#6B7560]">Check-In</span>
            <span className="font-semibold text-[#2D3328] text-right">{formatTanggal(checkIn)}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-[#6B7560]">Check-Out</span>
            <span className="font-semibold text-[#2D3328] text-right">{formatTanggal(checkOut)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7560]">Durasi Menginap</span>
            <span className="font-bold text-[#7A8B6F]">{nights} malam</span>
          </div>
        </div>

        {/* Price calculation */}
        <div className="pt-4 border-t border-[#EDE7DB]/60 space-y-2.5 text-sm">
          <div className="flex justify-between text-[#6B7560]">
            <span>Biaya Kamar ({nights} malam)</span>
            <span>{formatRupiah(totalHarga)}</span>
          </div>
          <div className="flex justify-between text-[#6B7560]">
            <span>Pajak & Biaya Pelayanan</span>
            <span className="text-emerald-600 font-medium">GRATIS</span>
          </div>
          <div className="h-px bg-[#EDE7DB]/80 my-1" />
          <div className="flex justify-between font-bold text-[#2D3328] text-base">
            <span>Total Pembayaran</span>
            <span className="text-[#C4956A]">{formatRupiah(totalHarga)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 md:pt-28 bg-[#F5F0E8] pb-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          {/* Page Header */}
          <div className="mb-8 text-center sm:text-left">
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-[#5C6B52] mb-2">
              Konfirmasi Pemesanan Anda
            </h1>
            <p className="text-sm text-[#6B7560]">
              Lengkapi formulir di bawah untuk menyelesaikan reservasi kamar homestay Anda.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="text-center py-20">
                <p className="text-[#6B7560] text-sm">Loading checkout details...</p>
              </div>
            }
          >
            <CheckoutContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
