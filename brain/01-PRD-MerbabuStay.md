# Product Requirements Document (PRD)

## MerbabuStay - Platform Pemesanan Homestay

---

## 1. Ringkasan Produk

| Atribut | Deskripsi |
|---------|-----------|
| **Nama Produk** | MerbabuStay |
| **Kategori** | Platform Pemesanan Homestay Online |
| **Target Pengguna** | Wisatawan lokal dan mancanegara yang mencari penginapan di kawasan Gunung Merbabu |
| **Platform** | Web Application (Responsive Desktop & Mobile) |
| **Tech Stack** | Next.js 14, TypeScript, Tailwind CSS, Supabase, Duitku, Resend, Telegram Bot API |

---

## 2. Visi & Tujuan Produk

### Visi
Menjadi platform pemesanan homestay terdepan di kawasan Gunung Merbabu yang menyediakan pengalaman booking seamless, aman, dan terintegrasi dengan layanan lokal terbaik.

### Tujuan Utama
1. **MVP (Minimum Viable Product)** - Menyediakan platform booking homestay fungsional dengan alur pemesanan end-to-end dalam 4-6 minggu
2. **Konversi** - Mencapai tingkat konversi pemesanan >15% dari total pengunjung landing page
3. **Otomatisasi** - Mengurangi intervensi manual admin melalui otomatisasi notifikasi, invoice, dan konfirmasi pembayaran
4. **Kepercayaan** - Membangun kepercayaan pengguna melalui transparansi harga, ketersediaan real-time, dan keamanan pembayaran

---

## 3. Target Pengguna (User Persona)

| Persona | Karakteristik | Pain Points | Kebutuhan |
|---------|--------------|-------------|-----------|
| **Wisatawan Weekend** | Usia 25-35, kota besar, mencari escape singkat | Sulit menemukan homestay bersih & terjangkau; takut ditipu | Booking cepat, foto real, harga transparan |
| **Pendaki Merbabu** | Usia 20-30, komunitas outdoor, budget conscious | Butuh tempat istirahat pre/post hiking dekat basecamp | Lokasi strategis, early check-in, fasilitas pendaki |
| **Keluarga Liburan** | Usia 30-50, berkelompok 4-8 orang | Butuh banyak kamar, dapur, area bersama | Homestay full house, fasilitas lengkap, nego harga grup |
| **Foreign Tourist** | Backpacker Eropa/Australia, menginap 2-3 malam | Language barrier, payment difficulty, trust issues | English support, secure online payment, reviews |

---

## 4. Core Features (MVP)

### 4.1 Landing Page & Discovery
| Fitur | Prioritas | Deskripsi |
|-------|-----------|-----------|
| **Hero Section** | P0 | Headline menarik, background visual Gunung Merbabu, CTA booking |
| **Daftar Kamar (Grid Card)** | P0 | Tampilan card kamar dengan foto, nama, harga/malam, kapasitas, rating |
| **Filter & Sort** | P1 | Filter berdasarkan harga, kapasitas, fasilitas; sort by harga/rating |
| **Detail Kamar** | P0 | Halaman detail dengan foto gallery, deskripsi lengkap, fasilitas, kalender ketersediaan |

### 4.2 Booking & Checkout
| Fitur | Prioritas | Deskripsi |
|-------|-----------|-----------|
| **Cart/Booking Form** | P0 | Form pemesanan: nama, email, no. HP, tanggal check-in/out, jumlah tamu |
| **Ketersediaan Real-time** | P0 | Cek ketersediaan kamar berdasarkan tanggal (integrasi Supabase) |
| **Ringkasan Pesanan** | P0 | Review pesanan: detail kamar, tanggal, durasi, total harga, biaya tambahan |
| **Kode Promo** | P2 | Input diskon/promo code |

### 4.3 Pembayaran (Duitku Integration)
| Fitur | Prioritas | Deskripsi |
|-------|-----------|-----------|
| **Multiple Payment Methods** | P0 | Transfer Bank (VA), E-Wallet (OVO, DANA, GoPay, ShopeePay), QRIS |
| **Payment Gateway Flow** | P0 | Generate payment URL → Redirect Duitku → Callback/Return → Update status |
| **Timeout Handling** | P1 | Expiry pembayaran 24 jam, auto-cancel jika tidak dibayar |
| **Retry Payment** | P2 | Fitur bayar ulang untuk pesanan pending |

### 4.4 Manajemen Pesanan
| Fitur | Prioritas | Deskripsi |
|-------|-----------|-----------|
| **Status Tracking** | P0 | Status: Pending → Waiting Payment → Paid → Confirmed → Checked-in → Completed |
| **Riwayat Pesanan** | P1 | Halaman daftar pesanan pengguna |
| **Reschedule Request** | P2 | Permintaan ubah tanggal menginap |

### 4.5 Notifikasi & Komunikasi
| Fitur | Prioritas | Deskripsi |
|-------|-----------|-----------|
| **Email Invoice (Resend)** | P0 | Email konfirmasi pemesanan + invoice PDF setelah pembayaran sukses |
| **Telegram Admin Alert** | P0 | Notifikasi real-time ke grup Telegram admin untuk setiap pesanan baru |
| **Email Status Updates** | P1 | Email update status pesanan (confirmed, cancelled, reminder check-in) |

### 4.6 Admin Dashboard (Minimal)
| Fitur | Prioritas | Deskripsi |
|-------|-----------|-----------|
| **Login Admin** | P0 | Autentikasi admin sederhana |
| **Manajemen Kamar** | P0 | CRUD kamar: tambah, edit, hapus, atur ketersediaan |
| **Daftar Pesanan** | P0 | Lihat semua pesanan, update status, filter by date/status |
| **Notifikasi Telegram** | P0 | Setup bot Telegram untuk menerima alert |

---

## 5. Non-Functional Requirements

| Aspek | Requirement |
|-------|-------------|
| **Performance** | First Contentful Paint < 1.5s, Time to Interactive < 3s |
| **Responsive** | Mobile-first design, breakpoint: sm(640px), md(768px), lg(1024px), xl(1280px) |
| **SEO** | Meta tags dinamis, structured data (JSON-LD), Open Graph image, sitemap.xml |
| **Security** | Input validation, SQL injection prevention (Supabase RLS), HTTPS, secure payment flow |
| **Availability** | Uptime target 99.5%, backup database otomatis |
| **i18n** | Bahasa Indonesia (primary), English (secondary) |

---

## 6. KPI & Metrik Sukses

| Metrik | Target | Cara Ukur |
|--------|--------|-----------|
| **Conversion Rate** | >15% | Pesanan sukses / Total visitor landing page |
| **Payment Success Rate** | >85% | Pembayaran sukses / Total checkout initiated |
| **Page Load Time** | <2s | Lighthouse Performance Score >90 |
| **Bounce Rate** | <40% | Google Analytics / Plausible |
| **Customer Satisfaction** | >4.5/5 | Post-stay survey via email/WhatsApp |

---

## 7. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Duitku callback gagal | Status pembayaran tidak update | Implement polling + manual reconciliation di admin |
| Double booking | 2 user booking kamar sama di waktu bersamaan | Database transaction + row-level locking di Supabase |
| Spam booking | Banyak pesanan palsu | Rate limiting, CAPTCHA, validasi email/no.HP |
| Telegram bot down | Admin tidak terima notifikasi | Fallback: email ke admin sebagai backup notifikasi |

---

## 8. Timeline MVP (6 Minggu)

| Fase | Durasi | Deliverable |
|------|--------|-------------|
| **Week 1** | Planning & Setup | Finalisasi desain, setup project Next.js + Supabase, struktur database |
| **Week 2** | Core Frontend | Landing page, daftar kamar, detail kamar, booking form |
| **Week 3** | Backend & DB | API routes, Supabase integration, ketersediaan kamar, booking logic |
| **Week 4** | Payment Integration | Duitku sandbox integration, callback handling, status management |
| **Week 5** | Notifications | Resend email setup, Telegram bot, invoice template |
| **Week 6** | Testing & Deploy | UAT, bug fixing, production deploy, monitoring setup |

---

*Dokumen ini akan di-review dan diupdate setiap sprint secara berkala.*

**Prepared by:** Lead Product Manager  
**Date:** Juni 2026  
**Version:** 1.0 (MVP)
