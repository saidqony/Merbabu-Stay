import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kamar_id, check_in, check_out } = body;

    if (!kamar_id || !check_in || !check_out) {
      return NextResponse.json(
        { message: "Parameter kamar_id, check_in, dan check_out wajib diisi." },
        { status: 400 }
      );
    }

    const ciDate = new Date(check_in);
    const coDate = new Date(check_out);

    if (isNaN(ciDate.getTime()) || isNaN(coDate.getTime()) || coDate <= ciDate) {
      return NextResponse.json(
        { message: "Format tanggal tidak valid atau tanggal keluar sebelum tanggal masuk." },
        { status: 400 }
      );
    }

    // Safety check: If kamar_id is not a valid UUID (e.g. mock ID '4' or '1'),
    // return available: true immediately to prevent Supabase query UUID syntax casting errors.
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(kamar_id);
    if (!isUuid) {
      return NextResponse.json({ available: true });
    }

    // Direct query to find overlapping active bookings (bypassing outdated DB RPC functions)
    // Discover columns of 'pesanan' dynamically to handle both old and new schemas safely
    const { data: sampleBooking } = await supabase.from("pesanan").select("*").limit(1);
    
    let availableCols: string[] = [];
    if (sampleBooking && sampleBooking.length > 0) {
      availableCols = Object.keys(sampleBooking[0]);
    } else {
      // Fallback to old schema column names if table is empty
      availableCols = ["id", "kamar_id", "tgl_checkin", "tgl_checkout", "status_pembayaran"];
    }

    let colCheckIn = "check_in";
    let colCheckOut = "check_out";

    if (availableCols.includes("tgl_checkin")) colCheckIn = "tgl_checkin";
    if (availableCols.includes("tgl_checkout")) colCheckOut = "tgl_checkout";
    
    // Prefer 'status' if available (standard), otherwise fallback to 'status_pembayaran'
    const colStatus = availableCols.includes("status") ? "status" : "status_pembayaran";

    // Build the query dynamically
    let query = supabase.from("pesanan").select("id").eq("kamar_id", kamar_id);

    // Filter out failed/cancelled/completed bookings (case-insensitive checks to handle both lowercase and uppercase variants in DB)
    query = query
      .neq(colStatus, "failed")
      .neq(colStatus, "cancelled")
      .neq(colStatus, "completed")
      .neq(colStatus, "FAILED")
      .neq(colStatus, "CANCELLED")
      .neq(colStatus, "COMPLETED");

    // Overlapping dates logic: check-in < p_check_out AND check-out > p_check_in
    query = query.lt(colCheckIn, check_out).gt(colCheckOut, check_in);

    const { data: overlappingBookings, error } = await query;

    if (error) {
      console.error("Error checking availability:", error);
      return NextResponse.json(
        { message: "Gagal memeriksa ketersediaan kamar.", error: error.message },
        { status: 500 }
      );
    }

    // Fetch the room details to get the inventory limit
    let limit = 1;
    try {
      const { data: room } = await supabase
        .from("kamar")
        .select("*")
        .eq("id", kamar_id)
        .single();
      
      if (room) {
        limit = room.jumlah_kamar || room.stok || 1;
      }
    } catch (roomErr) {
      console.warn("Failed to fetch room inventory limit, defaulting to 1:", roomErr);
    }

    const isAvailable = !overlappingBookings || overlappingBookings.length < limit;

    return NextResponse.json({ available: isAvailable });
  } catch (err: any) {
    console.error("Internal server error in check-availability:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server.", error: err.message },
      { status: 500 }
    );
  }
}
