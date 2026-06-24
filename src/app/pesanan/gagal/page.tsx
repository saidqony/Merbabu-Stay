"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function FailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "";

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 md:p-8 border border-[#EDE7DB] shadow-[0_12px_40px_rgba(45,51,40,0.04)] text-center space-y-6">
      {/* Red Cross Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 text-4xl animate-pulse">
          ✕
        </div>
      </div>

      <div className="space-y-2">
        <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider">
          Pembayaran Gagal / Kadaluwarsa
        </span>
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#5C6B52]">
          Pemesanan Tidak Berhasil
        </h2>
        <p className="text-sm text-[#6B7560] max-w-md mx-auto">
          Maaf, proses pembayaran Anda tidak berhasil diselesaikan atau batas waktu 30 menit pembayaran telah habis.
        </p>
      </div>

      {orderId && (
        <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#EDE7DB]/80 inline-block px-8 text-sm">
          <span className="text-xs text-[#6B7560] uppercase font-semibold block mb-1">Kode booking terkait</span>
          <span className="font-mono font-bold text-[#2D3328]">{orderId}</span>
        </div>
      )}

      {/* Suggestion list */}
      <div className="bg-[#FAF7F2] rounded-xl p-5 border border-[#EDE7DB]/80 text-left space-y-3 max-w-md mx-auto text-sm">
        <h4 className="font-bold text-[#5C6B52] mb-1">Apa yang bisa Anda lakukan?</h4>
        <ul className="list-disc pl-5 space-y-1 text-[#6B7560]">
          <li>Silakan lakukan pemesanan ulang dengan memilih tanggal kembali.</li>
          <li>Pastikan saldo Anda mencukupi dan koneksi internet stabil saat bertransaksi.</li>
          <li>Hubungi pihak Bank atau e-Wallet jika saldo Anda terpotong namun booking gagal.</li>
        </ul>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Link
          href="/#kamar"
          className="px-6 py-3 rounded-xl bg-[#7A8B6F] hover:bg-[#5C6B52] text-white font-semibold text-sm transition-colors shadow-md hover:shadow-lg"
        >
          Coba Booking Lagi
        </Link>
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-xl border border-[#EDE7DB] text-[#5C6B52] font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          💬 Hubungi Customer Service
        </a>
      </div>
    </div>
  );
}

export default function FailedPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 md:pt-28 bg-[#F5F0E8] pb-20">
        <div className="max-w-4xl mx-auto px-5">
          <Suspense fallback={
            <div className="text-center py-20">
              <p className="text-[#6B7560] text-sm">Loading failed details...</p>
            </div>
          }>
            <FailedContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
