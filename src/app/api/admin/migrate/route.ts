import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    const mockRooms = [
      {
        nama: "Kamar Pemandangan Gunung",
        nama_kamar: "Kamar Pemandangan Gunung",
        slug: "kamar-pemandangan-gunung",
        deskripsi: "Kamar nyaman dengan jendela besar menghadap langsung ke Gunung Merbabu. Nikmati pemandangan spektakuler matahari terbit dan terbenam langsung dari kamar Anda. Dilengkapi dengan tempat tidur queen size, kamar mandi dalam dengan air panas, dan balkon pribadi.",
        deskripsi_singkat: "Kamar dengan pemandangan Gunung Merbabu langsung dari jendela dan balkon pribadi",
        tipe: "deluxe",
        kapasitas_tamu: 2,
        kapasitas_dewasa: 2,
        jumlah_bed: 1,
        tipe_bed: "queen",
        harga_per_malam: 425000,
        harga_weekend: 525000,
        fasilitas: ["wifi", "tv", "water_heater", "breakfast", "mountain_view", "balcony", "parking"],
        is_active: true,
        status_aktif: true,
        is_popular: true,
      },
      {
        nama: "Suite Sunrise Deluxe",
        nama_kamar: "Suite Sunrise Deluxe",
        slug: "suite-sunrise-deluxe",
        deskripsi: "Suite mewah di lantai atas dengan panorama 180 derajat pegunungan. Terbangun dengan pemandangan matahari terbit yang memukau. Dilengkapi king size bed, sofa lounge, smart TV, minibar, dan kamar mandi premium dengan bathtub.",
        deskripsi_singkat: "Suite deluxe dengan panorama 180° pegunungan and pemandangan sunrise terbaik",
        tipe: "deluxe",
        kapasitas_tamu: 2,
        kapasitas_dewasa: 2,
        jumlah_bed: 1,
        tipe_bed: "king",
        harga_per_malam: 650000,
        harga_weekend: 750000,
        fasilitas: ["wifi", "smart_tv", "ac", "water_heater", "breakfast", "mountain_view", "balcony", "minibar", "bathtub", "parking"],
        is_active: true,
        status_aktif: true,
        is_popular: true,
      },
      {
        nama: "Villa Keluarga Merbabu",
        nama_kamar: "Villa Keluarga Merbabu",
        slug: "villa-keluarga-merbabu",
        deskripsi: "Villa luas untuk keluarga besar atau grup teman. 3 kamar tidur, 2 kamar mandi, ruang tamu besar, dapur lengkap, dan taman pribadi dengan gazebo. Kapasitas hingga 8 orang. Ideal untuk family gathering atau retreat grup.",
        deskripsi_singkat: "Villa 3 kamar untuk keluarga besar, taman pribadi, gazebo, kapasitas 8 orang",
        tipe: "villa",
        kapasitas_tamu: 8,
        kapasitas_dewasa: 8,
        jumlah_bed: 3,
        tipe_bed: "mixed",
        harga_per_malam: 1200000,
        harga_weekend: 1500000,
        fasilitas: ["wifi", "tv", "ac", "water_heater", "kitchen", "breakfast", "garden", "gazebo", "bbq", "parking"],
        is_active: true,
        status_aktif: true,
        is_popular: false,
      },
      {
        nama: "Kamar Cozy Standard",
        nama_kamar: "Kamar Cozy Standard",
        slug: "kamar-cozy-standard",
        deskripsi: "Kamar nyaman dan terjangkau dengan fasilitas lengkap. Tempat tidur double, kamar mandi dalam, dan ventilasi alami yang baik. Pilihan ideal untuk solo traveler atau pasangan dengan budget hemat.",
        deskripsi_singkat: "Kamar nyaman terjangkau, ideal untuk solo traveler atau pasangan budget hemat",
        tipe: "standard",
        kapasitas_tamu: 2,
        kapasitas_dewasa: 2,
        jumlah_bed: 1,
        tipe_bed: "double",
        harga_per_malam: 295000,
        harga_weekend: 350000,
        fasilitas: ["wifi", "water_heater", "parking"],
        is_active: true,
        status_aktif: true,
        is_popular: false,
      }
    ];

    const insertedRooms = [];
    
    for (const room of mockRooms) {
      // Check if room with the same slug already exists (or same name)
      const { data: existing } = await supabase
        .from("kamar")
        .select("id")
        .or(`slug.eq.${room.slug},nama_kamar.eq.${room.nama_kamar}`)
        .limit(1);

      if (existing && existing.length > 0) {
        continue; // skip if already exists
      }

      // Payload for new schema
      const payload: any = { ...room };

      const { data, error } = await supabase
        .from("kamar")
        .insert(payload)
        .select();

      if (error) {
        // Fallback payload for old schema
        const fallbackPayload: any = {
          nama_kamar: room.nama_kamar,
          harga_per_malam: room.harga_per_malam,
          kapasitas_dewasa: room.kapasitas_dewasa,
          deskripsi: room.deskripsi,
          fasilitas: room.fasilitas,
          status_aktif: room.status_aktif,
        };

        // If table has slug column, include it
        const { data: checkCols } = await supabase.from("kamar").select("*").limit(1);
        if (checkCols && checkCols.length > 0 && "slug" in checkCols[0]) {
          fallbackPayload.slug = room.slug;
        }

        const { data: fbData, error: fbError } = await supabase
          .from("kamar")
          .insert(fallbackPayload)
          .select();

        if (fbError) {
          console.error(`Failed to insert room fallback ${room.nama}:`, fbError.message);
        } else if (fbData) {
          insertedRooms.push(fbData[0]);
        }
      } else if (data) {
        insertedRooms.push(data[0]);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil migrasi ${insertedRooms.length} kamar ke database.`,
      inserted: insertedRooms,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
