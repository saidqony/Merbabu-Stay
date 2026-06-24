"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatRupiah, formatTanggal } from "@/lib/utils";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "";
  
  const [loading, setLoading] = useState(true);
  const [pesanan, setPesanan] = useState<any>(null);
  const [error, setError] = useState("");

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
  }, [orderId]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <svg className="animate-spin h-10 w-10 text-emerald-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-[#6B7560] text-sm">Memuat informasi reservasi...</p>
      </div>
    );
  }

  if (error || !pesanan) {
    return (
      <div className="text-center py-20 max-w-md mx-auto px-5">
        <span className="text-5xl block mb-4">⚠️</span>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#5C6B52] mb-3">
          Detail Pesanan Tidak Ditemukan
        </h2>
        <p className="text-sm text-[#6B7560] mb-6">
          {error || "Maaf, reservasi dengan kode tersebut tidak dapat kami temukan di sistem."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7A8B6F] text-white font-semibold text-sm hover:bg-[#5C6B52] transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 md:p-8 border border-[#EDE7DB] shadow-[0_12px_40px_rgba(45,51,40,0.04)] text-center space-y-6">
      {/* Animated Checkmark */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-4xl animate-bounce">
          ✓
        </div>
      </div>

      <div className="space-y-2">
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
          Pembayaran Sukses
        </span>
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#5C6B52]">
          Terima Kasih atas Pemesanan Anda!
        </h2>
        <p className="text-sm text-[#6B7560] max-w-md mx-auto">
          Pembayaran Anda telah berhasil kami terima. Email invoice konfirmasi telah dikirimkan ke alamat email Anda.
        </p>
      </div>

      {/* Invoice details */}
      <div className="bg-[#FAF7F2] rounded-xl p-5 border border-[#EDE7DB]/80 text-left space-y-4">
        <div className="flex justify-between items-center border-b border-[#EDE7DB]/80 pb-3">
          <div>
            <span className="text-xs text-[#6B7560] uppercase font-semibold">Kode Booking</span>
            <p className="text-base font-bold text-[#7A8B6F]">{pesanan.kode_pesanan}</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold uppercase">
            PAID
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-[#6B7560]">Nama Homestay</span>
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
          <div>
            <span className="text-xs text-[#6B7560]">Durasi / Tamu</span>
            <p className="font-semibold text-[#2D3328]">
              {pesanan.jumlah_malam} malam / {pesanan.jumlah_tamu} tamu
            </p>
          </div>
          <div>
            <span className="text-xs text-[#6B7560]">Metode Bayar</span>
            <p className="font-semibold text-[#2D3328]">{pesanan.payment_method_name || "Duitku"}</p>
          </div>
        </div>

        <div className="h-px bg-[#EDE7DB]/80 pt-1" />
        
        <div className="flex justify-between items-center font-bold text-[#2D3328]">
          <span>Total Pembayaran</span>
          <span className="text-[#C4956A] text-lg">{formatRupiah(pesanan.total_bayar)}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 rounded-xl border border-[#EDE7DB] text-[#5C6B52] font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          🖨️ Cetak Invoice
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-[#7A8B6F] hover:bg-[#5C6B52] text-white font-semibold text-sm transition-colors shadow-md hover:shadow-lg"
        >
          Kembali ke Beranda
        </Link>
      </div>

      <p className="text-xs text-[#6B7560]">
        Butuh bantuan darurat? Hubungi kami via WhatsApp di +62 812-3456-7890
      </p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 md:pt-28 bg-[#F5F0E8] pb-20">
        <div className="max-w-4xl mx-auto px-5">
          <Suspense fallback={
            <div className="text-center py-20">
              <p className="text-[#6B7560] text-sm">Loading success details...</p>
            </div>
          }>
            <SuccessContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
