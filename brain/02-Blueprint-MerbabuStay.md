# Blueprint Sistem - Alur Perjalanan Pengguna

## MerbabuStay - Platform Pemesanan Homestay

---

## 1. Overview Arsitektur Alur

Dokumen ini menggambarkan alur perjalanan pengguna (User Journey) end-to-end dari pertama kali mengunjungi website MerbabuStay hingga menerima konfirmasi pemesanan. Setiap langkah mencakup interaksi antara **User**, **Frontend (Next.js)**, **Backend API**, **Database (Supabase)**, dan **External Services (Duitku, Resend, Telegram)**.

---

## 2. User Journey Map - End to End Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY - MERBABUSTAY                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │  STEP 1  │───▶│  STEP 2  │───▶│  STEP 3  │───▶│  STEP 4  │───▶│  STEP 5  │      │
│  │ Discover │    │  Select  │    │  Detail  │    │ Checkout │    │ Payment  │      │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│                                                                                      │
│       │                │                │                │                │        │
│       ▼                ▼                ▼                ▼                ▼        │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │  STEP 6  │───▶│  STEP 7  │───▶│  STEP 8  │───▶│  STEP 9  │───▶│ STEP 10  │      │
│  │ Callback │    │  Notify  │    │  Invoice │    │  Admin   │    │ Complete │      │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detail Alur per Step

---

### STEP 1: DISCOVER - Landing Page Entry

**Trigger:** User mengakses `https://merbabustay.id`

| No | Aksi | Aktor | Detail Teknis |
|----|------|-------|---------------|
| 1.1 | User membuka website | User | Browser mengirim request ke server Next.js |
| 1.2 | Server render landing page | Next.js SSR | `app/page.tsx` dirender dengan data kamar dari Supabase |
| 1.3 | Fetch daftar kamar tersedia | Next.js ▶ Supabase | Query: `SELECT * FROM kamar WHERE is_active = true ORDER BY harga ASC` |
| 1.4 | Tampilkan Hero Section + Grid Kamar | Browser | Komponen: `<HeroSection />` + `<RoomGrid />` |

**Validasi:**
- [ ] Landing page load < 1.5 detik
- [ ] Minimal 3 kamar ditampilkan
- [ ] Gambar kamar lazy-loaded dengan blur placeholder

**Output:** User melihat halaman utama dengan daftar kamar

---

### STEP 2: SELECT - Memilih Kamar

**Trigger:** User mengklik card kamar atau tombol "Lihat Detail"

| No | Aksi | Aktor | Detail Teknis |
|----|------|-------|---------------|
| 2.1 | User klik card kamar | User | Event: `onClick` navigasi ke `/kamar/[slug]` |
| 2.2 | Route ke halaman detail | Next.js | Dynamic routing: `app/kamar/[slug]/page.tsx` |
| 2.3 | Fetch detail kamar + galeri foto | Next.js ▶ Supabase | Query: `SELECT * FROM kamar WHERE slug = $1` + `SELECT * FROM kamar_foto WHERE kamar_id = $1` |
| 2.4 | Fetch ketersediaan tanggal | Next.js ▶ Supabase | Query cek booking bertabrakan: `SELECT * FROM pesanan WHERE kamar_id = $1 AND status IN ('confirmed','paid') AND (check_in <= $checkout AND check_out >= $checkin)` |
| 2.5 | Render halaman detail | Browser | Komponen: `<RoomGallery />`, `<RoomInfo />`, `<BookingWidget />`, `<RoomFacilities />` |

**Validasi:**
- [ ] Galeri foto navigable (prev/next, thumbnail)
- [ ] Kalender menunjukkan tanggal yang sudah dibooking (disabled)
- [ ] Harga terupdate real-time berdasarkan durasi menginap

**Output:** User melihat detail lengkap kamar dan dapat memilih tanggal menginap

---

### STEP 3: DETAIL - Memilih Tanggal & Jumlah Tamu

**Trigger:** User memilih tanggal check-in, check-out, dan jumlah tamu di Booking Widget

| No | Aksi | Aktor | Detail Teknis |
|----|------|-------|---------------|
| 3.1 | User pilih tanggal check-in | User | Komponen: `<DatePicker />` dengan validasi minDate = today |
| 3.2 | User pilih tanggal check-out | User | Validasi: check-out > check-in, max stay = 14 hari |
| 3.3 | User input jumlah tamu | User | Validasi: 1 ≤ tamu ≤ kapasitas maksimal kamar |
| 3.4 | Kalkulasi total harga otomatis | Next.js (Client) | Formula: `total_harga = harga_per_malam × jumlah_malam` |
| 3.5 | Validasi ketersediaan real-time | Next.js ▶ Supabase | API call: `POST /api/kamar/cek-ketersediaan` - cek apakah tanggal masih available |
| 3.6 | User klik "Pesan Sekarang" | User | Trigger: navigasi ke halaman checkout |

**Business Rules:**
```
IF jumlah_malam < 1 → Error: "Minimal menginap 1 malam"
IF tamu > kapasitas → Error: "Maksimal [X] tamu untuk kamar ini"
IF tanggal sudah dibooking → Error: "Tanggal tidak tersedia, silakan pilih tanggal lain"
```

**Output:** Data pesanan tersimpan di state, user diarahkan ke checkout

---

### STEP 4: CHECKOUT - Mengisi Data Pemesan

**Trigger:** User tiba di halaman `/checkout`

| No | Aksi | Aktor | Detail Teknis |
|----|------|-------|---------------|
| 4.1 | Render halaman checkout | Next.js SSR | Komponen: `<CheckoutPage />` menerima data dari URL params atau session storage |
| 4.2 | Tampilkan ringkasan pesanan | Browser | Detail: nama kamar, tanggal, durasi, harga/malam, total |
| 4.3 | User mengisi form pemesan | User | Field: nama_lengkap, email, no_hp, catatan (opsional) |
| 4.4 | Validasi form real-time | Next.js (Client) | Email valid format, no_hp minimal 10 digit |
| 4.5 | User klik "Bayar Sekarang" | User | Submit form, trigger pembuatan pesanan |

**Form Fields:**
```
nama_lengkap  : String, required, min 3 karakter
email         : String, required, format email valid
no_hp         : String, required, min 10 digit, format Indonesia (+62/08)
catatan       : Text, optional, max 500 karakter
```

---

### STEP 5: PAYMENT - Pemrosesan Pembayaran via Duitku

**Trigger:** Form checkout valid, sistem membuat pesanan dan mengarahkan ke pembayaran

#### 5A. Create Order (Server Side)
```
User ──▶ Next.js API ──▶ Supabase ──▶ Duitku API
         (api/pesanan)   (INSERT)      (Sandbox/Prod)
```

| No | Aksi | Aktor | Detail Teknis |
|----|------|-------|---------------|
| 5.1 | API menerima data checkout | Next.js API Route | `POST /api/pesanan` - validasi lengkap |
| 5.2 | Generate kode pesanan unik | Next.js | Format: `MBS-YYYYMMDD-XXXX` (random 4 digit) |
| 5.3 | Simpan pesanan ke database | Next.js ▶ Supabase | `INSERT INTO pesanan` dengan status = 'pending' |
| 5.4 | Panggil Duitku API | Next.js ▶ Duitku | `POST /api/merchant/v2/inquiry` dengan payload: merchantCode, amount, merchantOrderId, productDetails, email, callbackUrl, returnUrl, signature |
| 5.5 | Terima response Duitku | Duitku ▶ Next.js | Response: `reference`, `paymentUrl`, `vaNumber`, `amount`, `statusCode` |
| 5.6 | Update pesanan dengan reference | Next.js ▶ Supabase | `UPDATE pesanan SET duitku_reference = $reference, payment_url = $url, status = 'waiting_payment'` |

#### 5B. Redirect User ke Pembayaran
| No | Aksi | Aktor | Detail Teknis |
|----|------|-------|---------------|
| 5.7 | Redirect ke Duitku Payment Page | Next.js | `window.location.href = paymentUrl` |
| 5.8 | User melihat halaman pembayaran Duitku | User | Duitku UI: pilih metode pembayaran (VA, E-Wallet, QRIS) |
| 5.9 | User menyelesaikan pembayaran | User | Bayar sesuai instruksi (transfer, scan QRIS, dll) |

**Duitku Request Payload:**
```json
{
  "merchantCode": "DXXXX",
  "paymentAmount": 850000,
  "merchantOrderId": "MBS-20260624-7842",
  "productDetails": "Homestay Merbabu - Kamar Pemandangan Gunung (2 malam)",
  "email": "budi@email.com",
  "callbackUrl": "https://merbabustay.id/api/payment/callback",
  "returnUrl": "https://merbabustay.id/pesanan/sukses?order_id=MBS-20260624-7842",
  "signature": "sha256(merchantCode+merchantOrderId+paymentAmount+apiKey)"
}
```

---

### STEP 6: CALLBACK - Konfirmasi Pembayaran dari Duitku

**Trigger:** Duitku mengirim callback setelah user berhasil/tidak berhasil membayar

```
Duitku ──▶ Next.js API ──▶ Supabase ──▶ Resend ──▶ Telegram
           (callback)      (UPDATE)     (Email)     (Bot)
```

| No | Aksi | Aktor | Detail Teknis |
|----|------|-------|---------------|
| 6.1 | Duitku kirim callback | Duitku ▶ Next.js | `POST /api/payment/callback` dengan payload status pembayaran |
| 6.2 | Verifikasi signature | Next.js | SHA256 hash validation untuk memastikan callback authentic |
| 6.3 | Cek status pembayaran | Next.js | IF `resultCode = 00` → Sukses, ELSE → Gagal/Pending |
| 6.4 | Update status pesanan | Next.js ▶ Supabase | `UPDATE pesanan SET status = 'paid', paid_at = NOW(), payment_method = $method WHERE duitku_reference = $ref` |
| 6.5 | [PARALLEL] Kirim email invoice | Next.js ▶ Resend | Trigger: `POST resend.com/emails` dengan template invoice HTML |
| 6.6 | [PARALLEL] Kirim notifikasi Telegram | Next.js ▶ Telegram | `POST api.telegram.org/bot{token}/sendMessage` ke grup admin |

**Duitku Callback Payload:**
```json
{
  "merchantCode": "DXXXX",
  "amount": "850000",
  "merchantOrderId": "MBS-20260624-7842",
  "productDetail": "Homestay Merbabu - Kamar Pemandangan Gunung (2 malam)",
  "additionalParam": "",
  "resultCode": "00",
  "reference": "D1234567890",
  "signature": "xxx"
}
```

---

### STEP 7: NOTIFY - Notifikasi ke User

**Trigger:** Status pesanan berubah menjadi 'paid'

#### 7A. Email Invoice (Resend)
| No | Aksi | Aktor | Detail Teknis |
|----|------|-------|---------------|
| 7.1 | Generate HTML invoice | Next.js | Template email dengan data: kode pesanan, detail kamar, tanggal, total, metode pembayaran |
| 7.2 | Kirim email via Resend | Next.js ▶ Resend | `POST https://api.resend.com/emails` dengan: from, to, subject, html |
| 7.3 | Email diterima user | Resend ▶ User | Email tiba di inbox dalam < 2 menit |

**Email Template Structure:**
```
Subject: 🏔️ Pesanan Confirmed - MBS-20260624-7842 | MerbabuStay

┌─────────────────────────────────────┐
│         MERBABUSTAY INVOICE         │
├─────────────────────────────────────┤
│ Kode Pesanan: MBS-20260624-7842     │
│ Status: ✅ PAID                      │
│                                     │
│ Detail Kamar:                       │
│ Kamar Pemandangan Gunung            │
│ 2 Dewasa • 2 Malam                  │
│                                     │
│ Check-in:  Kamis, 26 Juni 2026      │
│ Check-out: Sabtu, 28 Juni 2026      │
│                                     │
│ Rincian Pembayaran:                 │
│ Harga/malam        Rp 425.000 x 2   │
│ ─────────────────────────────────   │
│ Total              Rp 850.000       │
│ Dibayar via        QRIS             │
│                                     │
│ [Lihat Detail Pesanan] (CTA Button) │
└─────────────────────────────────────┘
```

---

### STEP 8: ADMIN ALERT - Notifikasi ke Admin via Telegram

**Trigger:** Pesanan baru dengan status 'paid'

| No | Aksi | Aktor | Detail Teknis |
|----|------|-------|---------------|
| 8.1 | Format pesan Telegram | Next.js | Template pesan dengan emoji dan formatting |
| 8.2 | Kirim ke grup Telegram | Next.js ▶ Telegram API | `POST https://api.telegram.org/bot{token}/sendMessage` |
| 8.3 | Pesan muncul di grup | Telegram | Admin menerima notifikasi real-time |

**Telegram Message Format:**
```
🏔️ *PESANAN BARU - MERBABUSTAY*

📋 Kode: \`MBS-20260624-7842\`
🏠 Kamar: Kamar Pemandangan Gunung
👤 Pemesan: Budi Santoso
📧 Email: budi@email.com
📱 No HP: 081234567890

📅 Check-in: 26 Juni 2026
📅 Check-out: 28 Juni 2026
🌙 Durasi: 2 malam
👥 Tamu: 2 dewasa

💰 Total: *Rp 850.000*
💳 Metode: QRIS ✅

📝 Catatan: -

⏰ Dibooking: 24 Jun 2026, 14:32 WIB
```

**Admin Actions via Telegram:**
- Admin dapat melihat detail lengkap
- Admin dapat mengupdate status manual jika diperlukan
- Admin menghubungi pemesan untuk konfirmasi (WhatsApp/Call)

---

### STEP 9: RETURN PAGE - Halaman Sukses/Gagal

**Trigger:** User di-redirect dari Duitku ke website MerbabuStay

| No | Aksi | Aktor | Detail Teknis |
|----|------|-------|---------------|
| 9.1 | User redirect ke returnUrl | Duitku ▶ Browser | URL: `/pesanan/sukses?order_id=MBS-20260624-7842` |
| 9.2 | Fetch data pesanan terbaru | Next.js ▶ Supabase | `SELECT * FROM pesanan WHERE kode_pesanan = $order_id` |
| 9.3 | Render halaman berdasarkan status | Next.js | IF status='paid' → `<SuccessPage />`, ELSE → `<PendingPage />` atau `<FailedPage />` |
| 9.4 | Tampilkan detail konfirmasi | Browser | Kode pesanan, detail kamar, instruksi selanjutnya |

#### Halaman Sukses (`/pesanan/sukses`):
- ✅ Ilustrasi sukses (checkmark animation)
- Detail pesanan lengkap
- Tombol: "Lihat Invoice" | "Kembali ke Beranda"
- Informasi: "Kami akan mengirimkan detail ke email Anda"

#### Halaman Pending (`/pesanan/pending`):
- ⏳ Status menunggu pembayaran
- Countdown timer (sisa waktu pembayaran)
- Tombol: "Bayar Sekarang" (redirect ke paymentUrl)
- Tombol: "Cek Status" (polling status terbaru)

#### Halaman Gagal (`/pesanan/gagal`):
- ❌ Ilustrasi gagal
- Alasan kegagalan
- Tombol: "Coba Lagi" atau "Hubungi Kami"

---

### STEP 10: COMPLETE - Post-Booking Journey

**Trigger:** Pesanan berhasil dan terkonfirmasi

| No | Aksi | Aktor | Detail Teknis |
|----|------|-------|---------------|
| 10.1 | Admin konfirmasi pesanan | Admin | Manual via dashboard: status → 'confirmed' |
| 10.2 | Kirim email konfirmasi admin | Next.js ▶ Resend | Email ke user: "Pesanan Anda telah dikonfirmasi admin" |
| 10.3 | Reminder check-in (H-1) | Cron Job ▶ Resend | Scheduled email: pengingat check-in besok |
| 10.4 | User check-in | User | Datang ke homestay, tunjukkan kode pesanan/email |
| 10.5 | Admin update status check-in | Admin | Dashboard: status → 'checked_in' |
| 10.6 | User check-out | User | Proses check-out selesai |
| 10.7 | Admin update status complete | Admin | Dashboard: status → 'completed' |
| 10.8 | Kirim email review request | Next.js ▶ Resend | Setelah 1 hari check-out, minta rating & review |

---

## 4. Sequence Diagram - Full Booking Flow

```
User    Browser    Next.js    Supabase    Duitku    Resend    Telegram
 |         |          |          |          |          |          |
 |──(1)──▶|          |          |          |          |          |
 |    Browse LP     |          |          |          |          |
 |         |──(2)──▶|          |          |          |          |
 |         |    GET /          |          |          |          |
 |         |◀─(3)──|          |          |          |          |
 |         |   HTML+Data      |          |          |          |
 |◀────────|          |          |          |          |          |
 |  Render  |          |          |          |          |          |
 |         |          |          |          |          |          |
 |──(4)──▶|          |          |          |          |          |
 |  Click Kamar     |          |          |          |          |
 |         |──(5)──▶|          |          |          |          |
 |         |  GET /kamar/abc   |          |          |          |
 |         |          |──(6)──▶|          |          |          |
 |         |          |  SELECT kamar     |          |          |
 |         |          |◀─(7)──|          |          |          |
 |         |          |   Data Kamar      |          |          |
 |         |◀─(8)──|          |          |          |          |
 |         |  Detail Kamar Page|          |          |          |
 |◀────────|          |          |          |          |          |
 |  Pilih Tanggal    |          |          |          |          |
 |         |          |          |          |          |          |
 |──(9)──▶|          |          |          |          |          |
 |  Click "Pesan"   |          |          |          |          |
 |         |──(10)─▶|          |          |          |          |
 |         |  GET /checkout      |          |          |          |
 |         |◀─(11)─|          |          |          |          |
 |         |  Checkout Form      |          |          |          |
 |◀────────|          |          |          |          |          |
 |  Isi Form         |          |          |          |          |
 |         |          |          |          |          |          |
 |──(12)─▶|          |          |          |          |          |
 |  Submit Form      |          |          |          |          |
 |         |──(13)─▶|          |          |          |          |
 |         |  POST /api/pesanan  |          |          |          |
 |         |          |──(14)─▶|          |          |          |
 |         |          |  INSERT pesanan   |          |          |
 |         |          |◀─(15)─|          |          |          |
 |         |          |  pesanan_id       |          |          |
 |         |          |────────(16)──────▶|          |          |
 |         |          |  POST /inquiry    |          |          |
 |         |          |◀───────(17)──────|          |          |
 |         |          |  {reference, url} |          |          |
 |         |          |──(18)─▶|          |          |          |
 |         |          |  UPDATE ref & url |          |          |
 |         |◀─(19)─|          |          |          |          |
 |         |  {paymentUrl}     |          |          |          |
 |◀────────|          |          |          |          |          |
 | Redirect to Duitku|          |          |          |          |
 |         |          |          |          |          |          |
 |────────(20)──────▶|          |          |          |          |
 |    Bayar di Duitku            |          |          |          |
 |◀────────(21)──────|          |          |          |          |
 |  Payment Complete |          |          |          |          |
 |         |          |          |          |          |          |
 |         |          |◀────────(22)───────|          |          |
 |         |          |  POST /callback    |          |          |
 |         |          |  (Duitku notify)   |          |          |
 |         |          |──(23)─▶|          |          |          |
 |         |          |  UPDATE status='paid'         |          |
 |         |          |          |          |          |          |
 |         |          |────────(24)───────────────────▶|          |
 |         |          |  POST /emails (Invoice)        |          |
 |         |          |◀───────(25)───────────────────|          |
 |         |          |  {email_id}         |          |          |
 |         |          |          |          |          |          |
 |         |          |────────────────────(26)─────────────────▶|
 |         |          |  POST /sendMessage (Telegram)           |
 |         |          |◀───────────────────(27)─────────────────|
 |         |          |  {message_id}       |          |          |
 |         |          |          |          |          |          |
 |         |◀────────(28)───────────────────────────────────────|
 |         |  GET /pesanan/sukses      |          |          |    |
 |◀────────|          |          |          |          |          |
 |  Success Page     |          |          |          |          |
 |         |          |          |          |          |          |
```

---

## 5. Alternative Flows & Edge Cases

### Flow A: Pembayaran Gagal / Timeout

```
User ▶ Duitku ▶ Gagal/Timeout
   │
   ▼
[RETURN: /pesanan/gagal?order_id=XXX]
   │
   ▼
Tampilkan: "Pembayaran Gagal / Kedaluwarsa"
Opsi:
  1. "Bayar Ulang" → POST /api/pesanan/{id}/retry → Duitku inquiry baru
  2. "Batalkan" → UPDATE status='cancelled'
  3. "Hubungi Admin" → Redirect ke WhatsApp
```

### Flow B: Cancel Order (User Initiated)

```
User ▶ Halaman Pesanan ▶ Klik "Batalkan"
   │
   ▼
[POST /api/pesanan/{id}/batal]
   │
   ▼
Validasi: Status harus 'pending' atau 'waiting_payment'
   │
   ▼
UPDATE pesanan SET status='cancelled', cancelled_at=NOW()
   │
   ▼
Kirim email konfirmasi pembatalan via Resend
```

### Flow C: Double Booking Prevention

```
User A ──▶ Pilih Kamar X, Tanggal 1-3 Juli
User B ──▶ Pilih Kamar X, Tanggal 1-3 Juli (waktu hampir bersamaan)
   │
   ▼
[Race Condition Handling]
   │
   ▼
Server menerima POST /api/pesanan dari User A & User B
   │
   ▼
Gunakan Database Transaction (SERIALIZABLE isolation level)
   │
   ▼
SELECT FOR UPDATE pada row ketersediaan
   │
   ▼
User A: Berhasil → INSERT pesanan, commit
User B: Gagal → Rollback, return error "Kamar sudah dibooking"
```

### Flow D: Duitku Callback Failed (Retry Mechanism)

```
Duitku kirim callback → Next.js server down / timeout
   │
   ▼
[Duitku akan retry 3x dengan interval 5 menit]
   │
   ▼
Fallback: Polling mechanism dari frontend
  - Halaman pending auto-refresh setiap 30 detik
  - Cek status ke: GET /api/pesanan/{id}/status
   │
   ▼
Jika sudah paid tapi belum terproses:
  - Admin manual trigger dari dashboard
  - Reconcile payment via Duitku merchant portal
```

---

## 6. State Machine - Status Pesanan

```
                    ┌─────────────┐
         ┌─────────▶│  PENDING    │◀────────┐
         │          │ (baru)      │         │
         │          └──────┬──────┘         │
         │                 │ submit          │
         │                 ▼                 │
         │          ┌─────────────┐         │
         │          │WAITING_PAYMT│         │
         │          │             │─────────┘ (cancel by user)
         │          └──────┬──────┘
         │                 │ Duitku callback
         │        ┌────────┴────────┐
         │        ▼                 ▼
         │   ┌─────────┐      ┌─────────┐
         │   │   PAID  │      │ FAILED  │
         │   │         │      │         │
         │   └────┬────┘      └────┬────┘
         │        │                 │
         │        ▼                 │
         │   ┌─────────┐           │
         └───┤CANCELLED│◀──────────┘
             │         │  (admin cancel)
             └─────────┘
                  ▲
                  │
         ┌────────┴────────┐
         ▼                 ▼
    ┌─────────┐      ┌─────────┐
    │CONFIRMED│      │ CHECKED-│
    │ (admin) │      │   IN    │
    └────┬────┘      └────┬────┘
         │                 │
         │                 ▼
         │            ┌─────────┐
         │            │COMPLETED│
         │            │(checkout)│
         │            └─────────┘
         │
         └──────────────────────▶ (end)
```

| Status | Deskripsi | Aksi Selanjutnya |
|--------|-----------|------------------|
| `pending` | Pesanan dibuat, belum redirect ke pembayaran | Auto-expire 30 menit |
| `waiting_payment` | Menunggu user bayar di Duitku | Auto-cancel 24 jam |
| `paid` | Pembayaran sukses via Duitku | Admin confirm → confirmed |
| `confirmed` | Admin telah konfirmasi pesanan | Check-in day → checked_in |
| `checked_in` | User sudah check-in | Check-out → completed |
| `completed` | User sudah check-out | - |
| `failed` | Pembayaran gagal / timeout | Retry atau cancel |
| `cancelled` | Dibatalkan user atau sistem | - |

---

## 7. Cron Jobs & Scheduled Tasks

| Job | Frekuensi | Fungsi |
|-----|-----------|--------|
| `expire-pending-orders` | Setiap 10 menit | Cancel pesanan `pending` > 30 menit tanpa aktivitas |
| `expire-payment-orders` | Setiap 1 jam | Cancel pesanan `waiting_payment` > 24 jam |
| `reminder-checkin` | Setiap hari 10:00 WIB | Kirim email reminder untuk check-in besok |
| `request-review` | Setiap hari 12:00 WIB | Kirim email minta review 1 hari setelah check-out |
| `reconcile-payments` | Setiap hari 00:00 WIB | Sinkronisasi status dengan Duitku untuk pesanan stuck |

---

*Dokumen ini akan diupdate seiring dengan penambahan fitur baru.*

**Prepared by:** Lead Product Manager  
**Date:** Juni 2026  
**Version:** 1.0
