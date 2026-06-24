import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { reason } = body;

    if (!id) {
      return NextResponse.json({ message: "ID Pesanan wajib diisi." }, { status: 400 });
    }

    // 1. Fetch current order with dynamic column discovery to handle both status and status_pembayaran
    const { data: sampleBooking } = await supabase.from("pesanan").select("*").limit(1);
    
    let availableCols: string[] = [];
    if (sampleBooking && sampleBooking.length > 0) {
      availableCols = Object.keys(sampleBooking[0]);
    } else {
      availableCols = ["id", "status", "status_pembayaran", "kode_pesanan"];
    }

    let colStatus = "status";
    if (availableCols.includes("status_pembayaran")) {
      colStatus = "status_pembayaran";
    }

    const { data: pesanan, error: fetchError } = await supabase
      .from("pesanan")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !pesanan) {
      return NextResponse.json({ message: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    const currentStatus = pesanan.status || pesanan.status_pembayaran || "pending";

    // 2. Check if cancellation is allowed
    // Only 'pending' or 'waiting_payment' orders can be cancelled publicly
    const cancellableStatuses = ["pending", "waiting_payment"];
    if (!cancellableStatuses.includes(currentStatus)) {
      return NextResponse.json(
        {
          message: `Pesanan dengan status '${currentStatus}' tidak dapat dibatalkan secara mandiri. Silakan hubungi admin.`,
        },
        { status: 400 }
      );
    }

    // 3. Perform cancellation dynamically (update both columns if they exist to keep them in sync!)
    const updatePayload: any = {
      cancelled_at: new Date().toISOString(),
      cancelled_reason: reason || "Dibatalkan oleh pemesan.",
    };
    if (availableCols.includes("status")) {
      updatePayload.status = "cancelled";
    }
    if (availableCols.includes("status_pembayaran")) {
      updatePayload.status_pembayaran = "cancelled";
    }

    const { data: updated, error: updateError } = await supabase
      .from("pesanan")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { message: "Gagal membatalkan pesanan.", error: updateError?.message },
        { status: 500 }
      );
    }

    // 4. Log the cancellation
    try {
      await supabase.from("pesanan_log").insert({
        pesanan_id: id,
        status_baru: "cancelled",
        keterangan: "Pesanan dibatalkan secara mandiri oleh pemesan.",
      });
    } catch (logErr) {
      console.warn("Failed to write log for cancellation:", logErr);
    }

    return NextResponse.json({
      success: true,
      message: `Pesanan ${pesanan.kode_pesanan} berhasil dibatalkan.`,
      data: updated,
    });
  } catch (err: any) {
    console.error("Internal server error in cancel-pesanan:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server.", error: err.message },
      { status: 500 }
    );
  }
}
