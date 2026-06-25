"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah, formatTanggalShort } from "@/lib/utils";

export default function AdminDashboardPage() {
  const router = useRouter();
  
  // Tabs: "bookings" | "rooms" | "reports"
  const [activeTab, setActiveTab] = useState<"bookings" | "rooms" | "reports">("bookings");

  // Reports States
  const [reportMonth, setReportMonth] = useState<number>(new Date().getMonth() + 1); // 1-12
  const [reportYear, setReportYear] = useState<number>(new Date().getFullYear());
  const [reportData, setReportData] = useState<any | null>(null);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);
  const [triggeringAlerts, setTriggeringAlerts] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string>("");

  // Loading States
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Bookings States
  const [pesananList, setPesananList] = useState<any[]>([]);
  const [searchBooking, setSearchBooking] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Rooms (CMS) States
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [searchRoom, setSearchRoom] = useState("");
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);
  const [migrating, setMigrating] = useState(false);

  // File Upload and Drag & Drop States
  const [dragActive, setDragActive] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Form State for Room CMS CRUD
  const [roomForm, setRoomForm] = useState({
    id: "", // empty for Create
    nama: "",
    slug: "",
    deskripsi: "",
    deskripsi_singkat: "",
    tipe: "standard",
    kapasitas_tamu: 2,
    jumlah_bed: 1,
    tipe_bed: "double",
    harga_per_malam: 300000,
    harga_weekend: 350000,
    foto_utama: "",
    is_active: true,
    is_popular: false,
    fasilitas: [] as string[],
    jumlah_kamar: 1,
  });

  const availableFacilities = [
    { value: "wifi", label: "WiFi 🌐" },
    { value: "tv", label: "TV 📺" },
    { value: "smart_tv", label: "Smart TV 🖥️" },
    { value: "ac", label: "AC ❄️" },
    { value: "water_heater", label: "Water Heater 🚿" },
    { value: "breakfast", label: "Breakfast 🍳" },
    { value: "mountain_view", label: "Mountain View 🏔️" },
    { value: "balcony", label: "Balcony 🌅" },
    { value: "minibar", label: "Minibar 🍹" },
    { value: "bathtub", label: "Bathtub 🛁" },
    { value: "gazebo", label: "Gazebo 🛖" },
    { value: "garden", label: "Garden 🏡" },
    { value: "kitchen", label: "Kitchen 🍳" },
    { value: "parking", label: "Parking 🚗" },
    { value: "bbq", label: "BBQ Grill 🍖" },
  ];

  // 1. Auth Guard & Initial Fetch
  useEffect(() => {
    const isLogged = localStorage.getItem("mbs_admin_logged");
    if (!isLogged) {
      router.push("/admin/login");
      return;
    }

    async function fetchInitialData() {
      setLoading(true);
      try {
        const { supabase } = await import("@/lib/supabase");
        
        // Fetch Bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("pesanan")
          .select("*, kamar(*)")
          .order("created_at", { ascending: false });

        if (bookingsData && !bookingsError) {
          // Normalize status field for frontend compatibility
          const normalized = bookingsData.map((b: any) => ({
            ...b,
            status: b.status || b.status_pembayaran || "pending",
          }));
          setPesananList(normalized);
        } else {
          setPesananList(getMockPesanan());
        }

        // Fetch Rooms
        const { data: roomsData, error: roomsError } = await supabase
          .from("kamar")
          .select("*")
          .order("created_at", { ascending: false });

        if (roomsData && !roomsError) {
          setRoomsList(roomsData);
        } else {
          setRoomsList(getMockRooms());
        }
      } catch (err) {
        setPesananList(getMockPesanan());
        setRoomsList(getMockRooms());
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("mbs_admin_logged");
    router.push("/admin/login");
  };

  // Re-fetch rooms helper
  const refreshRooms = async () => {
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data, error } = await supabase
        .from("kamar")
        .select("*")
        .order("created_at", { ascending: false });
      if (data && !error) {
        setRoomsList(data);
      }
    } catch (err) {
      console.error("Failed to refresh rooms:", err);
    }
  };

  // Re-fetch bookings helper
  const refreshBookings = async () => {
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data, error } = await supabase
        .from("pesanan")
        .select("*, kamar(*)")
        .order("created_at", { ascending: false });
      if (data && !error) {
        // Normalize status field for frontend compatibility
        const normalized = data.map((b: any) => ({
          ...b,
          status: b.status || b.status_pembayaran || "pending",
        }));
        setPesananList(normalized);
      }
    } catch (err) {
      console.error("Failed to refresh bookings:", err);
    }
  };

  const fetchMonthlyReport = async (m: number, y: number) => {
    setLoadingReport(true);
    setReportError("");
    try {
      const res = await fetch(`/api/admin/cron/laporan-bulanan?secret=test_secret_bypass&month=${m}&year=${y}&only_data=true`);
      const data = await res.json();
      if (data.success) {
        setReportData(data);
      } else {
        setReportError(data.message || "Gagal memuat data laporan.");
      }
    } catch (err: any) {
      setReportError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    if (activeTab === "reports" && !reportData && !loadingReport) {
      fetchMonthlyReport(reportMonth, reportYear);
    }
  }, [activeTab]);

  const handleDownloadCSV = (report: any) => {
    if (!report || !report.data) return;
    const rData = report.data;
    
    let csv = "sep=,\n";
    csv += `"LAPORAN KEUANGAN BULANAN - MERBABUSTAY"\n`;
    csv += `"Periode","${report.periode || ""}"\n`;
    csv += `"Tanggal Cetak","${new Date().toLocaleDateString("id-ID")}"\n\n`;
    
    csv += `"RINGKASAN EKSEKUTIF"\n`;
    csv += `"Metrik","Nilai"\n`;
    csv += `"Total Pendapatan (IDR)",${rData.total_pendapatan || 0}\n`;
    csv += `"Tingkat Okupansi","${rData.tingkat_okupansi || "0%"}"\n`;
    csv += `"Total Malam Terjual (malam)",${rData.malam_terjual || 0}\n`;
    csv += `"Total Transaksi Lunas",${rData.total_transaksi || 0}\n\n`;
    
    csv += `"PERFORMA PER UNIT KAMAR"\n`;
    csv += `"Nama Kamar","Tipe","Malam Terjual","Total Pendapatan (IDR)"\n`;
    if (rData.rincian_kamar) {
      Object.values(rData.rincian_kamar).forEach((rp: any) => {
        const cleanName = rp.name.replace(/"/g, '""');
        csv += `"${cleanName}","${rp.type}",${rp.nights},${rp.revenue}\n`;
      });
    }
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const cleanPeriode = (report.periode || "Laporan").replace(/\s+/g, "_");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Keuangan_MerbabuStay_${cleanPeriode}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendReportAlerts = async () => {
    setTriggeringAlerts(true);
    try {
      const res = await fetch(`/api/admin/cron/laporan-bulanan?secret=test_secret_bypass&month=${reportMonth}&year=${reportYear}`);
      const data = await res.json();
      if (data.success) {
        alert(`Sukses! Laporan bulanan periode ${data.periode} telah dikirim ke Telegram dan email.`);
      } else {
        alert(`Gagal mengirim laporan: ${data.message}`);
      }
    } catch (err: any) {
      alert(`Gagal menghubungi server: ${err.message}`);
    } finally {
      setTriggeringAlerts(false);
    }
  };

  const handleMigrateData = async () => {
    if (!confirm("Apakah Anda ingin memigrasikan seluruh data kamar awal dari frontend ke database? Kamar yang sudah ada tidak akan diduplikasi.")) {
      return;
    }
    setMigrating(true);
    try {
      const res = await fetch("/api/admin/migrate", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        await refreshRooms();
      } else {
        alert(`Gagal migrasi: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setMigrating(false);
    }
  };

  // 2. Booking status updater
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/pesanan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        // Update local state
        setPesananList((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
      } else {
        alert("Gagal memperbarui status di server, memperbarui demo lokal...");
        setPesananList((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
      }
    } catch (err) {
      setPesananList((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // 3. Room CMS CRUD Handlers
  const handleOpenAddRoomModal = () => {
    setRoomForm({
      id: "",
      nama: "",
      slug: "",
      deskripsi: "",
      deskripsi_singkat: "",
      tipe: "standard",
      kapasitas_tamu: 2,
      jumlah_bed: 1,
      tipe_bed: "double",
      harga_per_malam: 300000,
      harga_weekend: 350000,
      foto_utama: "",
      is_active: true,
      is_popular: false,
      fasilitas: [],
      jumlah_kamar: 1,
    });
    setShowRoomModal(true);
  };

  const handleOpenEditRoomModal = (room: any) => {
    const name = room.nama || room.nama_kamar || "";
    const slug = room.slug || "";
    const desc = room.deskripsi || "";
    const descShort = room.deskripsi_singkat || "";
    const type = room.tipe || "standard";
    const guestCap = room.kapasitas_tamu || room.kapasitas_dewasa || 2;
    const bedCount = room.jumlah_bed || 1;
    const bedType = room.tipe_bed || "double";
    const price = room.harga_per_malam ? Number(room.harga_per_malam) : 300000;
    const priceWeekend = room.harga_weekend ? Number(room.harga_weekend) : price;
    const photo = room.foto_utama || "";
    const active = room.is_active !== false && room.status_aktif !== false;
    const popular = room.is_popular === true;
    const facilities = Array.isArray(room.fasilitas) ? room.fasilitas : [];
    const qty = room.jumlah_kamar || room.stok || 1;

    setRoomForm({
      id: room.id,
      nama: name,
      slug: slug,
      deskripsi: desc,
      deskripsi_singkat: descShort,
      tipe: type,
      kapasitas_tamu: guestCap,
      jumlah_bed: bedCount,
      tipe_bed: bedType,
      harga_per_malam: price,
      harga_weekend: priceWeekend,
      foto_utama: photo,
      is_active: active,
      is_popular: popular,
      fasilitas: facilities,
      jumlah_kamar: qty,
    });
    setShowRoomModal(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameVal = e.target.value;
    const slugVal = nameVal
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    
    setRoomForm((prev) => ({
      ...prev,
      nama: nameVal,
      slug: slugVal,
    }));
  };

  const handleFacilityToggle = (facility: string) => {
    setRoomForm((prev) => {
      const current = prev.fasilitas;
      if (current.includes(facility)) {
        return { ...prev, fasilitas: current.filter((f) => f !== facility) };
      } else {
        return { ...prev, fasilitas: [...current, facility] };
      }
    });
  };

  // Image Upload and Compression Logic
  const compressImage = (file: File): Promise<Blob | File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 1000;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            0.75
          );
        };
      };
    });
  };

  const fileToBase64 = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploadingImage(true);
    setUploadError("");
    
    try {
      // 1. Compress image to keep it optimized
      const compressedBlob = await compressImage(file);
      
      // 2. Try uploading to Supabase Storage
      const { supabase } = await import("@/lib/supabase");
      const fileExt = "jpg";
      const fileName = `${Math.random().toString(36).substring(2, 10)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from("kamar")
        .upload(filePath, compressedBlob, {
          contentType: "image/jpeg",
          upsert: true
        });
        
      if (!uploadError && data) {
        const { data: { publicUrl } } = supabase.storage
          .from("kamar")
          .getPublicUrl(filePath);
          
        setRoomForm((prev) => ({ ...prev, foto_utama: publicUrl }));
        return;
      }
      
      // 3. Fallback: Base64
      const base64Data = await fileToBase64(compressedBlob);
      setRoomForm((prev) => ({ ...prev, foto_utama: base64Data }));
    } catch (err: any) {
      console.error("Image upload error:", err);
      setUploadError(err.message || "Gagal mengunggah foto.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.nama || !roomForm.harga_per_malam) {
      alert("Nama Kamar dan Harga per malam wajib diisi!");
      return;
    }

    setSavingRoom(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      
      // 1. Dynamic Column Discovery
      // Query 1 row (or use empty select) to inspect the exact columns present in the database table
      const { data: sampleRow, error: discoverError } = await supabase
        .from("kamar")
        .select("*")
        .limit(1);
      
      if (discoverError) {
        throw new Error(`Gagal mendeteksi struktur database: ${discoverError.message}`);
      }

      // Fallback columns if table is completely empty
      let availableColumns: string[] = [];
      if (sampleRow && sampleRow.length > 0) {
        availableColumns = Object.keys(sampleRow[0]);
      } else {
        // If table is empty, we query column names via an empty filter or fallback to a sensible list
        // Typically, we can assume at least the old columns exist
        availableColumns = ["id", "nama_kamar", "harga_per_malam", "kapasitas_dewasa", "deskripsi", "fasilitas", "status_aktif", "created_at"];
      }

      // 2. Construct dynamic schema-agnostic payload
      const payload: any = {};
      
      if (availableColumns.includes("nama")) payload.nama = roomForm.nama;
      if (availableColumns.includes("nama_kamar")) payload.nama_kamar = roomForm.nama;
      if (availableColumns.includes("slug")) payload.slug = roomForm.slug || `kamar-${Math.random().toString(36).substring(2, 7)}`;
      if (availableColumns.includes("deskripsi")) payload.deskripsi = roomForm.deskripsi || null;
      if (availableColumns.includes("deskripsi_singkat")) payload.deskripsi_singkat = roomForm.deskripsi_singkat || null;
      if (availableColumns.includes("tipe")) payload.tipe = roomForm.tipe;
      if (availableColumns.includes("kapasitas_tamu")) payload.kapasitas_tamu = Number(roomForm.kapasitas_tamu);
      if (availableColumns.includes("kapasitas_dewasa")) payload.kapasitas_dewasa = Number(roomForm.kapasitas_tamu);
      if (availableColumns.includes("jumlah_bed")) payload.jumlah_bed = Number(roomForm.jumlah_bed);
      if (availableColumns.includes("tipe_bed")) payload.tipe_bed = roomForm.tipe_bed;
      if (availableColumns.includes("harga_per_malam")) payload.harga_per_malam = Number(roomForm.harga_per_malam);
      if (availableColumns.includes("harga_weekend")) payload.harga_weekend = roomForm.harga_weekend ? Number(roomForm.harga_weekend) : null;
      if (availableColumns.includes("foto_utama")) payload.foto_utama = roomForm.foto_utama || null;
      if (availableColumns.includes("is_active")) payload.is_active = roomForm.is_active;
      if (availableColumns.includes("status_aktif")) payload.status_aktif = roomForm.is_active;
      if (availableColumns.includes("is_popular")) payload.is_popular = roomForm.is_popular;
      if (availableColumns.includes("fasilitas")) payload.fasilitas = roomForm.fasilitas;
      if (availableColumns.includes("jumlah_kamar")) payload.jumlah_kamar = Number(roomForm.jumlah_kamar || 1);
      if (availableColumns.includes("stok")) payload.stok = Number(roomForm.jumlah_kamar || 1);
      if (availableColumns.includes("updated_at")) payload.updated_at = new Date().toISOString();

      // 3. Execute insert or update query
      let queryError;
      if (roomForm.id) {
        // UPDATE
        const { error } = await supabase
          .from("kamar")
          .update(payload)
          .eq("id", roomForm.id);
        queryError = error;
      } else {
        // CREATE
        const { error } = await supabase
          .from("kamar")
          .insert(payload);
        queryError = error;
      }

      if (queryError) {
        throw queryError;
      }

      alert("Kamar berhasil disimpan ke database!");
      setShowRoomModal(false);
      await refreshRooms();
    } catch (err: any) {
      const errMsg = err.message || err.details || JSON.stringify(err);
      console.error("Failed to save room:", errMsg, err);
      
      alert(`Gagal menyimpan ke database (${errMsg}). Menyimpan ke status demo lokal.`);
      if (roomForm.id) {
        setRoomsList((prev) =>
          prev.map((r) => (r.id === roomForm.id ? { ...r, ...roomForm } : r))
        );
      } else {
        const mockNewRoom = {
          ...roomForm,
          id: `mock-new-${Math.random().toString(36).substring(2, 6)}`,
        };
        setRoomsList((prev) => [mockNewRoom, ...prev]);
      }
      setShowRoomModal(false);
    } finally {
      setSavingRoom(false);
    }
  };

  const handleDeleteRoom = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kamar "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase
        .from("kamar")
        .delete()
        .eq("id", id);

      if (error) throw error;
      alert("Kamar berhasil dihapus!");
      await refreshRooms();
    } catch (err: any) {
      console.error("Failed to delete room:", err);
      alert(`Gagal menghapus dari database (${err.message}). Menghapus dari demo lokal.`);
      setRoomsList((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // 4. Filters & Searches
  const filteredBookings = pesananList.filter((p) => {
    const bookingCode = p.kode_pesanan || p.id || "";
    const guestName = p.nama_lengkap || "Tamu";
    const roomName = p.kamar?.nama || p.kamar?.nama_kamar || "Standard Room";

    const matchesSearch =
      bookingCode.toLowerCase().includes(searchBooking.toLowerCase()) ||
      guestName.toLowerCase().includes(searchBooking.toLowerCase()) ||
      roomName.toLowerCase().includes(searchBooking.toLowerCase());

    const statusVal = p.status || p.status_pembayaran || "pending";
    const matchesStatus = statusFilter === "all" || statusVal.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const filteredRooms = roomsList.filter((r) => {
    const name = r.nama || r.nama_kamar || "Kamar Tanpa Nama";
    const type = r.tipe || "standard";
    return (
      name.toLowerCase().includes(searchRoom.toLowerCase()) ||
      type.toLowerCase().includes(searchRoom.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F0E8] gap-4">
        <svg className="animate-spin h-10 w-10 text-[#7A8B6F]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm font-semibold text-[#5C6B52] tracking-wider animate-pulse">MEMUAT DATA DASHBOARD...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#3D4A35] text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-lg md:text-xl font-bold">
              MerbabuStay Admin Panel
            </h1>
            <p className="text-[10px] text-[#A8B89E] tracking-widest uppercase font-semibold">
              Dashboard Manajemen & CMS
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-[#5C6B52] hover:bg-[#7A8B6F] text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
        >
          Keluar 🚪
        </button>
      </header>

      {/* Tab Switched Navigation */}
      <div className="flex border-b border-[#EDE7DB] px-6 py-1 bg-white gap-6 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab("bookings")}
          className={`py-3.5 text-xs md:text-sm font-bold transition-all border-b-2 tracking-wide flex-shrink-0 ${
            activeTab === "bookings"
              ? "border-[#5C6B52] text-[#5C6B52]"
              : "border-transparent text-[#8C9A86] hover:text-[#5C6B52]"
          }`}
        >
          📋 MANAJEMEN PESANAN
        </button>
        <button
          onClick={() => setActiveTab("rooms")}
          className={`py-3.5 text-xs md:text-sm font-bold transition-all border-b-2 tracking-wide flex-shrink-0 ${
            activeTab === "rooms"
              ? "border-[#5C6B52] text-[#5C6B52]"
              : "border-transparent text-[#8C9A86] hover:text-[#5C6B52]"
          }`}
        >
          🏡 MANAJEMEN KAMAR (CMS)
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`py-3.5 text-xs md:text-sm font-bold transition-all border-b-2 tracking-wide flex-shrink-0 ${
            activeTab === "reports"
              ? "border-[#5C6B52] text-[#5C6B52]"
              : "border-transparent text-[#8C9A86] hover:text-[#5C6B52]"
          }`}
        >
          📊 LAPORAN KEUANGAN
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        
        {/* TAB 1: BOOKINGS MANAGEMENT */}
        {activeTab === "bookings" && (
          <>
            {/* Controls */}
            <div className="bg-white rounded-2xl p-6 border border-[#EDE7DB] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="w-full md:max-w-xs relative">
                <input
                  type="text"
                  placeholder="Cari kode booking, nama pemesan..."
                  value={searchBooking}
                  onChange={(e) => setSearchBooking(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] outline-none focus:border-[#7A8B6F] transition-all"
                />
                <span className="absolute left-3.5 top-3 text-gray-400">🔍</span>
              </div>

              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
                {[
                  { label: "Semua", value: "all" },
                  { label: "Waiting Payment", value: "waiting_payment" },
                  { label: "Paid (Lunas)", value: "paid" },
                  { label: "Confirmed", value: "confirmed" },
                  { label: "Checked In", value: "checked_in" },
                  { label: "Completed", value: "completed" },
                  { label: "Cancelled", value: "cancelled" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex-shrink-0 ${
                      statusFilter.toLowerCase() === tab.value.toLowerCase()
                        ? "bg-[#5C6B52] text-white"
                        : "bg-[#FAF7F2] text-[#5C6B52] border border-[#EDE7DB]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl border border-[#EDE7DB] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#EDE7DB] text-[#5C6B52] font-bold text-xs uppercase tracking-wider">
                      <th className="p-4">Kode Booking</th>
                      <th className="p-4">Kamar</th>
                      <th className="p-4">Pemesan / Tamu</th>
                      <th className="p-4">Tanggal Stay</th>
                      <th className="p-4">Total Bayar</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Aksi Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDE7DB]/60">
                    {filteredBookings.map((item) => {
                      const statusVal = item.status || item.status_pembayaran || "pending";
                      const displayStatus = statusVal.toLowerCase();
                      const statusColors: any = {
                        pending: "bg-gray-100 text-gray-700",
                        waiting_payment: "bg-amber-50 text-amber-700 border border-amber-100",
                        paid: "bg-emerald-50 text-emerald-700 border border-emerald-100",
                        confirmed: "bg-blue-50 text-blue-700 border border-blue-100",
                        checked_in: "bg-purple-50 text-purple-700 border border-purple-100",
                        completed: "bg-green-100 text-green-800",
                        failed: "bg-red-50 text-red-700",
                        cancelled: "bg-stone-100 text-stone-600",
                      };

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#7A8B6F]">
                            {item.kode_pesanan || item.id.substring(0, 8).toUpperCase()}
                          </td>
                          <td className="p-4 font-semibold text-[#2D3328]">
                            {item.kamar?.nama || item.kamar?.nama_kamar || "Standard Room"}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-[#2D3328]">{item.nama_lengkap || "Tamu"}</div>
                            <div className="text-xs text-[#6B7560]">
                              {item.no_hp || "Tanpa No HP"} · {item.jumlah_tamu || 1} Tamu
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-[#2D3328]">
                              {formatTanggalShort(item.check_in || item.tgl_checkin)}
                            </div>
                            <div className="text-xs text-[#6B7560]">
                              s/d {formatTanggalShort(item.check_out || item.tgl_checkout)} ({item.jumlah_malam || 1} malam)
                            </div>
                          </td>
                          <td className="p-4 font-bold text-[#C4956A]">
                            {formatRupiah(item.total_bayar || item.total_harga || 0)}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                statusColors[displayStatus] || "bg-gray-100"
                              }`}
                            >
                              {displayStatus.replace("_", " ")}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex gap-1.5 justify-center">
                              {displayStatus === "waiting_payment" && (
                                <button
                                  onClick={() => handleUpdateStatus(item.id, "paid")}
                                  disabled={updatingId === item.id}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                                >
                                  ✓ Set Lunas
                                </button>
                              )}

                              {displayStatus === "paid" && (
                                <button
                                  onClick={() => handleUpdateStatus(item.id, "confirmed")}
                                  disabled={updatingId === item.id}
                                  className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                                >
                                  ✓ Konfirmasi
                                </button>
                              )}

                              {displayStatus === "confirmed" && (
                                <button
                                  onClick={() => handleUpdateStatus(item.id, "checked_in")}
                                  disabled={updatingId === item.id}
                                  className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors"
                                >
                                  🔑 Check In
                                </button>
                              )}

                              {displayStatus === "checked_in" && (
                                <button
                                  onClick={() => handleUpdateStatus(item.id, "completed")}
                                  disabled={updatingId === item.id}
                                  className="px-2.5 py-1.5 rounded-lg bg-green-700 hover:bg-green-800 text-white text-xs font-semibold transition-colors"
                                >
                                  🚪 Check Out
                                </button>
                              )}

                              {["pending", "waiting_payment", "paid", "confirmed"].includes(
                                displayStatus
                              ) && (
                                <button
                                  onClick={() => {
                                    const r = prompt("Masukkan alasan pembatalan:");
                                    if (r !== null) handleUpdateStatus(item.id, "cancelled");
                                  }}
                                  disabled={updatingId === item.id}
                                  className="px-2.5 py-1.5 rounded-lg border border-[#EDE7DB] hover:bg-red-50 text-[#BA1A1A] text-xs font-semibold transition-colors"
                                >
                                  ✕ Batalkan
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredBookings.length === 0 && (
                <div className="text-center py-16 text-[#6B7560] font-medium">
                  Tidak ada pesanan homestay yang cocok dengan pencarian Anda.
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 2: ROOMS CMS (CRUD) */}
        {activeTab === "rooms" && (
          <>
            {/* Top Bar Controls */}
            <div className="bg-white rounded-2xl p-6 border border-[#EDE7DB] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="w-full md:max-w-xs relative">
                <input
                  type="text"
                  placeholder="Cari nama kamar atau tipe..."
                  value={searchRoom}
                  onChange={(e) => setSearchRoom(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] outline-none focus:border-[#7A8B6F] transition-all"
                />
                <span className="absolute left-3.5 top-3 text-gray-400">🔍</span>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={handleMigrateData}
                  disabled={migrating}
                  className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-[#C4956A] hover:bg-[#FAF7F2] text-[#C4956A] text-xs md:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  ✨ {migrating ? "Migrasi..." : "Migrasikan Data Awal"}
                </button>

                <button
                  onClick={handleOpenAddRoomModal}
                  className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#5C6B52] hover:bg-[#3D4A35] text-white text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  ➕ Tambah Kamar Baru
                </button>
              </div>
            </div>

            {/* Rooms List Table */}
            <div className="bg-white rounded-2xl border border-[#EDE7DB] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#EDE7DB] text-[#5C6B52] font-bold text-xs uppercase tracking-wider">
                      <th className="p-4 w-24">Foto</th>
                      <th className="p-4">Detail Kamar</th>
                      <th className="p-4">Tipe & Ranjang</th>
                      <th className="p-4">Kapasitas</th>
                      <th className="p-4">Tarif Stay (Weekday/Weekend)</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center w-40">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDE7DB]/60">
                    {filteredRooms.map((room) => {
                      const name = room.nama || room.nama_kamar || "Kamar Tanpa Nama";
                      const slug = room.slug || "kamar-tanpa-slug";
                      const type = room.tipe || "standard";
                      const bedCount = room.jumlah_bed || 1;
                      const bedType = room.tipe_bed || "double";
                      const guestCap = room.kapasitas_tamu || room.kapasitas_dewasa || 2;
                      const price = Number(room.harga_per_malam || 0);
                      const priceWeekend = room.harga_weekend ? Number(room.harga_weekend) : price;
                      const isActive = room.is_active !== false && room.status_aktif !== false;
                      const isPopular = room.is_popular === true;

                      return (
                        <tr key={room.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                            <div className="w-16 h-12 rounded-lg bg-[#EDE7DB] overflow-hidden flex items-center justify-center text-xl shadow-inner border border-[#D9D0C1]">
                              {room.foto_utama ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={room.foto_utama} alt={name} className="w-full h-full object-cover" />
                              ) : (
                                "🏡"
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-[#2D3328] text-sm md:text-base">{name}</div>
                            <div className="text-xs text-[#7A8B6F] font-mono mt-0.5">/{slug}</div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-[#FAF7F2] text-[#5C6B52] border border-[#EDE7DB] text-xs font-semibold uppercase">
                              {type}
                            </span>
                            <div className="text-xs text-[#6B7560] mt-1.5">
                              🛏️ {bedCount} {bedType} Bed
                            </div>
                          </td>
                          <td className="p-4 text-[#2D3328] font-medium">
                            👥 Maks {guestCap} Tamu
                          </td>
                          <td className="p-4">
                            <div className="text-sm font-bold text-[#5C6B52]">
                              {formatRupiah(price)} <span className="text-[10px] text-[#6B7560] font-normal">/ weekday</span>
                            </div>
                            {priceWeekend > 0 && (
                              <div className="text-xs font-bold text-[#C4956A] mt-0.5">
                                {formatRupiah(priceWeekend)} <span className="text-[10px] text-[#6B7560] font-normal">/ weekend</span>
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              {isActive ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">AKTIF</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold">OFFLINE</span>
                              )}

                              {isPopular && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-bold">⭐ POPULER</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleOpenEditRoomModal(room)}
                                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-all"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room.id, name)}
                                className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-all"
                              >
                                🗑️ Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredRooms.length === 0 && (
                <div className="text-center py-16 text-[#6B7560] font-medium">
                  Belum ada kamar homestay terdaftar yang cocok dengan pencarian Anda.
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 3: MONTHLY FINANCIAL REPORTS */}
        {activeTab === "reports" && (
          <>
            {/* Control Bar */}
            <div className="bg-white rounded-2xl p-6 border border-[#EDE7DB] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div>
                  <label className="block text-[10px] font-bold text-[#2D3328] uppercase tracking-wider mb-1">Pilih Bulan</label>
                  <select
                    value={reportMonth}
                    onChange={(e) => setReportMonth(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] bg-white outline-none focus:border-[#7A8B6F] transition-all font-semibold"
                  >
                    {[
                      { v: 1, l: "Januari" },
                      { v: 2, l: "Februari" },
                      { v: 3, l: "Maret" },
                      { v: 4, l: "April" },
                      { v: 5, l: "Mei" },
                      { v: 6, l: "Juni" },
                      { v: 7, l: "Juli" },
                      { v: 8, l: "Agustus" },
                      { v: 9, l: "September" },
                      { v: 10, l: "Oktober" },
                      { v: 11, l: "November" },
                      { v: 12, l: "Desember" }
                    ].map((m) => (
                      <option key={m.v} value={m.v}>{m.l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#2D3328] uppercase tracking-wider mb-1">Pilih Tahun</label>
                  <select
                    value={reportYear}
                    onChange={(e) => setReportYear(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] bg-white outline-none focus:border-[#7A8B6F] transition-all font-semibold"
                  >
                    {[2025, 2026, 2027, 2028].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="self-end">
                  <button
                    onClick={() => fetchMonthlyReport(reportMonth, reportYear)}
                    disabled={loadingReport}
                    className="px-5 py-2.5 rounded-xl bg-[#5C6B52] hover:bg-[#3D4A35] text-white text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:bg-gray-300"
                  >
                    {loadingReport ? "Memuat..." : "🔍 Tampilkan Laporan"}
                  </button>
                </div>
              </div>

              {reportData && !loadingReport && (
                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <button
                    onClick={handleSendReportAlerts}
                    disabled={triggeringAlerts}
                    className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-[#7A8B6F] hover:bg-[#FAF7F2] text-[#5C6B52] text-xs md:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    ✉️ {triggeringAlerts ? "Mengirim..." : "Kirim Email & Telegram"}
                  </button>

                  <button
                    onClick={() => handleDownloadCSV(reportData)}
                    className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-[#C4956A] hover:bg-[#A37B55] text-white text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    📥 Unduh Excel (CSV)
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {reportError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-[#BA1A1A] font-semibold">
                ⚠️ Gagal mengambil laporan: {reportError}
              </div>
            )}

            {/* Loading State */}
            {loadingReport && (
              <div className="bg-white rounded-2xl border border-[#EDE7DB] p-12 text-center shadow-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5C6B52] mx-auto mb-4"></div>
                <p className="text-sm text-[#6B7560] font-medium">Sedang memformulasikan laporan keuangan Anda...</p>
              </div>
            )}

            {/* Main Report Content */}
            {!loadingReport && reportData && (
              <div className="space-y-6">
                
                {/* Executive Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Revenue Card */}
                  <div className="bg-white p-5 rounded-2xl border-l-4 border-l-[#C4956A] border border-[#EDE7DB] shadow-sm">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#7A8B6F] block">Total Pendapatan</span>
                    <h2 className="text-2xl font-black text-[#C4956A] mt-1.5">{formatRupiah(reportData.data?.total_pendapatan || 0)}</h2>
                    <span className="text-[11px] text-[#6B7560] mt-1 block">Dari transaksi berstatus Lunas</span>
                  </div>

                  {/* Occupancy Card */}
                  <div className="bg-white p-5 rounded-2xl border-l-4 border-l-[#5C6B52] border border-[#EDE7DB] shadow-sm">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#7A8B6F] block">Tingkat Okupansi</span>
                    <h2 className="text-2xl font-black text-[#5C6B52] mt-1.5">{reportData.data?.tingkat_okupansi || "0%"}</h2>
                    <span className="text-[11px] text-[#6B7560] mt-1 block">Rata-rata hunian homestay</span>
                  </div>

                  {/* Nights Sold Card */}
                  <div className="bg-white p-5 rounded-2xl border-l-4 border-l-[#7A8B6F] border border-[#EDE7DB] shadow-sm">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#7A8B6F] block">Malam Terjual</span>
                    <h2 className="text-2xl font-black text-[#2D3328] mt-1.5">{reportData.data?.malam_terjual || 0} Malam</h2>
                    <span className="text-[11px] text-[#6B7560] mt-1 block">Akumulasi durasi menginap</span>
                  </div>

                  {/* Total Bookings Card */}
                  <div className="bg-white p-5 rounded-2xl border-l-4 border-l-gray-400 border border-[#EDE7DB] shadow-sm">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#7A8B6F] block">Transaksi Lunas</span>
                    <h2 className="text-2xl font-black text-[#2D3328] mt-1.5">{reportData.data?.total_transaksi || 0} Pesanan</h2>
                    <span className="text-[11px] text-[#6B7560] mt-1 block">Jumlah tamu yang terlayani</span>
                  </div>
                </div>

                {/* Rooms Contribution Table */}
                <div className="bg-white rounded-2xl border border-[#EDE7DB] shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-[#EDE7DB] bg-[#FAF7F2]">
                    <h3 className="font-[family-name:var(--font-playfair)] text-base md:text-lg font-bold text-[#3D4A35]">
                      🚪 Performa & Kontribusi Pendapatan per Kamar
                    </h3>
                    <p className="text-xs text-[#6B7560] mt-0.5">
                      Rincian performa setiap tipe kamar di MerbabuStay untuk periode {reportData.periode}.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-[#EDE7DB] text-[#5C6B52] font-bold text-xs uppercase tracking-wider">
                          <th className="p-4">Nama Kamar / Unit</th>
                          <th className="p-4 text-center">Tipe Kamar</th>
                          <th className="p-4 text-center">Malam Terjual</th>
                          <th className="p-4 text-right">Total Pendapatan (IDR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDE7DB]/60">
                        {reportData.data?.rincian_kamar && Object.values(reportData.data.rincian_kamar).map((rp: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50/40 transition-colors">
                            <td className="p-4 font-bold text-[#2D3328]">{rp.name}</td>
                            <td className="p-4 text-center">
                              <span className="px-2 py-0.5 rounded bg-[#FAF7F2] text-[#5C6B52] border border-[#EDE7DB] text-xs font-semibold uppercase font-mono">
                                {rp.type}
                              </span>
                            </td>
                            <td className="p-4 text-center font-bold text-[#5C6B52]">{rp.nights} malam</td>
                            <td className="p-4 text-right font-black text-[#C4956A]">{formatRupiah(rp.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </main>

      {/* CRUD MODAL FORM FOR ROOMS */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#EDE7DB] shadow-2xl p-6 md:p-8 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button
              onClick={() => setShowRoomModal(false)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-bold text-[#3D4A35]">
                {roomForm.id ? "✏️ Edit Kamar Homestay" : "🏡 Tambah Kamar Baru"}
              </h2>
              <p className="text-xs text-[#6B7560] mt-1">
                Isi rincian detail kamar yang akan ditawarkan ke tamu.
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveRoom} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Kamar */}
                <div>
                  <label className="block text-xs font-bold text-[#2D3328] uppercase tracking-wider mb-1">Nama Kamar *</label>
                  <input
                    type="text"
                    required
                    value={roomForm.nama}
                    onChange={handleNameChange}
                    placeholder="Contoh: Suite Sunrise Deluxe"
                    className="w-full px-3 py-2 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] outline-none focus:border-[#7A8B6F] transition-all"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-bold text-[#2D3328] uppercase tracking-wider mb-1">Slug URL (Auto) *</label>
                  <input
                    type="text"
                    required
                    value={roomForm.slug}
                    onChange={(e) => setRoomForm({ ...roomForm, slug: e.target.value })}
                    placeholder="suite-sunrise-deluxe"
                    className="w-full px-3 py-2 rounded-xl border border-[#EDE7DB] text-sm text-gray-500 font-mono bg-gray-50 outline-none focus:border-[#7A8B6F] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Tipe Kamar */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#2D3328] uppercase tracking-wider mb-1">Tipe Kamar</label>
                  <select
                    value={roomForm.tipe}
                    onChange={(e) => setRoomForm({ ...roomForm, tipe: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] bg-white outline-none focus:border-[#7A8B6F] transition-all"
                  >
                    <option value="standard">Standard Room</option>
                    <option value="deluxe">Deluxe Room</option>
                    <option value="family">Family Suite</option>
                    <option value="villa">Villa / Homestay</option>
                  </select>
                </div>

                {/* Kapasitas */}
                <div>
                  <label className="block text-xs font-bold text-[#2D3328] uppercase tracking-wider mb-1">Kapasitas Tamu</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={roomForm.kapasitas_tamu}
                    onChange={(e) => setRoomForm({ ...roomForm, kapasitas_tamu: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] outline-none focus:border-[#7A8B6F] transition-all"
                  />
                </div>

                {/* Jumlah Bed */}
                <div>
                  <label className="block text-xs font-bold text-[#2D3328] uppercase tracking-wider mb-1">Jumlah Bed</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={roomForm.jumlah_bed}
                    onChange={(e) => setRoomForm({ ...roomForm, jumlah_bed: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] outline-none focus:border-[#7A8B6F] transition-all"
                  />
                </div>

                {/* Jumlah Unit Kamar */}
                <div>
                  <label className="block text-xs font-bold text-[#2D3328] uppercase tracking-wider mb-1">Unit Tersedia</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={roomForm.jumlah_kamar || 1}
                    onChange={(e) => setRoomForm({ ...roomForm, jumlah_kamar: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] outline-none focus:border-[#7A8B6F] transition-all"
                    placeholder="Batas unit"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tipe Bed */}
                <div>
                  <label className="block text-xs font-bold text-[#2D3328] uppercase tracking-wider mb-1">Ukuran/Tipe Bed</label>
                  <input
                    type="text"
                    value={roomForm.tipe_bed}
                    onChange={(e) => setRoomForm({ ...roomForm, tipe_bed: e.target.value })}
                    placeholder="Contoh: king, queen, double"
                    className="w-full px-3 py-2 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] outline-none focus:border-[#7A8B6F] transition-all"
                  />
                </div>

                {/* Harga Weekday */}
                <div>
                  <label className="block text-xs font-bold text-[#2D3328] uppercase tracking-wider mb-1">Tarif Weekday *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={roomForm.harga_per_malam}
                    onChange={(e) => setRoomForm({ ...roomForm, harga_per_malam: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] outline-none focus:border-[#7A8B6F] transition-all"
                  />
                </div>

                {/* Harga Weekend */}
                <div>
                  <label className="block text-xs font-bold text-[#2D3328] uppercase tracking-wider mb-1">Tarif Weekend</label>
                  <input
                    type="number"
                    min={0}
                    value={roomForm.harga_weekend}
                    onChange={(e) => setRoomForm({ ...roomForm, harga_weekend: Number(e.target.value) })}
                    placeholder="Isi jika berbeda dengan weekday"
                    className="w-full px-3 py-2 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] outline-none focus:border-[#7A8B6F] transition-all"
                  />
                </div>
              </div>

              {/* Foto Utama Drag and Drop Uploader */}
              <div>
                <label className="block text-xs font-bold text-[#2D3328] uppercase tracking-wider mb-2">Foto Utama Kamar</label>
                
                <div
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      await handleImageUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-200 min-h-[160px] ${
                    dragActive
                      ? "border-[#5C6B52] bg-[#5C6B52]/5"
                      : "border-[#EDE7DB] bg-[#FAF7F2] hover:border-[#7A8B6F] hover:bg-[#FAF7F2]/60"
                  }`}
                >
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <svg className="animate-spin h-8 w-8 text-[#5C6B52]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <p className="text-xs font-semibold text-[#5C6B52]">Mengunggah & mengompres foto...</p>
                    </div>
                  ) : roomForm.foto_utama ? (
                    <div className="w-full flex flex-col sm:flex-row items-center gap-4">
                      {/* Image Preview */}
                      <div className="relative w-28 h-20 rounded-xl bg-gray-100 overflow-hidden shadow-inner border border-[#EDE7DB] flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={roomForm.foto_utama} alt="Preview Foto" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-xs font-semibold text-emerald-700 flex items-center justify-center sm:justify-start gap-1">
                          ✓ Foto berhasil disiapkan!
                        </p>
                        <p className="text-[10px] text-[#6B7560] mt-0.5 max-w-[280px] truncate">
                          {roomForm.foto_utama.startsWith("data:") ? "Format: Base64 Terkompresi (Optimal)" : roomForm.foto_utama}
                        </p>
                        <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                          <label className="px-3 py-1.5 rounded-lg bg-[#7A8B6F] hover:bg-[#5C6B52] text-white text-[11px] font-bold cursor-pointer shadow-sm transition-colors">
                            Ganti Foto
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  await handleImageUpload(e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setRoomForm((prev) => ({ ...prev, foto_utama: "" }))}
                            className="px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-700 text-[11px] font-bold transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full p-2 text-center select-none">
                      <span className="text-3xl mb-2">📸</span>
                      <span className="text-xs font-bold text-[#5C6B52]">Tarik & Lepas Foto di Sini</span>
                      <span className="text-[10px] text-[#8C9A86] mt-1">atau klik untuk memilih file dari perangkat Anda</span>
                      <span className="text-[9px] text-[#8C9A86]/70 mt-0.5">(Format: JPG, PNG, WebP up to 10MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            await handleImageUpload(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
                {uploadError && <p className="text-[11px] font-semibold text-[#BA1A1A] mt-1">⚠️ {uploadError}</p>}
                
                {/* Manual URL input fallback */}
                <div className="mt-2.5">
                  <details className="group">
                    <summary className="text-[11px] text-[#8C9A86] font-semibold cursor-pointer list-none flex items-center gap-1 hover:text-[#5C6B52] transition-colors select-none">
                      <span className="transition-transform duration-200 group-open:rotate-90">▶</span>
                      Masukkan URL Gambar Secara Manual
                    </summary>
                    <input
                      type="text"
                      value={roomForm.foto_utama}
                      onChange={(e) => setRoomForm({ ...roomForm, foto_utama: e.target.value })}
                      placeholder="Contoh: https://example.com/foto.jpg"
                      className="w-full mt-1.5 px-3 py-1.5 rounded-xl border border-[#EDE7DB] text-xs text-[#2D3328] outline-none focus:border-[#7A8B6F] transition-all bg-gray-50/50"
                    />
                  </details>
                </div>
              </div>

              {/* Deskripsi Singkat */}
              <div>
                <label className="block text-xs font-bold text-[#2D3328] uppercase tracking-wider mb-1">Deskripsi Singkat (Card Preview)</label>
                <input
                  type="text"
                  value={roomForm.deskripsi_singkat}
                  onChange={(e) => setRoomForm({ ...roomForm, deskripsi_singkat: e.target.value })}
                  placeholder="Tulis ringkasan singkat penawaran kamar"
                  className="w-full px-3 py-2 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] outline-none focus:border-[#7A8B6F] transition-all"
                />
              </div>

              {/* Deskripsi Lengkap */}
              <div>
                <label className="block text-xs font-bold text-[#2D3328] uppercase tracking-wider mb-1">Deskripsi Lengkap (HTML/Markdown)</label>
                <textarea
                  value={roomForm.deskripsi}
                  onChange={(e) => setRoomForm({ ...roomForm, deskripsi: e.target.value })}
                  rows={4}
                  placeholder="Detail lengkap, aturan menginap, info view, dll."
                  className="w-full px-3 py-2 rounded-xl border border-[#EDE7DB] text-sm text-[#2D3328] outline-none focus:border-[#7A8B6F] transition-all"
                />
              </div>

              {/* Fasilitas Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-[#2D3328] uppercase tracking-wider mb-2">Fasilitas Kamar</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-3 bg-[#FAF7F2] rounded-xl border border-[#EDE7DB]">
                  {availableFacilities.map((f) => (
                    <label key={f.value} className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[#2D3328] select-none hover:text-[#5C6B52]">
                      <input
                        type="checkbox"
                        checked={roomForm.fasilitas.includes(f.value)}
                        onChange={() => handleFacilityToggle(f.value)}
                        className="rounded border-[#EDE7DB] text-[#5C6B52] focus:ring-[#7A8B6F]/50 h-3.5 w-3.5"
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Toggle Status Aktif & Populer */}
              <div className="flex flex-col sm:flex-row gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#2D3328] uppercase tracking-wider select-none">
                  <input
                    type="checkbox"
                    checked={roomForm.is_active}
                    onChange={(e) => setRoomForm({ ...roomForm, is_active: e.target.checked })}
                    className="rounded border-[#EDE7DB] text-[#5C6B52] h-4 w-4"
                  />
                  Status Aktif (Ditawarkan di web)
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#2D3328] uppercase tracking-wider select-none">
                  <input
                    type="checkbox"
                    checked={roomForm.is_popular}
                    onChange={(e) => setRoomForm({ ...roomForm, is_popular: e.target.checked })}
                    className="rounded border-[#EDE7DB] text-[#5C6B52] h-4 w-4"
                  />
                  Kamar Terpopuler (Badge ⭐)
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-[#EDE7DB]">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#EDE7DB] hover:bg-gray-50 text-xs font-bold text-[#6B7560] transition-all"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  disabled={savingRoom}
                  className="px-6 py-2.5 rounded-xl bg-[#5C6B52] hover:bg-[#3D4A35] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  {savingRoom ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    "💾 Simpan Kamar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Simulated data generator for instant offline booking list dashboard experience
function getMockPesanan() {
  return [
    {
      id: "mock-1",
      kode_pesanan: "MBS-20260623-A98B",
      nama_lengkap: "Agus Prasetyo",
      no_hp: "081299881122",
      email: "agus@gmail.com",
      check_in: "2026-06-26",
      check_out: "2026-06-28",
      jumlah_malam: 2,
      jumlah_tamu: 2,
      total_bayar: 850000,
      status: "waiting_payment",
      kamar: { nama: "Kamar Pemandangan Gunung" },
    },
    {
      id: "mock-2",
      kode_pesanan: "MBS-20260622-C12F",
      nama_lengkap: "Indah Permata",
      no_hp: "085622119933",
      email: "indah@gmail.com",
      check_in: "2026-06-27",
      check_out: "2026-06-29",
      jumlah_malam: 2,
      jumlah_tamu: 2,
      total_bayar: 1300000,
      status: "paid",
      kamar: { nama: "Suite Sunrise Deluxe" },
    },
    {
      id: "mock-3",
      kode_pesanan: "MBS-20260620-Z76D",
      nama_lengkap: "Rian Hidayat",
      no_hp: "087711223344",
      email: "rian@gmail.com",
      check_in: "2026-07-01",
      check_out: "2026-07-04",
      jumlah_malam: 3,
      jumlah_tamu: 8,
      total_bayar: 3600000,
      status: "confirmed",
      kamar: { nama: "Villa Keluarga Merbabu" },
    },
    {
      id: "mock-4",
      kode_pesanan: "MBS-20260618-X54C",
      nama_lengkap: "Kiki Amalia",
      no_hp: "0811990088",
      email: "kiki@gmail.com",
      check_in: "2026-06-20",
      check_out: "2026-06-21",
      jumlah_malam: 1,
      jumlah_tamu: 2,
      total_bayar: 295000,
      status: "completed",
      kamar: { nama: "Kamar Cozy Standard" },
    },
  ];
}

// Simulated rooms list generator for instant offline CMS experience
function getMockRooms() {
  return [
    {
      id: "mock-k-1",
      nama: "Kamar Pemandangan Gunung",
      slug: "kamar-pemandangan-gunung",
      tipe: "deluxe",
      kapasitas_tamu: 2,
      jumlah_bed: 1,
      tipe_bed: "queen",
      harga_per_malam: 425000,
      harga_weekend: 525000,
      foto_utama: null,
      is_active: true,
      is_popular: true,
      fasilitas: ["wifi", "tv", "water_heater", "breakfast", "mountain_view", "balcony", "parking"],
      deskripsi_singkat: "Kamar nyaman view gunung dan balkon pribadi",
      deskripsi: "Kamar nyaman dengan balkon pribadi menghadap langsung ke Gunung Merbabu.",
    },
    {
      id: "mock-k-2",
      nama: "Suite Sunrise Deluxe",
      slug: "suite-sunrise-deluxe",
      tipe: "deluxe",
      kapasitas_tamu: 2,
      jumlah_bed: 1,
      tipe_bed: "king",
      harga_per_malam: 650000,
      harga_weekend: 750000,
      foto_utama: null,
      is_active: true,
      is_popular: true,
      fasilitas: ["wifi", "smart_tv", "ac", "water_heater", "breakfast", "mountain_view", "bathtub"],
      deskripsi_singkat: "Suite mewah dengan bathtub dan panorama 180° sunrise",
      deskripsi: "Suite mewah dengan bathtub, smart TV, dan panorama sunrise 180 derajat.",
    },
    {
      id: "mock-k-3",
      nama: "Villa Keluarga Merbabu",
      slug: "villa-keluarga-merbabu",
      tipe: "villa",
      kapasitas_tamu: 8,
      jumlah_bed: 3,
      tipe_bed: "mixed",
      harga_per_malam: 1200000,
      harga_weekend: 1500000,
      foto_utama: null,
      is_active: true,
      is_popular: false,
      fasilitas: ["wifi", "tv", "ac", "kitchen", "breakfast", "garden", "gazebo"],
      deskripsi_singkat: "Villa luas 3 kamar tidur dengan gazebo dan BBQ area",
      deskripsi: "Villa 3 kamar tidur, dapur lengkap, dan gazebo untuk keluarga besar.",
    },
    {
      id: "mock-k-4",
      nama: "Kamar Cozy Standard",
      slug: "kamar-cozy-standard",
      tipe: "standard",
      kapasitas_tamu: 2,
      jumlah_bed: 1,
      tipe_bed: "double",
      harga_per_malam: 295000,
      harga_weekend: 350000,
      foto_utama: null,
      is_active: true,
      is_popular: false,
      fasilitas: ["wifi", "water_heater", "parking"],
      deskripsi_singkat: "Kamar nyaman dan hemat budget untuk solo/couple traveler",
      deskripsi: "Kamar minimalis hemat budget dengan kamar mandi dalam.",
    },
  ];
}
