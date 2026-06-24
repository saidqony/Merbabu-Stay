"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah, hitungMalam } from "@/lib/utils";

interface BookingWidgetProps {
  kamarId: string;
  hargaPerMalam: number;
  hargaWeekend: number | null;
  kapasitasTamu: number;
}

export default function BookingWidget({
  kamarId,
  hargaPerMalam,
  hargaWeekend,
  kapasitasTamu,
}: BookingWidgetProps) {
  const router = useRouter();
  
  // Default check-in tomorrow, check-out day after tomorrow
  const getTomorrowStr = (offset = 1) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split("T")[0];
  };

  const [checkIn, setCheckIn] = useState(getTomorrowStr(1));
  const [checkOut, setCheckOut] = useState(getTomorrowStr(2));
  const [jumlahTamu, setJumlahTamu] = useState(2);
  const [malamCount, setMalamCount] = useState(1);
  const [totalHarga, setTotalHarga] = useState(hargaPerMalam);
  const [errorMsg, setErrorMsg] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  // Recalculate nights and total price on date change
  useEffect(() => {
    if (!checkIn || !checkOut) return;

    const ciDate = new Date(checkIn);
    const coDate = new Date(checkOut);

    if (coDate <= ciDate) {
      setErrorMsg("Tanggal keluar harus setelah tanggal masuk.");
      setMalamCount(0);
      return;
    }

    setErrorMsg("");
    const nights = hitungMalam(checkIn, checkOut);
    setMalamCount(nights);

    // Dynamic weekend price logic if applicable
    let calculatedTotal = 0;
    const tempDate = new Date(ciDate);
    
    for (let i = 0; i < nights; i++) {
      const day = tempDate.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = day === 5 || day === 6; // Friday & Saturday nights
      const rate = (isWeekend && hargaWeekend) ? hargaWeekend : hargaPerMalam;
      calculatedTotal += rate;
      tempDate.setDate(tempDate.getDate() + 1);
    }

    setTotalHarga(calculatedTotal);
  }, [checkIn, checkOut, hargaPerMalam, hargaWeekend]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (malamCount <= 0 || errorMsg) return;

    setIsChecking(true);
    
    try {
      // API check availability
      const res = await fetch("/api/kamar/cek-ketersediaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kamar_id: kamarId, check_in: checkIn, check_out: checkOut }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.available) {
        // Navigate to checkout page with params
        router.push(
          `/checkout?kamar_id=${kamarId}&check_in=${checkIn}&check_out=${checkOut}&tamu=${jumlahTamu}`
        );
      } else {
        setErrorMsg("Maaf, kamar tidak tersedia pada tanggal yang Anda pilih.");
      }
    } catch (err) {
      // If API fails or not ready yet, proceed to checkout (will validate there anyway)
      router.push(
        `/checkout?kamar_id=${kamarId}&check_in=${checkIn}&check_out=${checkOut}&tamu=${jumlahTamu}`
      );
    } finally {
      setIsChecking(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#EDE7DB] shadow-[0_12px_40px_rgba(45,51,40,0.06)] sticky top-24">
      {/* Price Header */}
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-2xl font-bold text-[#C4956A]">
          {formatRupiah(hargaPerMalam)}
        </span>
        <span className="text-sm text-[#6B7560]">/ malam</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#6B7560] uppercase tracking-wider mb-1.5">
              Check-In
            </label>
            <input
              type="date"
              min={todayStr}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] font-medium outline-none focus:border-[#7A8B6F] focus:ring-1 focus:ring-[#7A8B6F]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7560] uppercase tracking-wider mb-1.5">
              Check-Out
            </label>
            <input
              type="date"
              min={checkIn || todayStr}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] font-medium outline-none focus:border-[#7A8B6F] focus:ring-1 focus:ring-[#7A8B6F]/30"
            />
          </div>
        </div>

        {/* Guests Select */}
        <div>
          <label className="block text-xs font-semibold text-[#6B7560] uppercase tracking-wider mb-1.5">
            Tamu
          </label>
          <select
            value={jumlahTamu}
            onChange={(e) => setJumlahTamu(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] font-medium outline-none focus:border-[#7A8B6F] focus:ring-1 focus:ring-[#7A8B6F]/30 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236B7560%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_10px_center] bg-no-repeat"
          >
            {Array.from({ length: kapasitasTamu }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} Tamu
              </option>
            ))}
          </select>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-[#BA1A1A] font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Price Breakdown */}
        {malamCount > 0 && !errorMsg && (
          <div className="pt-4 border-t border-[#EDE7DB] space-y-2.5 text-sm">
            <div className="flex justify-between text-[#6B7560]">
              <span>
                {formatRupiah(malamCount > 0 ? totalHarga / malamCount : hargaPerMalam)} x {malamCount} malam
              </span>
              <span>{formatRupiah(totalHarga)}</span>
            </div>
            <div className="flex justify-between text-[#6B7560]">
              <span>Biaya Pelayanan</span>
              <span className="text-emerald-600 font-medium">GRATIS</span>
            </div>
            <div className="h-px bg-[#EDE7DB]/80 my-1" />
            <div className="flex justify-between font-bold text-[#2D3328] text-base">
              <span>Total Bayar</span>
              <span>{formatRupiah(totalHarga)}</span>
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={malamCount <= 0 || !!errorMsg || isChecking}
          className="w-full py-3.5 rounded-xl bg-[#C4956A] hover:bg-[#D4A76A] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold text-base transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          {isChecking ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Memeriksa...
            </>
          ) : (
            "Pesan Sekarang"
          )}
        </button>
      </form>
      
      <p className="text-center text-xs text-[#6B7560] mt-4">
        Pembayaran instan dan aman via Duitku
      </p>
    </div>
  );
}
