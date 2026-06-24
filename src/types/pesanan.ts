export type PesananStatus =
  | "pending"
  | "waiting_payment"
  | "paid"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "failed"
  | "cancelled";

export interface Pesanan {
  id: string;
  kode_pesanan: string;
  kamar_id: string;
  nama_lengkap: string;
  email: string;
  no_hp: string;
  catatan: string | null;
  check_in: string;
  check_out: string;
  jumlah_tamu: number;
  jumlah_malam: number;
  harga_per_malam: number;
  total_harga: number;
  kode_promo: string | null;
  diskon: number;
  total_bayar: number;
  status: PesananStatus;
  duitku_reference: string | null;
  duitku_merchant_order_id: string | null;
  payment_url: string | null;
  payment_method: string | null;
  payment_method_name: string | null;
  paid_at: string | null;
  expired_at: string;
  confirmed_at: string | null;
  confirmed_by: string | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  cancelled_at: string | null;
  cancelled_reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

/** Data required to create a new booking */
export interface CreatePesananPayload {
  kamar_id: string;
  nama_lengkap: string;
  email: string;
  no_hp: string;
  catatan?: string;
  check_in: string;
  check_out: string;
  jumlah_tamu: number;
}

export interface PesananLog {
  id: string;
  pesanan_id: string;
  status_lama: string | null;
  status_baru: string;
  keterangan: string | null;
  changed_by: string | null;
  created_at: string;
}
