/**
 * Format number to Indonesian Rupiah string
 * e.g. 425000 → "Rp 425.000"
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO date string to Indonesian locale
 * e.g. "2026-06-26" → "Kamis, 26 Juni 2026"
 */
export function formatTanggal(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Format ISO date string to short format
 * e.g. "2026-06-26" → "26 Jun 2026"
 */
export function formatTanggalShort(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Calculate number of nights between two dates
 */
export function hitungMalam(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Validate Indonesian phone number format (+62 or 08)
 */
export function isValidPhoneIndonesia(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().]/g, "");
  return /^(\+62|62|0)8[1-9]\d{7,11}$/.test(cleaned);
}

/**
 * Map facility key to human-readable label with emoji
 */
export const FASILITAS_MAP: Record<string, { label: string; icon: string }> = {
  wifi: { label: "WiFi", icon: "📶" },
  tv: { label: "TV", icon: "📺" },
  smart_tv: { label: "Smart TV", icon: "📺" },
  ac: { label: "AC", icon: "❄️" },
  water_heater: { label: "Air Panas", icon: "🚿" },
  breakfast: { label: "Sarapan", icon: "🍳" },
  parking: { label: "Parkir", icon: "🅿️" },
  mountain_view: { label: "View Gunung", icon: "🏔️" },
  balcony: { label: "Balkon", icon: "🌅" },
  kitchen: { label: "Dapur", icon: "🍳" },
  garden: { label: "Taman", icon: "🌿" },
  gazebo: { label: "Gazebo", icon: "🏡" },
  bbq: { label: "BBQ Area", icon: "🔥" },
  minibar: { label: "Minibar", icon: "🥤" },
  bathtub: { label: "Bathtub", icon: "🛁" },
};

/**
 * Get badge config for a room based on its properties
 */
export function getRoomBadge(
  kamar: { is_popular: boolean; tipe: string }
): { text: string; bgColor: string } | undefined {
  if (kamar.is_popular) {
    return { text: "Populer", bgColor: "#C4956A" };
  }
  if (kamar.tipe === "villa") {
    return { text: "Family", bgColor: "#5C6B52" };
  }
  if (kamar.tipe === "deluxe") {
    return { text: "Best View", bgColor: "#7A8B6F" };
  }
  return undefined;
}

/**
 * Generate a slug from Indonesian text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * cn — Merge class names (simple version without clsx dependency)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
