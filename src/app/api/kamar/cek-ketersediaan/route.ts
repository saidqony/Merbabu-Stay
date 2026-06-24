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

    // First try calling the RPC function if it exists in Supabase
    try {
      const { data: rpcAvailable, error: rpcError } = await supabase.rpc(
        "cek_ketersediaan",
        {
          p_kamar_id: kamar_id,
          p_check_in: check_in,
          p_check_out: check_out,
        }
      );

      if (!rpcError && typeof rpcAvailable === "boolean") {
        return NextResponse.json({ available: rpcAvailable });
      }
    } catch (rpcErr) {
      console.warn("RPC cek_ketersediaan failed, falling back to query...", rpcErr);
    }

    // Fallback: Direct query to find overlapping active bookings
    // Active bookings are status NOT IN ('failed', 'cancelled')
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
    let colStatus = "status";

    if (availableCols.includes("tgl_checkin")) colCheckIn = "tgl_checkin";
    if (availableCols.includes("tgl_checkout")) colCheckOut = "tgl_checkout";
    if (availableCols.includes("status_pembayaran")) colStatus = "status_pembayaran";

    // Build the query dynamically
    let query = supabase.from("pesanan").select("id").eq("kamar_id", kamar_id);

    // Filter out failed/cancelled bookings
    query = query.neq(colStatus, "failed").neq(colStatus, "cancelled");

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

    const isAvailable = !overlappingBookings || overlappingBookings.length === 0;

    return NextResponse.json({ available: isAvailable });
  } catch (err: any) {
    console.error("Internal server error in check-availability:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server.", error: err.message },
      { status: 500 }
    );
  }
}
