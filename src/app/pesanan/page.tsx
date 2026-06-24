"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatRupiah, formatTanggal } from "@/lib/utils";

export default function GuestBookingPage() {
  // Authentication states
  const [emailInput, setEmailInput] = useState("");
  const [bookingCodeInput, setBookingCodeInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState("");

  // Booking states
  const [pesanan, setPesanan] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Cancellation modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // Countdown state for payment expiry
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Auto-login from sessionStorage if available
  useEffect(() => {
    const savedEmail = sessionStorage.getItem("mbs_guest_email");
    const savedCode = sessionStorage.getItem("mbs_guest_code");

    if (savedEmail && savedCode) {
      handleVerify(savedCode, savedEmail);
    }
  }, []);

  // Countdown timer logic
  useEffect(() => {
    if (!pesanan || pesanan.status !== "waiting_payment" || !pesanan.expired_at) {
      setTimeLeft("");
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(pesanan.expired_at).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeLeft("Waktu pembayaran telah habis");
        clearInterval(timer);
        // Refresh booking details to show failed state
        refreshBookingData();
      } else {
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${String(seconds).padStart(2, "0")} menit lagi`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [pesanan]);

  // Core verification function
  const handleVerify = async (code: string, email: string) => {
    setAuthError("");
    setIsVerifying(true);

    try {
      const cleanCode = code.trim().toUpperCase();
      const cleanEmail = email.trim().toLowerCase();

      const res = await fetch(`/api/pesanan/${cleanCode}`);
      if (!res.ok) {
        throw new Error("Kode booking tidak ditemukan atau tidak valid.");
      }

      const { data } = await res.json();

      if (!data || data.email.toLowerCase().trim() !== cleanEmail) {
        throw new Error("Kombinasi Kode Booking dan Email tidak cocok.");
      }

      // Successful verification
      setPesanan(data);
      sessionStorage.setItem("mbs_guest_email", cleanEmail);
      sessionStorage.setItem("mbs_guest_code", cleanCode);
    } catch (err: any) {
      setAuthError(err.message || "Terjadi kesalahan saat mencari pesanan.");
      sessionStorage.removeItem("mbs_guest_email");
      sessionStorage.removeItem("mbs_guest_code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCodeInput || !emailInput) {
      setAuthError("Harap isi Kode Booking dan Email Anda.");
      return;
    }
    handleVerify(bookingCodeInput, emailInput);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("mbs_guest_email");
    sessionStorage.removeItem("mbs_guest_code");
    setPesanan(null);
    setEmailInput("");
    setBookingCodeInput("");
  };

  // Helper to re-fetch booking details
  const refreshBookingData = async () => {
    if (!pesanan) return;
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/pesanan/${pesanan.kode_pesanan}`);
      if (res.ok) {
        const { data } = await res.json();
        setPesanan(data);
      }
    } catch (e) {
      console.error("Failed to refresh booking:", e);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle self-service cancellation
  const handleCancelBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pesanan) return;

    setIsCancelling(true);
    setCancelError("");

    try {
      const res = await fetch(`/api/pesanan/${pesanan.id}/batal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason || "Dibatalkan mandiri oleh pemesan" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal membatalkan pemesanan.");
      }

      // Success
      setShowCancelModal(false);
      setCancelReason("");
      await refreshBookingData();
    } catch (err: any) {
      setCancelError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsCancelling(false);
    }
  };

  // Status mapping for visual stepper
  const getStepStatus = () => {
    if (!pesanan) return 0;
    switch (pesanan.status) {
      case "pending":
      case "waiting_payment":
        return 1;
      case "paid":
      case "confirmed":
        return 2;
      case "checked_in":
        return 3;
      case "completed":
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = getStepStatus();

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 md:pt-28 bg-[#F5F0E8] min-h-screen pb-20 px-5">
        <div className="max-w-4xl mx-auto">
          
          {/* STATE 1: LOGIN LOOKUP FORM */}
          {!pesanan ? (
            <div className="max-w-md mx-auto bg-white/80 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-[#EDE7DB] shadow-[0_12px_40px_rgba(45,51,40,0.04)] mt-8 md:mt-12 transition-all duration-300">
              <div className="text-center space-y-2 mb-8">
                <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#5C6B52]">
                  Lacak Pemesanan
                </h1>
                <p className="text-sm text-[#6B7560]">
                  Masukkan Kode Booking dan Email Anda untuk melacak, membayar, atau mengelola masa inap Anda.
                </p>
              </div>

              {authError && (
                <div className="p-4 mb-6 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium">
                  ⚠️ {authError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="bookingCode" className="text-xs uppercase tracking-wider font-bold text-[#5C6B52]">
                    Kode Booking
                  </label>
                  <input
                    type="text"
                    id="bookingCode"
                    placeholder="Contoh: MBS-20260624-ABCD"
                    value={bookingCodeInput}
                    onChange={(e) => setBookingCodeInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#EDE7DB] bg-[#FAF7F2] text-[#2D3328] focus:outline-none focus:ring-2 focus:ring-[#7A8B6F] focus:border-transparent transition-all placeholder:text-gray-400 font-mono"
                    disabled={isVerifying}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs uppercase tracking-wider font-bold text-[#5C6B52]">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Email yang digunakan saat memesan"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#EDE7DB] bg-[#FAF7F2] text-[#2D3328] focus:outline-none focus:ring-2 focus:ring-[#7A8B6F] focus:border-transparent transition-all placeholder:text-gray-400"
                    disabled={isVerifying}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#7A8B6F] hover:bg-[#5C6B52] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:bg-[#7A8B6F]"
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Memverifikasi...
                    </>
                  ) : (
                    "Cari Pemesanan"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center border-t border-[#EDE7DB] pt-5">
                <p className="text-xs text-[#6B7560]">
                  Lupa atau Kehilangan Kode Booking?
                </p>
                <p className="text-xs text-[#6B7560] mt-1">
                  Silakan periksa kotak masuk email Anda, atau hubungi kami melalui{" "}
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20MerbabuStay,%20saya%20lupa%20kode%20booking%20saya.%20Mohon%20bantuannya."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7A8B6F] hover:text-[#5C6B52] font-semibold underline transition-colors"
                  >
                    WhatsApp Admin
                  </a>{" "}
                  untuk bantuan cepat.
                </p>
              </div>
            </div>
          ) : (
            
            // STATE 2: LIVE GUEST DASHBOARD
            <div className="space-y-6 animate-fadeIn mt-4">
              
              {/* Header Panel */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md border border-[#EDE7DB] rounded-2xl p-5 md:p-6 shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs text-[#6B7560] uppercase font-semibold tracking-wider">Lacak & Kelola Pemesanan</span>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-[#5C6B52] font-mono">{pesanan.kode_pesanan}</h1>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(pesanan.kode_pesanan);
                        alert("Kode booking disalin ke clipboard!");
                      }}
                      className="text-xs px-2.5 py-1 rounded bg-[#EDE7DB] hover:bg-[#A8B89E]/20 text-[#5C6B52] font-semibold transition-colors"
                      title="Salin Kode Booking"
                    >
                      📋 Salin
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={refreshBookingData}
                    className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EDE7DB] border border-[#EDE7DB] text-[#5C6B52] font-semibold rounded-xl text-sm transition-all flex items-center gap-1.5"
                    disabled={loadingDetails}
                  >
                    🔄 Refresh Status
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-white hover:bg-red-50 border border-red-100 text-red-600 font-semibold rounded-xl text-sm transition-all"
                  >
                    Keluar Portal
                  </button>
                </div>
              </div>

              {/* Status Alert Banner */}
              {pesanan.status === "cancelled" && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-red-800 space-y-1">
                  <h3 className="font-bold text-lg flex items-center gap-2">✕ Pemesanan Dibatalkan</h3>
                  <p className="text-sm">
                    Pemesanan ini telah dibatalkan pada {formatTanggal(pesanan.cancelled_at || new Date().toISOString())}.
                  </p>
                  {pesanan.cancelled_reason && (
                    <p className="text-sm italic mt-2 bg-red-100/50 p-2.5 rounded-lg border border-red-100/80">
                      Alasan: "{pesanan.cancelled_reason}"
                    </p>
                  )}
                </div>
              )}

              {pesanan.status === "failed" && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-red-800 space-y-1">
                  <h3 className="font-bold text-lg flex items-center gap-2">⚠️ Transaksi Gagal / Kadaluwarsa</h3>
                  <p className="text-sm">
                    Masa waktu pembayaran 30 menit Anda telah habis atau transaksi dibatalkan oleh gateway pembayaran. Silakan lakukan pemesanan ulang.
                  </p>
                </div>
              )}

              {/* Visual Stepper Status Bar (Only shown for active statuses) */}
              {pesanan.status !== "cancelled" && pesanan.status !== "failed" && (
                <div className="bg-white border border-[#EDE7DB] rounded-2xl p-6 md:p-8 shadow-sm">
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#5C6B52] mb-8 text-center sm:text-left">
                    Status Pemesanan Anda
                  </h3>
                  
                  {/* Stepper container */}
                  <div className="relative flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-2">
                    
                    {/* Horizontal Line behind steps (Only on desktop) */}
                    <div className="absolute top-6 left-[10%] right-[10%] h-0.5 bg-gray-200 -z-10 hidden sm:block">
                      <div
                        className="h-full bg-[#7A8B6F] transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                      />
                    </div>

                    {/* Step 1: Dibuat */}
                    <div className="flex sm:flex-col items-center gap-4 sm:gap-2 w-full sm:w-1/5 text-left sm:text-center">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all bg-[#7A8B6F] border-[#7A8B6F] text-white shadow-md">
                        ✓
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-[#2D3328]">Pemesanan Dibuat</p>
                        <p className="text-xs text-[#6B7560]">Tercatat di sistem</p>
                      </div>
                    </div>

                    {/* Step 2: Pembayaran */}
                    <div className="flex sm:flex-col items-center gap-4 sm:gap-2 w-full sm:w-1/5 text-left sm:text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                        currentStep >= 1 ? "bg-[#7A8B6F] border-[#7A8B6F] text-white shadow-md" : "bg-white border-gray-300 text-gray-400"
                      }`}>
                        {currentStep > 1 ? "✓" : "2"}
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-sm font-bold ${currentStep >= 1 ? "text-[#2D3328]" : "text-gray-400"}`}>Pembayaran</p>
                        <p className="text-xs text-[#6B7560]">
                          {pesanan.status === "waiting_payment" ? "Menunggu dana" : "Sudah terverifikasi"}
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Dikonfirmasi */}
                    <div className="flex sm:flex-col items-center gap-4 sm:gap-2 w-full sm:w-1/5 text-left sm:text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                        currentStep >= 2 ? "bg-[#7A8B6F] border-[#7A8B6F] text-white shadow-md" : "bg-white border-gray-300 text-gray-400"
                      }`}>
                        {currentStep > 2 ? "✓" : "3"}
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-sm font-bold ${currentStep >= 2 ? "text-[#2D3328]" : "text-gray-400"}`}>Dikonfirmasi</p>
                        <p className="text-xs text-[#6B7560]">
                          {currentStep >= 2 ? "Kamar siap disewa" : "Menunggu verifikasi"}
                        </p>
                      </div>
                    </div>

                    {/* Step 4: Check-In */}
                    <div className="flex sm:flex-col items-center gap-4 sm:gap-2 w-full sm:w-1/5 text-left sm:text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                        currentStep >= 3 ? "bg-[#7A8B6F] border-[#7A8B6F] text-white shadow-md" : "bg-white border-gray-300 text-gray-400"
                      }`}>
                        {currentStep > 3 ? "✓" : "4"}
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-sm font-bold ${currentStep >= 3 ? "text-[#2D3328]" : "text-gray-400"}`}>Check-in</p>
                        <p className="text-xs text-[#6B7560]">
                          {pesanan.status === "checked_in" ? "Tamu sedang menginap" : "Tiba di lokasi"}
                        </p>
                      </div>
                    </div>

                    {/* Step 5: Selesai */}
                    <div className="flex sm:flex-col items-center gap-4 sm:gap-2 w-full sm:w-1/5 text-left sm:text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                        currentStep >= 4 ? "bg-[#7A8B6F] border-[#7A8B6F] text-white shadow-md" : "bg-white border-gray-300 text-gray-400"
                      }`}>
                        {currentStep > 4 ? "✓" : "5"}
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-sm font-bold ${currentStep >= 4 ? "text-[#2D3328]" : "text-gray-400"}`}>Selesai</p>
                        <p className="text-xs text-[#6B7560]">Masa inap selesai</p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Main Content Split Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1 & 2: Room details, dates, and information */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Homestay Details Card */}
                  <div className="bg-white border border-[#EDE7DB] rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
                    <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#5C6B52] border-b border-[#EDE7DB] pb-3">
                      Detail Penginapan
                    </h3>

                    {pesanan.kamar && (
                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        {pesanan.kamar.foto_utama && (
                          <img
                            src={pesanan.kamar.foto_utama}
                            alt={pesanan.kamar.nama}
                            className="w-full sm:w-32 h-24 object-cover rounded-xl border border-[#EDE7DB]"
                          />
                        )}
                        <div className="space-y-1">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#5C6B52]/10 text-[#5C6B52] text-xs font-bold capitalize">
                            Tipe {pesanan.kamar.tipe}
                          </span>
                          <h4 className="font-bold text-lg text-[#2D3328]">{pesanan.kamar.nama}</h4>
                          <p className="text-sm text-[#6B7560] line-clamp-2">
                            {pesanan.kamar.deskripsi_singkat || "Kamar homestay premium di kaki Gunung Merbabu."}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#EDE7DB] text-sm">
                      <div>
                        <span className="text-xs uppercase tracking-wider font-bold text-[#6B7560] block mb-1">Check-In</span>
                        <p className="font-semibold text-[#2D3328]">{formatTanggal(pesanan.check_in)}</p>
                        <span className="text-xs text-[#6B7560]">Mulai Pkl 14.00 WIB</span>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wider font-bold text-[#6B7560] block mb-1">Check-Out</span>
                        <p className="font-semibold text-[#2D3328]">{formatTanggal(pesanan.check_out)}</p>
                        <span className="text-xs text-[#6B7560]">Sebelum Pkl 12.00 WIB</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EDE7DB]/60 text-center text-sm">
                      <div>
                        <span className="text-xs text-[#6B7560] block">Durasi</span>
                        <span className="font-bold text-[#5C6B52]">{pesanan.jumlah_malam} Malam</span>
                      </div>
                      <div>
                        <span className="text-xs text-[#6B7560] block">Jumlah Tamu</span>
                        <span className="font-bold text-[#5C6B52]">{pesanan.jumlah_tamu} Orang</span>
                      </div>
                      <div>
                        <span className="text-xs text-[#6B7560] block">Jenis Kasur</span>
                        <span className="font-bold text-[#5C6B52] capitalize">{pesanan.kamar?.tipe_bed || "Queen"} Bed</span>
                      </div>
                    </div>
                  </div>

                  {/* Guest Information Card */}
                  <div className="bg-white border border-[#EDE7DB] rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                    <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#5C6B52] border-b border-[#EDE7DB] pb-3">
                      Informasi Pemesan
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-xs text-[#6B7560] block">Nama Lengkap</span>
                        <span className="font-semibold text-[#2D3328]">{pesanan.nama_lengkap}</span>
                      </div>
                      <div>
                        <span className="text-xs text-[#6B7560] block">Nomor HP / WhatsApp</span>
                        <span className="font-semibold text-[#2D3328] font-mono">{pesanan.no_hp}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-xs text-[#6B7560] block">Alamat Email</span>
                        <span className="font-semibold text-[#2D3328]">{pesanan.email}</span>
                      </div>
                      {pesanan.catatan && (
                        <div className="sm:col-span-2 bg-[#FAF7F2] p-3 rounded-lg border border-[#EDE7DB]/50">
                          <span className="text-xs text-[#6B7560] block font-semibold mb-0.5">Catatan Khusus:</span>
                          <p className="text-[#2D3328] italic">"{pesanan.catatan}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 3: Payment Breakdown & Actions */}
                <div className="space-y-6">
                  
                  {/* Payment Details Card */}
                  <div className="bg-white border border-[#EDE7DB] rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
                    <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#5C6B52] border-b border-[#EDE7DB] pb-3">
                      Rincian Pembayaran
                    </h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-[#6B7560]">
                        <span>Tarif Kamar ({pesanan.jumlah_malam}x)</span>
                        <span>{formatRupiah(pesanan.total_harga)}</span>
                      </div>
                      {pesanan.diskon > 0 && (
                        <div className="flex justify-between text-emerald-600 font-semibold">
                          <span>Diskon Promo</span>
                          <span>-{formatRupiah(pesanan.diskon)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-bold text-[#2D3328] border-t border-[#EDE7DB] pt-3 mt-1">
                        <span>Total Bayar</span>
                        <span className="text-[#5C6B52]">{formatRupiah(pesanan.total_bayar)}</span>
                      </div>
                    </div>

                    {/* Method details if paid */}
                    {(pesanan.status === "paid" || pesanan.status === "confirmed") && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center text-sm text-emerald-800 space-y-1">
                        <span className="font-bold block">✓ LUNAS</span>
                        <span className="text-xs text-emerald-700 block">
                          Metode: {pesanan.payment_method_name || pesanan.payment_method || "Duitku Gateway"}
                        </span>
                        {pesanan.paid_at && (
                          <span className="text-[11px] text-emerald-600 block">
                            Diterima: {formatTanggal(pesanan.paid_at)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* ACTION PANEL: WAITING FOR PAYMENT (Show Duitku Button & Countdown) */}
                    {pesanan.status === "waiting_payment" && (
                      <div className="space-y-4 pt-2 border-t border-[#EDE7DB]">
                        
                        {timeLeft && (
                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center space-y-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block">
                              Selesaikan Pembayaran
                            </span>
                            <span className="font-mono text-base font-extrabold text-amber-900 block animate-pulse">
                              ⏳ {timeLeft}
                            </span>
                          </div>
                        )}

                        {pesanan.payment_url && (
                          <a
                            href={pesanan.payment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3.5 bg-[#D4A76A] hover:bg-[#C4956A] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-center block text-sm"
                          >
                            💳 Bayar Sekarang (Duitku)
                          </a>
                        )}
                      </div>
                    )}

                    {/* SELF SERVICE CANCELLATION TRIGGER */}
                    {(pesanan.status === "pending" || pesanan.status === "waiting_payment") && (
                      <div className="pt-2 border-t border-[#EDE7DB]">
                        <button
                          onClick={() => setShowCancelModal(true)}
                          className="w-full py-2.5 border border-red-100 bg-red-50 hover:bg-red-100/70 text-red-600 font-semibold rounded-xl text-xs transition-colors"
                        >
                          ✕ Batalkan Pemesanan Ini
                        </button>
                      </div>
                    )}

                  </div>

                  {/* Need Help Box */}
                  <div className="bg-[#FAF7F2] border border-[#EDE7DB] rounded-2xl p-5 text-sm space-y-2 text-left">
                    <h4 className="font-bold text-[#5C6B52]">Butuh Bantuan?</h4>
                    <p className="text-xs text-[#6B7560]">
                      Ada kendala pada pembayaran, perubahan tanggal inap, atau permintaan khusus lainnya? Hubungi admin MerbabuStay.
                    </p>
                    <a
                      href="https://wa.me/6281234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A8B6F] hover:text-[#5C6B52] transition-colors"
                    >
                      💬 WhatsApp Customer Service ➡️
                    </a>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* CANCELLATION MODAL */}
          {showCancelModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#EDE7DB] shadow-2xl space-y-5 animate-scaleUp">
                
                <div className="space-y-1">
                  <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#2D3328]">
                    Batalkan Pemesanan?
                  </h3>
                  <p className="text-xs text-[#6B7560]">
                    Pemesanan {pesanan?.kode_pesanan} akan dibatalkan secara permanen. Kamar akan dibuka kembali untuk dipesan orang lain.
                  </p>
                </div>

                {cancelError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-medium">
                    ⚠️ {cancelError}
                  </div>
                )}

                <form onSubmit={handleCancelBooking} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="reason" className="text-xs font-bold uppercase tracking-wider text-[#5C6B52] block">
                      Alasan Pembatalan
                    </label>
                    <textarea
                      id="reason"
                      rows={3}
                      placeholder="Masukkan alasan Anda membatalkan pemesanan (opsional)..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#EDE7DB] bg-[#FAF7F2] text-[#2D3328] focus:outline-none focus:ring-2 focus:ring-[#7A8B6F] focus:border-transparent transition-all placeholder:text-gray-400 text-sm"
                      disabled={isCancelling}
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-2 text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCancelModal(false);
                        setCancelReason("");
                        setCancelError("");
                      }}
                      className="px-4 py-2 border border-[#EDE7DB] text-[#5C6B52] font-semibold rounded-xl hover:bg-[#FAF7F2] transition-colors"
                      disabled={isCancelling}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-70"
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Membatalkan...
                        </>
                      ) : (
                        "Ya, Batalkan Pesanan"
                      )}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
