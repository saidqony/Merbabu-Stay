import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orderId = searchParams.get("order_id") || "";

    if (!orderId) {
      return NextResponse.json({ message: "Parameter order_id wajib diisi." }, { status: 400 });
    }

    // Try finding by UUID first, then fallback to kode_pesanan
    let query = supabase.from("pesanan").select("*");
    
    if (orderId.startsWith("MBS-")) {
      query = query.eq("kode_pesanan", orderId);
    } else {
      query = query.eq("id", orderId);
    }

    const { data: pesanan, error } = await query.single();

    if (error || !pesanan) {
      return NextResponse.json({ message: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: pesanan.status || pesanan.status_pembayaran,
      payment_url: pesanan.payment_url,
    });
  } catch (err: any) {
    console.error("Error in check-payment-status API:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server.", error: err.message },
      { status: 500 }
    );
  }
}
