import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createDuitkuPayment } from "@/lib/duitku/client";
import { hitungMalam } from "@/lib/utils";

// Generate a clean, unique booking code: MBS-YYYYMMDD-XXXX
function generateBookingCode(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MBS-${year}${month}${day}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      kamar_id,
      nama_lengkap,
      email,
      no_hp,
      catatan,
      check_in,
      check_out,
      jumlah_tamu,
      payment_method,
    } = body;

    // 1. Validation
    if (!kamar_id || !nama_lengkap || !email || !no_hp || !check_in || !check_out) {
      return NextResponse.json(
        { message: "Semua field bertanda bintang (*) wajib diisi." },
        { status: 400 }
      );
    }

    const ciDate = new Date(check_in);
    const coDate = new Date(check_out);

    if (isNaN(ciDate.getTime()) || isNaN(coDate.getTime()) || coDate <= ciDate) {
      return NextResponse.json(
        { message: "Tanggal check-in atau check-out tidak valid." },
        { status: 400 }
      );
    }

    // Safety check: Validate if kamar_id is a valid UUID before querying Supabase to prevent casting errors
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(kamar_id);
    if (!isUuid) {
      return NextResponse.json(
        { message: "Kamar tidak ditemukan atau ID kamar tidak valid." },
        { status: 404 }
      );
    }

    // 2. Fetch room details to check capacity and price
    const { data: room, error: roomError } = await supabase
      .from("kamar")
      .select("*")
      .eq("id", kamar_id)
      .maybeSingle(); // Use maybeSingle to prevent throwing exception if not found

    if (roomError || !room) {
      return NextResponse.json(
        { message: "Kamar tidak ditemukan." },
        { status: 404 }
      );
    }

    if (jumlah_tamu > room.kapasitas_tamu) {
      return NextResponse.json(
        { message: `Jumlah tamu melebihi kapasitas kamar (${room.kapasitas_tamu} orang).` },
        { status: 400 }
      );
    }

    // 3. Discover columns of 'pesanan' dynamically to handle both old and new schemas safely
    const { data: sampleBooking } = await supabase.from("pesanan").select("*").limit(1);
    
    let availableCols: string[] = [];
    if (sampleBooking && sampleBooking.length > 0) {
      availableCols = Object.keys(sampleBooking[0]);
    } else {
      // Fallback list of common columns if table is empty
      availableCols = [
        "id", "user_id", "kamar_id", "tgl_checkin", "tgl_checkout", 
        "total_harga", "status_pembayaran", "payment_url", "duitku_reference", "created_at"
      ];
    }

    let colCheckIn = "check_in";
    let colCheckOut = "check_out";
    let colStatus = "status";

    if (availableCols.includes("tgl_checkin")) colCheckIn = "tgl_checkin";
    if (availableCols.includes("tgl_checkout")) colCheckOut = "tgl_checkout";
    if (availableCols.includes("status_pembayaran")) colStatus = "status_pembayaran";

    // 4. Double booking prevention (Availability check) using dynamic columns
    const { data: overlapping } = await supabase
      .from("pesanan")
      .select("id")
      .eq("kamar_id", kamar_id)
      .neq(colStatus, "failed")
      .neq(colStatus, "cancelled")
      .lt(colCheckIn, check_out)
      .gt(colCheckOut, check_in);

    if (overlapping && overlapping.length > 0) {
      return NextResponse.json(
        { message: "Kamar sudah dipesan oleh orang lain pada tanggal tersebut." },
        { status: 400 }
      );
    }

    // 5. Calculate pricing
    const nights = hitungMalam(check_in, check_out);
    let totalHarga = 0;
    const tempDate = new Date(check_in);
    
    for (let i = 0; i < nights; i++) {
      const day = tempDate.getDay();
      const isWeekend = day === 5 || day === 6; // Friday and Saturday nights
      const rate = (isWeekend && room.harga_weekend) ? room.harga_weekend : room.harga_per_malam;
      totalHarga += rate;
      tempDate.setDate(tempDate.getDate() + 1);
    }

    const kodePesanan = generateBookingCode();
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 30); // 30 minutes to pay

    // 6. Build initial pending booking payload dynamically based on available columns
    const insertPayload: any = {};
    
    const setIfExist = (dbCol: string, value: any) => {
      if (availableCols.includes(dbCol)) {
        insertPayload[dbCol] = value;
      }
    };

    // Map fields dynamically
    insertPayload[colCheckIn] = check_in;
    insertPayload[colCheckOut] = check_out;
    insertPayload[colStatus] = "pending";
    insertPayload.kamar_id = kamar_id;

    // Optional/Schema-dependent fields
    setIfExist("kode_pesanan", kodePesanan);
    setIfExist("nama_lengkap", nama_lengkap);
    setIfExist("email", email);
    setIfExist("no_hp", no_hp);
    setIfExist("catatan", catatan || null);
    setIfExist("jumlah_tamu", jumlah_tamu);
    setIfExist("jumlah_malam", nights);
    setIfExist("harga_per_malam", room.harga_per_malam);
    setIfExist("total_harga", totalHarga);
    setIfExist("total_bayar", totalHarga);
    setIfExist("expired_at", expiredAt.toISOString());

    const { data: pesanan, error: insertError } = await supabase
      .from("pesanan")
      .insert(insertPayload)
      .select()
      .single();

    if (insertError || !pesanan) {
      console.error("Failed to insert booking:", insertError);
      return NextResponse.json(
        { message: "Gagal membuat pesanan di database.", error: insertError?.message },
        { status: 500 }
      );
    }

    // 6. Create payment in Duitku
    let paymentUrl = "";
    let reference = "";

    try {
      const duitkuRes = await createDuitkuPayment({
        merchantOrderId: pesanan.id,
        amount: totalHarga,
        productDetails: `Booking ${room.nama_kamar || room.nama || "Kamar"} (${nights} malam)`,
        email: email,
        noHp: no_hp,
        namaLengkap: nama_lengkap,
        paymentMethod: payment_method || "NQ",
      });

      if (duitkuRes && duitkuRes.paymentUrl) {
        paymentUrl = duitkuRes.paymentUrl;
        reference = duitkuRes.reference;
      } else {
        throw new Error(duitkuRes.statusMessage || "Invalid Duitku response");
      }
    } catch (duitkuErr: any) {
      console.error("Duitku integration failed:", duitkuErr);
      
      // Update status to failed dynamically since gateway could not be contacted
      const failPayload: any = {};
      failPayload[colStatus] = "failed";
      await supabase
        .from("pesanan")
        .update(failPayload)
        .eq("id", pesanan.id);

      return NextResponse.json(
        { message: "Gagal menghubungkan ke gateway pembayaran Duitku.", error: duitkuErr.message },
        { status: 502 }
      );
    }

    // 7. Update booking with Duitku payment details dynamically
    const updatePayload: any = {
      payment_url: paymentUrl,
      duitku_reference: reference,
    };
    updatePayload[colStatus] = "waiting_payment";

    const { error: updateError } = await supabase
      .from("pesanan")
      .update(updatePayload)
      .eq("id", pesanan.id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update booking with payment details:", updateError);
    }

    return NextResponse.json({
      success: true,
      kode_pesanan: kodePesanan,
      payment_url: paymentUrl,
      expired_at: expiredAt.toISOString(),
      booking_id: pesanan.id,
    });
  } catch (err: any) {
    console.error("Internal server error in create-pesanan:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server.", error: err.message },
      { status: 500 }
    );
  }
}
