import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project-id.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Warning: Supabase environment variables are missing. Using placeholder values for compilation/build phase. Please configure them in .env.local for full functionality.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function mapKamarRecord(record: any): any {
  if (!record) return null;
  const nama = record.nama || record.nama_kamar || "Kamar Tanpa Nama";
  const generatedSlug = nama
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  return {
    id: record.id,
    nama: nama,
    slug: record.slug || generatedSlug,
    deskripsi: record.deskripsi || null,
    deskripsi_singkat: record.deskripsi_singkat || null,
    tipe: record.tipe || "standard",
    kapasitas_tamu: record.kapasitas_tamu || record.kapasitas_dewasa || 2,
    jumlah_bed: record.jumlah_bed || 1,
    tipe_bed: record.tipe_bed || "double",
    harga_per_malam: Number(record.harga_per_malam || 0),
    harga_weekend: record.harga_weekend ? Number(record.harga_weekend) : null,
    fasilitas: Array.isArray(record.fasilitas) ? record.fasilitas : [],
    foto_utama: record.foto_utama || null,
    jumlah_foto: record.jumlah_foto || 0,
    is_active: record.is_active !== false && record.status_aktif !== false,
    is_popular: record.is_popular === true,
    meta_title: record.meta_title || null,
    meta_description: record.meta_description || null,
    created_at: record.created_at || "",
    updated_at: record.updated_at || "",
  };
}
