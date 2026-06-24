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
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Recalculate nights, total price, and check availability on date change
  useEffect(() => {
    if (!checkIn || !checkOut) return;

    const ciDate = new Date(checkIn);
    const coDate = new Date(checkOut);

    if (coDate <= ciDate) {
      setErrorMsg("Tanggal keluar harus setelah tanggal masuk.");
      setMalamCount(0);
      setIsAvailable(null);
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

    // Perform real-time background availability check
    let isMounted = true;
    const checkBgAvailability = async () => {
      setIsChecking(true);
      try {
        const res = await fetch("/api/kamar/cek-ketersediaan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kamar_id: kamarId, check_in: checkIn, check_out: checkOut }),
        });
        const data = await res.json();
        
        if (isMounted) {
          if (res.ok) {
            setIsAvailable(data.available);
            if (!data.available) {
              setErrorMsg("Maaf, seluruh unit tipe kamar ini sudah penuh pada tanggal tersebut.");
            } else {
              setErrorMsg("");
            }
          } else {
            setIsAvailable(true); // Fallback to true if API fails
          }
        }
      } catch (err) {
        console.error("Failed background availability check:", err);
        if (isMounted) setIsAvailable(true);
      } finally {
        if (isMounted) setIsChecking(false);
      }
    };

    checkBgAvailability();

    return () => {
      isMounted = false;
    };
  }, [checkIn, checkOut, hargaPerMalam, hargaWeekend, kamarId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (malamCount <= 0 || errorMsg || isAvailable === false) return;

    setIsChecking(true);
    
    try {
      // API check availability (double check)
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
        setIsAvailable(false);
        setErrorMsg("Maaf, seluruh unit tipe kamar ini sudah penuh pada tanggal tersebut.");
      }
    } catch (err) {
      // If API fails, proceed to checkout (will validate there anyway)
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

        {/* Error / Sold Out message */}
        {errorMsg && (
          <div className={`p-4 rounded-xl border text-xs font-semibold flex items-start gap-2.5 transition-all ${
            isAvailable === false 
              ? "bg-red-50/80 border-red-200/60 text-red-800 backdrop-blur-sm" 
              : "bg-amber-50/80 border-amber-200/60 text-amber-800"
          }`}>
            <span className="text-sm mt-0.5">{isAvailable === false ? "🚫" : "⚠️"}</span>
            <div>
              <p className="font-bold mb-0.5">{isAvailable === false ? "Kamar Penuh / Habis" : "Perhatian"}</p>
              <p className="opacity-90 leading-relaxed">{errorMsg}</p>
            </div>
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
          disabled={malamCount <= 0 || (!!errorMsg && isAvailable === false) || isChecking}
          className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
            isAvailable === false
              ? "bg-gray-300 hover:bg-gray-300 text-gray-500 cursor-not-allowed shadow-none hover:shadow-none"
              : "bg-[#C4956A] hover:bg-[#D4A76A] text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          }`}
        >
          {isChecking ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Memeriksa...
            </>
          ) : isAvailable === false ? (
            "Sudah Penuh Dipesan 🚫"
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
