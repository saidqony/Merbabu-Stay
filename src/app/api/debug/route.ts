import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const tablesToCheck = [
      "profiles",
      "users",
      "user_profiles",
      "tamu",
      "admin",
      "admin_users",
      "kamar_foto",
      "pesanan_log",
      "ketersediaan",
    ];

    const results: any = {};

    for (const table of tablesToCheck) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .limit(1);

      results[table] = {
        exists: !error || error.code !== "42P01",
        error: error ? { message: error.message, code: error.code } : null,
        hasData: data ? data.length > 0 : false,
        columns: data && data.length > 0 ? Object.keys(data[0]) : null,
      };
    }

    return NextResponse.json({
      success: true,
      tables: results,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
