# Database Schema

## MerbabuStay - Platform Pemesanan Homestay

---

## 1. Overview Arsitektur Database

Database menggunakan **PostgreSQL** melalui **Supabase** dengan struktur sebagai berikut:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE POSTGRESQL                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐ │
│  │    kamar     │   │   pesanan    │   │ kamar_foto   │   │admin_users   │ │
│  │              │   │              │   │              │   │              │ │
│  │  Tipe:       │◀──│  Tipe:       │   │  Tipe:       │   │  Tipe:       │ │
│  │  Master Data │   │  Transaction │   │  Media       │   │  Auth        │ │
│  │              │   │              │   │              │   │              │ │
│  │  - Data      │   │  - Booking   │   │  - Galeri    │   │  - Login     │ │
│  │    homestay  │   │    records   │   │    foto      │   │    admin     │ │
│  │  - Harga     │   │  - Status    │   │    kamar     │   │  - Role      │ │
│  │  - Kapasitas │   │    tracking  │   │              │   │    access    │ │
│  │  - Fasilitas │   │  - Payment   │   │              │   │              │ │
│  │              │   │    ref       │   │              │   │              │ │
│  └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘ │
│         │                    │                                              │
│         │                    │                                              │
│         │         ┌──────────┴──────────┐                                   │
│         │         │   pesanan_log       │                                   │
│         │         │   (Audit Trail)     │                                   │
│         │         └─────────────────────┘                                   │
│         │                                                                   │
│  ┌──────┴──────────────┐                                                    │
│  │    ketersediaan     │                                                    │
│  │   (Availability     │                                                    │
│  │     Cache/Materialized │                                                │
│  │     View Optional)  │                                                    │
│  └─────────────────────┘                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tabel: `kamar` (Master Data Kamar)

Tabel utama yang menyimpan informasi semua kamar/homestay yang tersedia untuk dipesan.

### Schema Definition

```sql
CREATE TABLE kamar (
    -- Primary Key
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identitas Kamar
    nama            VARCHAR(100) NOT NULL,
    slug            VARCHAR(120) NOT NULL UNIQUE,
    deskripsi       TEXT,
    deskripsi_singkat VARCHAR(255),

    -- Kategorisasi
    tipe            VARCHAR(50) NOT NULL DEFAULT 'standard',
    -- ENUM values: 'standard', 'deluxe', 'family', 'villa'

    -- Kapasitas
    kapasitas_tamu  INTEGER NOT NULL DEFAULT 2,
    jumlah_bed      INTEGER NOT NULL DEFAULT 1,
    tipe_bed        VARCHAR(50) DEFAULT 'double',
    -- ENUM: 'single', 'double', 'queen', 'king', 'bunk', 'sofa'

    -- Pricing
    harga_per_malam DECIMAL(12, 2) NOT NULL,
    harga_weekend   DECIMAL(12, 2),  -- Harga khusus Sabtu-Minggu, NULL = sama dengan harga biasa

    -- Fasilitas (stored as JSON array for flexibility)
    fasilitas       JSONB DEFAULT '[]',
    -- Example: ["wifi", "tv", "ac", "water_heater", "parking", "kitchen", "breakfast"]

    -- Media
    foto_utama      VARCHAR(500),    -- URL foto utama dari Supabase Storage
    jumlah_foto     INTEGER DEFAULT 0,

    -- Status & Visibility
    is_active       BOOLEAN NOT NULL DEFAULT true,
    is_popular      BOOLEAN NOT NULL DEFAULT false,  -- Badge "Populer" di UI

    -- SEO
    meta_title      VARCHAR(100),
    meta_description VARCHAR(200),

    -- Timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_kamar_slug ON kamar(slug);
CREATE INDEX idx_kamar_tipe ON kamar(tipe);
CREATE INDEX idx_kamar_is_active ON kamar(is_active);
CREATE INDEX idx_kamar_harga ON kamar(harga_per_malam);
CREATE INDEX idx_kamar_is_popular ON kamar(is_popular) WHERE is_popular = true;

-- Full Text Search (optional, for search feature)
CREATE INDEX idx_kamar_search ON kamar USING gin(to_tsvector('indonesian', nama || ' ' || COALESCE(deskripsi, '')));
```

### Column Detail

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key, auto-generated |
| `nama` | VARCHAR(100) | NO | - | Nama kamar (contoh: "Kamar Pemandangan Gunung") |
| `slug` | VARCHAR(120) | NO | - | URL-friendly identifier (contoh: "kamar-pemandangan-gunung") |
| `deskripsi` | TEXT | YES | NULL | Deskripsi lengkap kamar (HTML/Markdown supported) |
| `deskripsi_singkat` | VARCHAR(255) | YES | NULL | Deskripsi singkat untuk card preview |
| `tipe` | VARCHAR(50) | NO | 'standard' | Kategori: standard/deluxe/family/villa |
| `kapasitas_tamu` | INTEGER | NO | 2 | Maksimal jumlah tamu |
| `jumlah_bed` | INTEGER | NO | 1 | Jumlah tempat tidur |
| `tipe_bed` | VARCHAR(50) | YES | 'double' | Tipe tempat tidur |
| `harga_per_malam` | DECIMAL(12,2) | NO | - | Harga weekday (Senin-Jumat) |
| `harga_weekend` | DECIMAL(12,2) | YES | NULL | Harga weekend (Sabtu-Minggu), NULL = sama dengan harga biasa |
| `fasilitas` | JSONB | YES | '[]' | Array fasilitas dalam bahasa Inggris/snake_case |
| `foto_utama` | VARCHAR(500) | YES | NULL | URL foto utama dari Supabase Storage |
| `jumlah_foto` | INTEGER | YES | 0 | Jumlah total foto di tabel kamar_foto |
| `is_active` | BOOLEAN | NO | true | Apakah kamar tersedia untuk dipesan |
| `is_popular` | BOOLEAN | NO | false | Tampilkan badge "Populer" di UI |
| `meta_title` | VARCHAR(100) | YES | NULL | Title tag untuk SEO |
| `meta_description` | VARCHAR(200) | YES | NULL | Meta description untuk SEO |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Waktu pembuatan record |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Waktu terakhir diupdate |

### Sample Data

```sql
INSERT INTO kamar (nama, slug, deskripsi, deskripsi_singkat, tipe, kapasitas_tamu, jumlah_bed, tipe_bed, harga_per_malam, harga_weekend, fasilitas, is_active, is_popular, meta_title, meta_description) VALUES
(
    'Kamar Pemandangan Gunung',
    'kamar-pemandangan-gunung',
    '<p>Kamar nyaman dengan jendela besar menghadap langsung ke Gunung Merbabu. Nikmati pemandangan spektakuler matahari terbit dan terbenam langsung dari kamar Anda. Dilengkapi dengan tempat tidur queen size, kamar mandi dalam dengan air panas, dan balkon pribadi.</p>',
    'Kamar dengan pemandangan Gunung Merbabu langsung dari jendela dan balkon pribadi',
    'deluxe',
    2,
    1,
    'queen',
    425000.00,
    525000.00,
    '["wifi", "tv", "water_heater", "breakfast", "mountain_view", "balcony", "parking"]',
    true,
    true,
    'Kamar Pemandangan Gunung - MerbabuStay',
    'Nikmati pemandangan Gunung Merbabu langsung dari kamar. Balkon pribadi, queen bed, breakfast included.'
),
(
    'Suite Sunrise Deluxe',
    'suite-sunrise-deluxe',
    '<p>Suite mewah di lantai atas dengan panorama 180 derajat pegunungan. Terbangun dengan pemandangan matahari terbit yang memukau. Dilengkapi king size bed, sofa lounge, smart TV, minibar, dan kamar mandi premium dengan bathtub.</p>',
    'Suite deluxe dengan panorama 180° pegunungan dan pemandangan sunrise terbaik',
    'deluxe',
    2,
    1,
    'king',
    650000.00,
    750000.00,
    '["wifi", "smart_tv", "ac", "water_heater", "breakfast", "mountain_view", "balcony", "minibar", "bathtub", "parking"]',
    true,
    true,
    'Suite Sunrise Deluxe - MerbabuStay',
    'Suite mewah dengan panorama 180° pegunungan. King bed, bathtub, minibar, sunrise view terbaik.'
),
(
    'Villa Keluarga Merbabu',
    'villa-keluarga-merbabu',
    '<p>Villa luas untuk keluarga besar atau grup teman. 3 kamar tidur, 2 kamar mandi, ruang tamu besar, dapur lengkap, dan taman pribadi dengan gazebo. Kapasitas hingga 8 orang. Ideal untuk family gathering atau retreat grup.</p>',
    'Villa 3 kamar untuk keluarga besar, taman pribadi, gazebo, kapasitas 8 orang',
    'villa',
    8,
    3,
    'mixed',
    1200000.00,
    1500000.00,
    '["wifi", "tv", "ac", "water_heater", "kitchen", "breakfast", "garden", "gazebo", "bbq", "parking"]',
    true,
    false,
    'Villa Keluarga Merbabu - MerbabuStay',
    'Villa luas 3 kamar untuk keluarga. Taman pribadi, gazebo, BBQ, dapur lengkap, kapasitas 8 orang.'
),
(
    'Kamar Cozy Standard',
    'kamar-cozy-standard',
    '<p>Kamar nyaman dan terjangkau dengan fasilitas lengkap. Tempat tidur double, kamar mandi dalam, dan ventilasi alami yang baik. Pilihan ideal untuk solo traveler atau pasangan dengan budget hemat.</p>',
    'Kamar nyaman terjangkau, ideal untuk solo traveler atau pasangan budget hemat',
    'standard',
    2,
    1,
    'double',
    295000.00,
    350000.00,
    '["wifi", "water_heater", "parking"]',
    true,
    false,
    'Kamar Cozy Standard - MerbabuStay',
    'Kamar nyaman terjangkau di kaki Gunung Merbabu. Double bed, kamar mandi dalam, WiFi.'
);
```

---

## 3. Tabel: `kamar_foto` (Galeri Foto Kamar)

Tabel untuk menyimpan foto-foto tambahan setiap kamar (galeri).

### Schema Definition

```sql
CREATE TABLE kamar_foto (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kamar_id    UUID NOT NULL REFERENCES kamar(id) ON DELETE CASCADE,
    url_foto    VARCHAR(500) NOT NULL,
    caption     VARCHAR(200),
    urutan      INTEGER NOT NULL DEFAULT 0,
    is_primary  BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kamar_foto_kamar_id ON kamar_foto(kamar_id);
CREATE INDEX idx_kamar_foto_urutan ON kamar_foto(kamar_id, urutan);
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `kamar_id` | UUID | NO | - | Foreign key ke tabel kamar |
| `url_foto` | VARCHAR(500) | NO | - | URL foto di Supabase Storage |
| `caption` | VARCHAR(200) | YES | NULL | Keterangan foto |
| `urutan` | INTEGER | NO | 0 | Urutan tampilan (0 = pertama) |
| `is_primary` | BOOLEAN | NO | false | Foto utama (akan sync ke kamar.foto_utama) |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Waktu upload |

---

## 4. Tabel: `pesanan` (Data Pemesanan)

Tabel utama transaksi yang menyimpan semua data pemesanan/booking.

### Schema Definition

```sql
CREATE TABLE pesanan (
    -- Primary Key & Order Code
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_pesanan        VARCHAR(30) NOT NULL UNIQUE,

    -- Relasi
    kamar_id            UUID NOT NULL REFERENCES kamar(id),

    -- Data Pemesan (Guest Information)
    nama_lengkap        VARCHAR(100) NOT NULL,
    email               VARCHAR(100) NOT NULL,
    no_hp               VARCHAR(20) NOT NULL,
    catatan             TEXT,

    -- Detail Booking
    check_in            DATE NOT NULL,
    check_out           DATE NOT NULL,
    jumlah_tamu         INTEGER NOT NULL DEFAULT 1,
    jumlah_malam        INTEGER NOT NULL GENERATED ALWAYS AS (check_out - check_in) STORED,

    -- Pricing Breakdown
    harga_per_malam     DECIMAL(12, 2) NOT NULL,
    total_harga         DECIMAL(12, 2) NOT NULL,
    kode_promo          VARCHAR(30),
    diskon              DECIMAL(12, 2) DEFAULT 0,
    total_bayar         DECIMAL(12, 2) NOT NULL,  -- total_harga - diskon

    -- Status Flow
    status              VARCHAR(30) NOT NULL DEFAULT 'pending',
    -- ENUM: 'pending' → 'waiting_payment' → 'paid' → 'confirmed' → 'checked_in' → 'completed'
    --       'failed', 'cancelled'

    -- Payment Information (Duitku)
    duitku_reference    VARCHAR(100),
    duitku_merchant_order_id VARCHAR(100),
    payment_url         VARCHAR(500),
    payment_method      VARCHAR(50),   -- Contoh: 'OV', 'SA', 'DA' (kode metode Duitku)
    payment_method_name VARCHAR(50),   -- Contoh: 'OVO', 'ShopeePay', 'DANA'
    paid_at             TIMESTAMPTZ,
    expired_at          TIMESTAMPTZ NOT NULL,

    -- Admin Actions
    confirmed_at        TIMESTAMPTZ,
    confirmed_by        UUID REFERENCES admin_users(id),
    checked_in_at       TIMESTAMPTZ,
    checked_out_at      TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    cancelled_reason    VARCHAR(255),

    -- Metadata
    ip_address          INET,
    user_agent          TEXT,

    -- Timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pesanan_kode ON pesanan(kode_pesanan);
CREATE INDEX idx_pesanan_kamar_id ON pesanan(kamar_id);
CREATE INDEX idx_pesanan_status ON pesanan(status);
CREATE INDEX idx_pesanan_email ON pesanan(email);
CREATE INDEX idx_pesanan_duitku_ref ON pesanan(duitku_reference);
CREATE INDEX idx_pesanan_created_at ON pesanan(created_at DESC);
CREATE INDEX idx_pesanan_check_in ON pesanan(check_in);

-- Composite index untuk cek ketersediaan (CRITICAL untuk performa)
CREATE INDEX idx_pesanan_kamar_date_status ON pesanan(kamar_id, check_in, check_out, status);

-- Partial indexes untuk query yang sering digunakan
CREATE INDEX idx_pesanan_active ON pesanan(status) WHERE status IN ('pending', 'waiting_payment', 'paid', 'confirmed', 'checked_in');
```

### Column Detail

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `kode_pesanan` | VARCHAR(30) | NO | - | Kode unik untuk user (format: MBS-YYYYMMDD-XXXX) |
| `kamar_id` | UUID | NO | - | Foreign key ke tabel kamar |
| `nama_lengkap` | VARCHAR(100) | NO | - | Nama lengkap pemesan |
| `email` | VARCHAR(100) | NO | - | Email pemesan (untuk invoice) |
| `no_hp` | VARCHAR(20) | NO | - | Nomor HP pemesan |
| `catatan` | TEXT | YES | NULL | Catatan khusus dari pemesan |
| `check_in` | DATE | NO | - | Tanggal check-in |
| `check_out` | DATE | NO | - | Tanggal check-out |
| `jumlah_tamu` | INTEGER | NO | 1 | Jumlah tamu menginap |
| `jumlah_malam` | INTEGER | NO | generated | Auto-generated: check_out - check_in |
| `harga_per_malam` | DECIMAL(12,2) | NO | - | Harga per malam saat booking (snapshot) |
| `total_harga` | DECIMAL(12,2) | NO | - | Total: harga_per_malam × jumlah_malam |
| `kode_promo` | VARCHAR(30) | YES | NULL | Kode promo yang digunakan |
| `diskon` | DECIMAL(12,2) | YES | 0 | Jumlah diskon |
| `total_bayar` | DECIMAL(12,2) | NO | - | Total setelah diskon |
| `status` | VARCHAR(30) | NO | 'pending' | Status pesanan (lihat state machine) |
| `duitku_reference` | VARCHAR(100) | YES | NULL | Reference ID dari Duitku |
| `duitku_merchant_order_id` | VARCHAR(100) | YES | NULL | Merchant Order ID yang dikirim ke Duitku |
| `payment_url` | VARCHAR(500) | YES | NULL | URL halaman pembayaran Duitku |
| `payment_method` | VARCHAR(50) | YES | NULL | Kode metode pembayaran Duitku |
| `payment_method_name` | VARCHAR(50) | YES | NULL | Nama metode pembayaran (human-readable) |
| `paid_at` | TIMESTAMPTZ | YES | NULL | Waktu pembayaran sukses |
| `expired_at` | TIMESTAMPTZ | NO | - | Batas waktu pembayaran (24 jam dari dibuat) |
| `confirmed_at` | TIMESTAMPTZ | YES | NULL | Waktu admin konfirmasi pesanan |
| `confirmed_by` | UUID | YES | - | Admin yang mengkonfirmasi |
| `checked_in_at` | TIMESTAMPTZ | YES | NULL | Waktu user check-in |
| `checked_out_at` | TIMESTAMPTZ | YES | NULL | Waktu user check-out |
| `cancelled_at` | TIMESTAMPTZ | YES | NULL | Waktu pembatalan |
| `cancelled_reason` | VARCHAR(255) | YES | NULL | Alasan pembatalan |
| `ip_address` | INET | YES | NULL | IP address pemesan |
| `user_agent` | TEXT | YES | NULL | User agent browser |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Waktu pembuatan pesanan |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Waktu terakhir update |

### Status State Machine

```
┌─────────┐    submit    ┌─────────────────┐    Duitku callback    ┌─────────┐
│ PENDING │ ───────────▶ │ WAITING_PAYMENT │ ───────────────────▶ │  PAID   │
└─────────┘              └─────────────────┘                       └────┬────┘
     │                              │                                  │
     │ 30 min timeout               │ 24 jam timeout                   │ admin confirm
     ▼                              ▼                                  ▼
┌───────────┐              ┌───────────┐                       ┌─────────────┐
│ CANCELLED │              │   FAILED  │                       │  CONFIRMED  │
└───────────┘              └───────────┘                       └──────┬──────┘
                                                                      │
                                                                      │ check-in day
                                                                      ▼
                                                               ┌─────────────┐
                                                               │  CHECKED_IN │
                                                               └──────┬──────┘
                                                                      │
                                                                      │ check-out
                                                                      ▼
                                                               ┌─────────────┐
                                                               │  COMPLETED  │
                                                               └─────────────┘
```

### Sample Data

```sql
INSERT INTO pesanan (kode_pesanan, kamar_id, nama_lengkap, email, no_hp, catatan, check_in, check_out, jumlah_tamu, harga_per_malam, total_harga, total_bayar, status, duitku_reference, payment_url, expired_at, created_at) VALUES
(
    'MBS-20260624-7842',
    (SELECT id FROM kamar WHERE slug = 'kamar-pemandangan-gunung'),
    'Budi Santoso',
    'budi.santoso@email.com',
    '081234567890',
    'Mohon kamar yang tenang, kami datang untuk honeymoon.',
    '2026-06-26',
    '2026-06-28',
    2,
    425000.00,
    850000.00,
    850000.00,
    'paid',
    'D1234567890',
    'https://sandbox.duitku.com/topup/...',
    '2026-06-25 14:32:00+07',
    '2026-06-24 14:32:00+07'
);
```

---

## 5. Tabel: `admin_users` (Manajemen Admin)

Tabel untuk autentikasi admin dashboard.

### Schema Definition

```sql
CREATE TABLE admin_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama            VARCHAR(100) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,  -- bcrypt hashed
    role            VARCHAR(20) NOT NULL DEFAULT 'admin',
    -- ENUM: 'admin', 'superadmin'
    is_active       BOOLEAN NOT NULL DEFAULT true,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `nama` | VARCHAR(100) | NO | - | Nama lengkap admin |
| `email` | VARCHAR(100) | NO | - | Email login (unique) |
| `password_hash` | VARCHAR(255) | NO | - | Password dengan bcrypt |
| `role` | VARCHAR(20) | NO | 'admin' | Role: admin atau superadmin |
| `is_active` | BOOLEAN | NO | true | Status aktif/nonaktif |
| `last_login_at` | TIMESTAMPTZ | YES | NULL | Waktu login terakhir |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Waktu pembuatan |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Waktu terakhir update |

```sql
-- Insert default admin (password: 'admin123' - CHANGE IN PRODUCTION!)
INSERT INTO admin_users (nama, email, password_hash, role) VALUES
('Admin MerbabuStay', 'admin@merbabustay.id', '$2b$10$...hashed...', 'superadmin');
```

---

## 6. Tabel: `pesanan_log` (Audit Trail)

Tabel untuk mencatat semua perubahan status pesanan (audit trail).

### Schema Definition

```sql
CREATE TABLE pesanan_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pesanan_id  UUID NOT NULL REFERENCES pesanan(id) ON DELETE CASCADE,
    status_lama VARCHAR(30),
    status_baru VARCHAR(30) NOT NULL,
    keterangan  VARCHAR(255),
    changed_by  UUID REFERENCES admin_users(id),  -- NULL jika system-triggered
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pesanan_log_pesanan_id ON pesanan_log(pesanan_id);
CREATE INDEX idx_pesanan_log_created_at ON pesanan_log(created_at DESC);
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `pesanan_id` | UUID | NO | - | Foreign key ke pesanan |
| `status_lama` | VARCHAR(30) | YES | NULL | Status sebelum perubahan |
| `status_baru` | VARCHAR(30) | NO | - | Status setelah perubahan |
| `keterangan` | VARCHAR(255) | YES | NULL | Keterangan perubahan |
| `changed_by` | UUID | YES | - | Admin yang melakukan perubahan (NULL = sistem) |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Waktu perubahan |

---

## 7. Functions & Triggers

### 7.1 Auto-update `updated_at`

```sql
-- Function untuk auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply ke semua tabel
CREATE TRIGGER update_kamar_updated_at BEFORE UPDATE ON kamar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pesanan_updated_at BEFORE UPDATE ON pesanan
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 7.2 Auto-generate Order Code

```sql
-- Function untuk generate kode pesanan unik
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TRIGGER AS $$
DECLARE
    date_part VARCHAR(8);
    random_part VARCHAR(4);
    new_code VARCHAR(30);
BEGIN
    date_part := TO_CHAR(NEW.created_at AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD');
    random_part := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    new_code := 'MBS-' || date_part || '-' || random_part;
    
    -- Cek uniqueness (loop sampai unik)
    WHILE EXISTS (SELECT 1 FROM pesanan WHERE kode_pesanan = new_code) LOOP
        random_part := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        new_code := 'MBS-' || date_part || '-' || random_part;
    END LOOP;
    
    NEW.kode_pesanan := new_code;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_code BEFORE INSERT ON pesanan
    FOR EACH ROW EXECUTE FUNCTION generate_order_code();
```

### 7.3 Auto-set Expired At

```sql
-- Function untuk set expired_at 24 jam dari created_at
CREATE OR REPLACE FUNCTION set_expired_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.expired_at := NEW.created_at + INTERVAL '24 hours';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_pesanan_expired_at BEFORE INSERT ON pesanan
    FOR EACH ROW EXECUTE FUNCTION set_expired_at();
```

### 7.4 Log Status Changes

```sql
-- Function untuk log perubahan status pesanan
CREATE OR REPLACE FUNCTION log_pesanan_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO pesanan_log (pesanan_id, status_lama, status_baru, keterangan)
        VALUES (NEW.id, OLD.status, NEW.status, COALESCE(NEW.cancelled_reason, 'Status updated'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_pesanan_changes AFTER UPDATE ON pesanan
    FOR EACH ROW EXECUTE FUNCTION log_pesanan_status_change();
```

### 7.5 Check Availability Function (CRITICAL)

```sql
-- Function untuk cek ketersediaan kamar pada rentang tanggal
CREATE OR REPLACE FUNCTION cek_ketersediaan(
    p_kamar_id UUID,
    p_check_in DATE,
    p_check_out DATE
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM pesanan
    WHERE kamar_id = p_kamar_id
      AND status IN ('paid', 'confirmed', 'checked_in')
      AND check_in < p_check_out
      AND check_out > p_check_in;
    
    RETURN v_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Contoh penggunaan:
-- SELECT cek_ketersediaan('uuid-kamar', '2026-06-26', '2026-06-28');
-- Returns: true (available) atau false (booked)
```

### 7.6 Get Available Rooms Function

```sql
-- Function untuk mendapatkan kamar yang tersedia pada rentang tanggal
CREATE OR REPLACE FUNCTION get_kamar_tersedia(
    p_check_in DATE,
    p_check_out DATE,
    p_kapasitas INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    nama VARCHAR(100),
    slug VARCHAR(120),
    tipe VARCHAR(50),
    kapasitas_tamu INTEGER,
    harga_per_malam DECIMAL(12,2),
    foto_utama VARCHAR(500),
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        k.id,
        k.nama,
        k.slug,
        k.tipe,
        k.kapasitas_tamu,
        k.harga_per_malam,
        k.foto_utama,
        NOT EXISTS (
            SELECT 1 FROM pesanan p
            WHERE p.kamar_id = k.id
              AND p.status IN ('paid', 'confirmed', 'checked_in')
              AND p.check_in < p_check_out
              AND p.check_out > p_check_in
        ) AS is_available
    FROM kamar k
    WHERE k.is_active = true
      AND (p_kapasitas IS NULL OR k.kapasitas_tamu >= p_kapasitas)
    ORDER BY k.harga_per_malam ASC;
END;
$$ LANGUAGE plpgsql;
```

---

## 8. Row Level Security (RLS) Policies

### Enable RLS on All Tables

```sql
ALTER TABLE kamar ENABLE ROW LEVEL SECURITY;
ALTER TABLE kamar_foto ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesanan_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
```

### Policies

```sql
-- ============================================
-- KAMAR: Public read, Admin write
-- ============================================
CREATE POLICY "kamar_public_select"
    ON kamar FOR SELECT
    USING (is_active = true);

CREATE POLICY "kamar_admin_all"
    ON kamar FOR ALL
    USING (EXISTS (
        SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true
    ));

-- ============================================
-- KAMAR_FOTO: Public read, Admin write
-- ============================================
CREATE POLICY "kamar_foto_public_select"
    ON kamar_foto FOR SELECT
    USING (true);

CREATE POLICY "kamar_foto_admin_all"
    ON kamar_foto FOR ALL
    USING (EXISTS (
        SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true
    ));

-- ============================================
-- PESANAN: Public insert, Self read
-- ============================================
CREATE POLICY "pesanan_public_insert"
    ON pesanan FOR INSERT
    WITH CHECK (true);

CREATE POLICY "pesanan_public_select"
    ON pesanan FOR SELECT
    USING (true);  -- Akan difilter di API berdasarkan email + kode_pesanan

CREATE POLICY "pesanan_admin_all"
    ON pesanan FOR ALL
    USING (EXISTS (
        SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true
    ));

-- ============================================
-- PESANAN_LOG: Admin only
-- ============================================
CREATE POLICY "pesanan_log_admin_all"
    ON pesanan_log FOR ALL
    USING (EXISTS (
        SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true
    ));

-- ============================================
-- ADMIN_USERS: Self only (except superadmin)
-- ============================================
CREATE POLICY "admin_users_self"
    ON admin_users FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "admin_users_superadmin"
    ON admin_users FOR ALL
    USING (EXISTS (
        SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin'
    ));
```

---

## 9. Database Diagram (ERD)

```
┌─────────────────────┐         ┌─────────────────────┐
│      kamar          │         │    admin_users      │
├─────────────────────┤         ├─────────────────────┤
│ PK id UUID          │         │ PK id UUID          │
│    nama VARCHAR(100)│         │    nama VARCHAR(100)│
│    slug VARCHAR(120)│         │    email VARCHAR(100)│
│    deskripsi TEXT   │         │    password_hash    │
│    tipe VARCHAR(50) │         │    role VARCHAR(20) │
│    kapasitas_tamu   │         │    is_active BOOLEAN│
│    jumlah_bed       │         │    last_login_at    │
│    tipe_bed         │         │    created_at       │
│    harga_per_malam  │         │    updated_at       │
│    harga_weekend    │         └─────────────────────┘
│    fasilitas JSONB  │                    │
│    foto_utama       │                    │
│    is_active        │                    │ FK confirmed_by
│    is_popular       │                    │
│    meta_title       │                    ▼
│    meta_description │         ┌─────────────────────┐
│    created_at       │◀────────┤      pesanan        │
│    updated_at       │   FK    ├─────────────────────┤
└─────────────────────┘         │ PK id UUID          │
         │                      │ UQ kode_pesanan     │
         │                      │ FK kamar_id UUID    │
         │ FK kamar_id          │    nama_lengkap     │
         │                      │    email            │
         ▼                      │    no_hp            │
┌─────────────────────┐         │    catatan TEXT     │
│    kamar_foto       │         │    check_in DATE    │
├─────────────────────┤         │    check_out DATE   │
│ PK id UUID          │         │    jumlah_tamu      │
│ FK kamar_id UUID    │         │    jumlah_malam     │
│    url_foto         │         │    harga_per_malam  │
│    caption          │         │    total_harga      │
│    urutan           │         │    kode_promo       │
│    is_primary       │         │    diskon           │
│    created_at       │         │    total_bayar      │
└─────────────────────┘         │    status           │
                                │    duitku_reference │
                                │    payment_url      │
                                │    payment_method   │
                                │    paid_at          │
                                │    expired_at       │
                                │    confirmed_at     │
                                │    checked_in_at    │
                                │    checked_out_at   │
                                │    cancelled_at     │
                                │    cancelled_reason │
                                │    created_at       │
                                │    updated_at       │
                                └─────────────────────┘
                                         │
                                         │ FK pesanan_id
                                         │
                                         ▼
                                ┌─────────────────────┐
                                │    pesanan_log      │
                                ├─────────────────────┤
                                │ PK id UUID          │
                                │ FK pesanan_id UUID  │
                                │    status_lama      │
                                │    status_baru      │
                                │    keterangan       │
                                │    changed_by UUID  │
                                │    created_at       │
                                └─────────────────────┘
```

---

## 10. Environment Variables (Supabase)

```env
# Supabase Project
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database Connection (for migrations)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

---

## 11. Migration Scripts

### Initial Migration (`001_initial_schema.sql`)

```sql
-- ============================================
-- Migration: 001_initial_schema
-- Database: MerbabuStay
-- Description: Initial schema setup
-- ============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create Tables
\i schema/kamar.sql
\i schema/kamar_foto.sql
\i schema/pesanan.sql
\i schema/admin_users.sql
\i schema/pesanan_log.sql

-- 2. Create Functions
\i functions/update_updated_at.sql
\i functions/generate_order_code.sql
\i functions/set_expired_at.sql
\i functions/log_pesanan_changes.sql
\i functions/cek_ketersediaan.sql
\i functions/get_kamar_tersedia.sql

-- 3. Enable RLS
\i policies/rls_enable.sql

-- 4. Create Policies
\i policies/kamar_policies.sql
\i policies/kamar_foto_policies.sql
\i policies/pesanan_policies.sql
\i policies/pesanan_log_policies.sql
\i policies/admin_users_policies.sql

-- 5. Seed Data
\i seeds/kamar_seed.sql
\i seeds/admin_seed.sql

-- 6. Verify
SELECT 'Migration 001 completed successfully' AS status;
```

---

## 12. Backup Strategy

| Aspek | Detail |
|-------|--------|
| **Auto Backup** | Supabase built-in daily backups (retention 7 days pada tier gratis, 30+ hari paid) |
| **Manual Backup** | pg_dump sebelum deployment besar |
| **Point-in-Time** | Tersedia di tier Pro+, recovery ke detik tertentu |
| **Export** | Monthly CSV export untuk laporan keuangan |

---

*Schema ini dirancang untuk skalabilitas dan dapat di-extend dengan fitur tambahan seperti review, wishlist, dan loyalty program di masa depan.*

**Prepared by:** Lead Product Manager & Database Architect  
**Date:** Juni 2026  
**Version:** 1.0
