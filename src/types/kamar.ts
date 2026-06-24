export interface Kamar {
  id: string;
  nama: string;
  slug: string;
  deskripsi: string | null;
  deskripsi_singkat: string | null;
  tipe: "standard" | "deluxe" | "family" | "villa";
  kapasitas_tamu: number;
  jumlah_bed: number;
  tipe_bed: string;
  harga_per_malam: number;
  harga_weekend: number | null;
  fasilitas: string[];
  foto_utama: string | null;
  jumlah_foto: number;
  is_active: boolean;
  is_popular: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface KamarFoto {
  id: string;
  kamar_id: string;
  url_foto: string;
  caption: string | null;
  urutan: number;
  is_primary: boolean;
  created_at: string;
}

/** Badge display config for room cards */
export interface KamarBadge {
  text: string;
  bgColor: string;
}

/** Props for the RoomCard component */
export interface RoomCardProps {
  kamar: Kamar;
  badge?: KamarBadge;
}
