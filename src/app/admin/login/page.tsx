"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const isLogged = localStorage.getItem("mbs_admin_logged");
    if (isLogged === "true") {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const { supabase } = await import("@/lib/supabase");

      // Sign in with Supabase Auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Fallback check: Allow MBS admin login if DB connection is empty or simulated
        if (
          (email === "saidqony@gmail.com" && password === "saidqonyadmin321") ||
          (email === "admin@merbabustay.com" && password === "merbabu123")
        ) {
          // Store simulated admin token
          localStorage.setItem("mbs_admin_logged", "true");
          router.push("/admin/dashboard");
        } else {
          setErrorMsg(error.message || "Email atau password salah.");
        }
      } else {
        localStorage.setItem("mbs_admin_logged", "true");
        router.push("/admin/dashboard");
      }
    } catch (err) {
      // Fallback check
      if (
        (email === "saidqony@gmail.com" && password === "saidqonyadmin321") ||
        (email === "admin@merbabustay.com" && password === "merbabu123")
      ) {
        localStorage.setItem("mbs_admin_logged", "true");
        router.push("/admin/dashboard");
      } else {
        setErrorMsg("Koneksi gagal. Silakan gunakan kredensial admin Anda.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-5 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#EDE7DB] shadow-lg p-6 md:p-8 space-y-6">
        <div className="text-center">
          <span className="text-4xl block mb-2">🌿</span>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-[#5C6B52]">
            Admin MerbabuStay
          </h1>
          <p className="text-xs text-[#6B7560] mt-1">
            Masuk ke panel manajemen homestay Anda
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs text-[#BA1A1A] font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2D3328] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@merbabustay.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] outline-none focus:border-[#7A8B6F] focus:ring-1 focus:ring-[#7A8B6F]/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2D3328] uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] outline-none focus:border-[#7A8B6F] focus:ring-1 focus:ring-[#7A8B6F]/30 transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#7A8B6F] hover:bg-[#5C6B52] disabled:bg-gray-200 text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Menghubungkan...
                </>
              ) : (
                "Masuk ke Dashboard"
              )}
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-[#EDE7DB] text-center">
          <p className="text-[10px] text-[#8C9A86] italic">
            Panel dilindungi enkripsi SSL aman.
          </p>
        </div>
      </div>
    </main>
  );
}
