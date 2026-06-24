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

    // 1. Fetch current order status
    const { data: pesanan, error: fetchError } = await supabase
      .from("pesanan")
      .select("id, status, kode_pesanan")
      .eq("id", id)
      .single();

    if (fetchError || !pesanan) {
      return NextResponse.json({ message: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    // 2. Check if cancellation is allowed
    // Only 'pending' or 'waiting_payment' orders can be cancelled publicly
    const cancellableStatuses = ["pending", "waiting_payment"];
    if (!cancellableStatuses.includes(pesanan.status)) {
      return NextResponse.json(
        {
          message: `Pesanan dengan status '${pesanan.status}' tidak dapat dibatalkan secara mandiri. Silakan hubungi admin.`,
        },
        { status: 400 }
      );
    }

    // 3. Perform cancellation
    const { data: updated, error: updateError } = await supabase
      .from("pesanan")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancelled_reason: reason || "Dibatalkan oleh pemesan.",
      })
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
