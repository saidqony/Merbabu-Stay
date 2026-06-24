"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatRupiah, formatTanggal } from "@/lib/utils";

function PendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id") || "";

  const [loading, setLoading] = useState(true);
  const [pesanan, setPesanan] = useState<any>(null);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  // 1. Fetch booking details
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    async function fetchDetails() {
      try {
        const res = await fetch(`/api/pesanan/${orderId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setPesanan(data.data);
          
          // If already paid, immediately redirect to success page
          if (data.data.status === "paid" || data.data.status === "confirmed") {
            router.push(`/pesanan/sukses?order_id=${orderId}`);
          }
        } else {
          setError(data.message || "Gagal memuat detail pesanan.");
        }
      } catch (err) {
        setError("Koneksi gagal saat memuat detail pesanan.");
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [orderId, router]);

  // 2. Real-time status polling (every 5 seconds)
  useEffect(() => {
    if (!orderId || !pesanan || pesanan.status !== "waiting_payment") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/check-status?order_id=${orderId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          if (data.status === "paid" || data.status === "confirmed") {
            clearInterval(interval);
            router.push(`/pesanan/sukses?order_id=${orderId}`);
          } else if (data.status === "failed" || data.status === "cancelled") {
            clearInterval(interval);
            router.push(`/pesanan/gagal?order_id=${orderId}`);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, pesanan, router]);

  // 3. Countdown timer logic
  useEffect(() => {
    if (!pesanan || !pesanan.expired_at) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(pesanan.expired_at) - +new Date();
      
      if (difference <= 0) {
        setTimeLeft("EXPIRED");
        return;
      }

      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [pesanan]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <svg className="animate-spin h-10 w-10 text-[#C4956A] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-[#6B7560] text-sm">Memuat halaman instruksi pembayaran...</p>
      </div>
    );
  }

  if (error || !pesanan) {
    return (
      <div className="text-center py-20 max-w-md mx-auto px-5">
        <span className="text-5xl block mb-4">⚠️</span>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#5C6B52] mb-3">
          Pesanan Tidak Ditemukan
        </h2>
        <p className="text-sm text-[#6B7560] mb-6">{error || "Data pesanan tidak valid."}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7A8B6F] text-white font-semibold text-sm hover:bg-[#5C6B52] transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const isExpired = timeLeft === "EXPIRED" || pesanan.status === "failed";

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 md:p-8 border border-[#EDE7DB] shadow-[0_12px_40px_rgba(45,51,40,0.04)] text-center space-y-6">
      {/* Hourglass Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 text-3xl animate-pulse">
          ⏳
        </div>
      </div>

      <div className="space-y-2">
        <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider">
          Menunggu Pembayaran
        </span>
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#5C6B52]">
          Selesaikan Pembayaran Anda
        </h2>
        <p className="text-sm text-[#6B7560] max-w-md mx-auto">
          Silakan selesaikan pembayaran sebelum batas waktu berakhir agar pemesanan Anda tidak dibatalkan otomatis.
        </p>
      </div>

      {/* Countdown Timer */}
      <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#EDE7DB]/80 inline-block px-10">
        <span className="text-xs text-[#6B7560] uppercase tracking-wider block font-semibold mb-1">
          Sisa Waktu Pembayaran
        </span>
        <span className={`text-3xl font-mono font-bold ${isExpired ? "text-[#BA1A1A]" : "text-[#C4956A]"}`}>
          {timeLeft || "--:--"}
        </span>
      </div>

      {/* Booking Details */}
      <div className="bg-[#FAF7F2] rounded-xl p-5 border border-[#EDE7DB]/80 text-left space-y-4">
        <div className="flex justify-between items-center border-b border-[#EDE7DB]/80 pb-3">
          <div>
            <span className="text-xs text-[#6B7560] uppercase font-semibold">Kode Booking</span>
            <p className="text-base font-bold text-[#7A8B6F]">{pesanan.kode_pesanan}</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold uppercase">
            PENDING
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-[#6B7560]">Nama Kamar</span>
            <p className="font-semibold text-[#2D3328]">{pesanan.kamar?.nama || "Kamar Pilihan"}</p>
          </div>
          <div>
            <span className="text-xs text-[#6B7560]">Atas Nama</span>
            <p className="font-semibold text-[#2D3328]">{pesanan.nama_lengkap}</p>
          </div>
          <div>
            <span className="text-xs text-[#6B7560]">Check-In</span>
            <p className="font-semibold text-[#2D3328]">{formatTanggal(pesanan.check_in)}</p>
          </div>
          <div>
            <span className="text-xs text-[#6B7560]">Check-Out</span>
            <p className="font-semibold text-[#2D3328]">{formatTanggal(pesanan.check_out)}</p>
          </div>
        </div>

        <div className="h-px bg-[#EDE7DB]/80 pt-1" />

        <div className="flex justify-between items-center font-bold text-[#2D3328]">
          <span>Total Pembayaran</span>
          <span className="text-[#C4956A] text-lg">{formatRupiah(pesanan.total_bayar)}</span>
        </div>
      </div>

      {/* Call to action */}
      <div className="space-y-3 pt-4">
        {!isExpired && pesanan.payment_url ? (
          <a
            href={pesanan.payment_url}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[#C4956A] hover:bg-[#D4A76A] text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg"
          >
            💳 Bayar Sekarang via Duitku
          </a>
        ) : (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-[#BA1A1A] font-semibold">
            Batas waktu pembayaran telah habis. Silakan buat pesanan baru.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border border-[#EDE7DB] text-[#5C6B52] font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Kembali ke Beranda
          </Link>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            💬 Bantuan Customer Service
          </a>
        </div>
      </div>

      <div className="text-xs text-[#6B7560] border-t border-[#EDE7DB]/60 pt-4 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        Halaman ini akan otomatis dialihkan ketika pembayaran Anda terdeteksi.
      </div>
    </div>
  );
}

export default function PendingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 md:pt-28 bg-[#F5F0E8] pb-20">
        <div className="max-w-4xl mx-auto px-5">
          <Suspense fallback={
            <div className="text-center py-20">
              <p className="text-[#6B7560] text-sm">Loading pending details...</p>
            </div>
          }>
            <PendingContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
