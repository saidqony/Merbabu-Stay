import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "ID Pesanan wajib diisi." }, { status: 400 });
    }

    // Try finding by UUID (id) first, then fallback to kode_pesanan (MBS-xxx)
    let query = supabase
      .from("pesanan")
      .select("*, kamar(*)");

    if (id.startsWith("MBS-")) {
      query = query.eq("kode_pesanan", id);
    } else {
      query = query.eq("id", id);
    }

    const { data: pesanan, error } = await query.single();

    if (error || !pesanan) {
      return NextResponse.json({ message: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: pesanan });
  } catch (err: any) {
    console.error("Internal server error in get-pesanan-details:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server.", error: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, cancelled_reason } = body;

    if (!id || !status) {
      return NextResponse.json(
        { message: "ID Pesanan dan Status baru wajib diisi." },
        { status: 400 }
      );
    }

    // Valid statuses
    const validStatuses = [
      "pending",
      "waiting_payment",
      "paid",
      "confirmed",
      "checked_in",
      "completed",
      "failed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Status pesanan tidak valid." }, { status: 400 });
    }

    // Discover columns dynamically to prevent PGRST204 errors on older schemas
    const { data: sampleBooking } = await supabase.from("pesanan").select("*").limit(1);
    let availableCols: string[] = [];
    if (sampleBooking && sampleBooking.length > 0) {
      availableCols = Object.keys(sampleBooking[0]);
    } else {
      availableCols = ["id", "status_pembayaran"];
    }

    const updatePayload: any = {};
    const setIfExist = (dbCol: string, value: any) => {
      if (availableCols.includes(dbCol)) {
        updatePayload[dbCol] = value;
      }
    };

    // Map status dynamically to whatever column is present
    if (availableCols.includes("status")) {
      updatePayload.status = status;
    } else if (availableCols.includes("status_pembayaran")) {
      updatePayload.status_pembayaran = status;
    }

    // Set other schema-dependent columns only if they exist in the database
    if (status === "cancelled") {
      setIfExist("cancelled_at", new Date().toISOString());
      setIfExist("cancelled_reason", cancelled_reason || "Dibatalkan oleh Admin");
    } else if (status === "paid") {
      setIfExist("paid_at", new Date().toISOString());
    } else if (status === "confirmed") {
      setIfExist("confirmed_at", new Date().toISOString());
    } else if (status === "checked_in") {
      setIfExist("checked_in_at", new Date().toISOString());
    } else if (status === "completed") {
      setIfExist("checked_out_at", new Date().toISOString());
    }

    const { data: updated, error } = await supabase
      .from("pesanan")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { message: "Gagal memperbarui status pesanan.", error: error?.message },
        { status: 500 }
      );
    }

    // Log status change
    try {
      await supabase.from("pesanan_log").insert({
        pesanan_id: id,
        status_baru: status,
        keterangan: `Status diubah oleh admin menjadi ${status}`,
      });
    } catch (logErr) {
      console.warn("Failed to insert pesanan_log:", logErr);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("Internal server error in update-pesanan:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server.", error: err.message },
      { status: 500 }
    );
  }
}
