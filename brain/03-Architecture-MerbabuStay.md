# Architecture Plan

## MerbabuStay - Platform Pemesanan Homestay

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    MERBABUSTAY ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              CLIENT LAYER                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │   │
│  │  │   Desktop    │  │   Mobile     │  │   Tablet     │  │   Duitku Payment     │  │   │
│  │  │   Browser    │  │   Browser    │  │   Browser    │  │   Page (Redirect)    │  │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────────────────────┘  │   │
│  └─────────┼─────────────────┼─────────────────┼──────────────────────────────────────┘   │
│            │                 │                 │                                          │
│            └─────────────────┴─────────────────┘                                          │
│                              │                                                            │
│                              ▼ HTTPS                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐   │
│  │                         NEXT.JS 14 APP ROUTER                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────────────────────┐  │   │
│  │  │                         PRESENTATION LAYER                                   │  │   │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────────────────┐  │  │   │
│  │  │  │  Landing    │ │   Room      │ │  Checkout   │ │  Status Pages         │  │  │   │
│  │  │  │  Page (/)   │ │  Detail     │ │  Page       │ │  (/pesanan/sukses,   │  │  │   │
│  │  │  │             │ │  (/kamar/*) │ │  (/checkout)│ │  /pesanan/pending,   │  │  │   │
│  │  │  │  • Hero     │ │             │ │             │ │  /pesanan/gagal)     │  │  │   │
│  │  │  │  • RoomGrid │ │  • Gallery  │ │  • Form     │ │                      │  │  │   │
│  │  │  │  • Features │ │  • Calendar │ │  • Summary  │ │  • Success Animation │  │  │   │
│  │  │  │  • Footer   │ │  • Booking  │ │  • Payment  │ │  • Countdown Timer   │  │  │   │
│  │  │  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └───────────┬───────────┘  │  │   │
│  │  └─────────┼───────────────┼───────────────┼────────────────────┼──────────────┘  │   │
│  │            │               │               │                    │                 │   │
│  │  ┌─────────┴───────────────┴───────────────┴────────────────────┴───────────────┐  │   │
│  │  │                         SERVER LAYER (App Router)                            │  │   │
│  │  │  ┌───────────────────────────────────────────────────────────────────────┐   │  │   │
│  │  │  │  SERVER COMPONENTS (async, direct DB access)                        │   │  │   │
│  │  │  │  • page.tsx (Server-Side Rendering)                                 │   │  │   │
│  │  │  │  • layout.tsx (Root & Segmented)                                    │   │  │   │
│  │  │  │  • Server Actions (form submission, mutations)                      │   │  │   │
│  │  │  └───────────────────────────────────────────────────────────────────────┘   │  │   │
│  │  │                                                                               │  │   │
│  │  │  ┌───────────────────────────────────────────────────────────────────────┐   │  │   │
│  │  │  │  API ROUTES (Route Handlers)                                         │   │  │   │
│  │  │  │  • /api/pesanan              → Create Order                         │   │  │   │
│  │  │  │  • /api/pesanan/[id]         → Get/Update Order                   │   │  │   │
│  │  │  │  • /api/pesanan/[id]/batal   → Cancel Order                       │   │  │   │
│  │  │  │  • /api/pesanan/[id]/retry   → Retry Payment                      │   │  │   │
│  │  │  │  • /api/kamar/cek-ketersediaan → Check Room Availability          │   │  │   │
│  │  │  │  • /api/payment/callback     → Duitku Webhook                    │   │  │   │
│  │  │  │  • /api/payment/check-status → Check Payment Status              │   │  │   │
│  │  │  │  • /api/notifications/send   → Send Email/Telegram              │   │  │   │
│  │  │  └───────────────────────────────────────────────────────────────────────┘   │  │   │
│  │  └──────────────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                                    │   │
│  │  ┌──────────────────────────────────────────────────────────────────────────────┐  │   │
│  │  │                         INTEGRATION LAYER                                   │  │   │
│  │  │                                                                              │  │   │
│  │  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────────┐  │  │   │
│  │  │  │  Supabase   │   │   Duitku    │   │   Resend    │   │   Telegram      │  │  │   │
│  │  │  │  Client SDK │   │  API Client │   │  API Client │   │  Bot API Client │  │  │   │
│  │  │  │             │   │             │   │             │   │                 │  │  │   │
│  │  │  │  Database   │   │  Payment    │   │  Email      │   │  Admin          │  │  │   │
│  │  │  │  Auth       │   │  Gateway    │   │  Service    │   │  Notifications  │  │  │   │
│  │  │  │  Storage    │   │             │   │             │   │                 │  │  │   │
│  │  │  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └────────┬────────┘  │  │   │
│  │  └─────────┼─────────────────┼─────────────────┼─────────────────────┼───────────┘  │   │
│  └────────────┼─────────────────┼─────────────────┼─────────────────────┼──────────────┘   │
│               │                 │                 │                     │                  │
│               ▼                 ▼                 ▼                     ▼                  │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              EXTERNAL SERVICES LAYER                                │   │
│  │                                                                                      │   │
│  │  ┌────────────────────────┐  ┌─────────────┐  ┌──────────┐  ┌──────────────────┐   │   │
│  │  │      SUPABASE          │  │   DUITKU    │  │  RESEND  │  │    TELEGRAM      │   │   │
│  │  │                        │  │             │  │          │  │    BOT API       │   │   │
│  │  │  ┌──────────────────┐  │  │  ┌───────┐  │  │ ┌──────┐ │  │  ┌──────────┐    │   │   │
│  │  │  │   PostgreSQL     │  │  │  │Payment│  │  │ │Email │ │  │  │  Group   │    │   │   │
│  │  │  │   Database       │◀─┼──┼──┤Gateway│  │  │ │Send  │ │  │  │  Admin   │    │   │   │
│  │  │  │                  │  │  │  │       │  │  │ │      │ │  │  │  Chat    │    │   │   │
│  │  │  │  • kamar         │  │  │  └───────┘  │  │ └──────┘ │  │  └──────────┘    │   │   │
│  │  │  │  • pesanan       │  │  │             │  │          │  │                  │   │   │
│  │  │  │  • kamar_foto    │  │  │  ┌───────┐  │  │          │  │  Bot Father      │   │   │
│  │  │  │  • admin_users   │  │  │  │Merchant│  │  │          │  │  Webhook         │   │   │
│  │  │  │                  │  │  │  │Portal  │  │  │          │  │                  │   │   │
│  │  │  │  Row Level       │  │  │  └───────┘  │  │          │  │                  │   │   │
│  │  │  │  Security (RLS)  │  │  │             │  │          │  │                  │   │   │
│  │  │  └──────────────────┘  │  └─────────────┘  └──────────┘  └──────────────────┘   │   │
│  │  │                        │                                                          │   │
│  │  │  ┌──────────────────┐  │                                                          │   │
│  │  │  │   Auth (Built-in)│  │                                                          │   │
│  │  │  │   • Admin Login  │  │                                                          │   │
│  │  │  └──────────────────┘  │                                                          │   │
│  │  │                        │                                                          │   │
│  │  │  ┌──────────────────┐  │                                                          │   │
│  │  │  │   Storage        │  │                                                          │   │
│  │  │  │   • Room Photos  │  │                                                          │   │
│  │  │  └──────────────────┘  │                                                          │   │
│  │  └────────────────────────┘                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                            │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Komponen Teknologi Detail

### 2.1 Next.js 14 (App Router)

| Aspek | Detail |
|-------|--------|
| **Framework** | Next.js 14 dengan App Router (`app/` directory) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS 3.4 + shadcn/ui components |
| **Rendering** | Server-Side Rendering (SSR) untuk SEO, Client Components untuk interaktivitas |
| **Routing** | File-based routing dengan dynamic segments |
| **State Management** | React Server Actions + useState/useContext (client) |

**Struktur Folder:**
```
merbabustay/
├── app/                          # App Router
│   ├── page.tsx                  # Landing Page (SSR)
│   ├── layout.tsx                # Root Layout
│   ├── globals.css               # Global styles
│   │
│   ├── kamar/
│   │   └── [slug]/
│   │       └── page.tsx          # Detail Kamar (SSR)
│   │
│   ├── checkout/
│   │   └── page.tsx              # Checkout Page
│   │
│   ├── pesanan/
│   │   ├── sukses/
│   │   │   └── page.tsx          # Payment Success
│   │   ├── pending/
│   │   │   └── page.tsx          # Payment Pending
│   │   └── gagal/
│   │       └── page.tsx          # Payment Failed
│   │
│   ├── api/                      # Route Handlers
│   │   ├── pesanan/
│   │   │   └── route.ts          # POST: Create order
│   │   ├── pesanan/[id]/
│   │   │   └── route.ts          # GET/PUT: Order detail & update
│   │   ├── pesanan/[id]/batal/
│   │   │   └── route.ts          # POST: Cancel order
│   │   ├── pesanan/[id]/retry/
│   │   │   └── route.ts          # POST: Retry payment
│   │   ├── kamar/
│   │   │   └── cek-ketersediaan/
│   │   │       └── route.ts      # POST: Check availability
│   │   ├── payment/
│   │   │   ├── callback/
│   │   │   │   └── route.ts      # POST: Duitku webhook
│   │   │   └── check-status/
│   │   │       └── route.ts      # GET: Check payment status
│   │   └── notifications/
│   │       └── send/
│   │           └── route.ts      # POST: Send notifications
│   │
│   └── admin/                    # Admin Dashboard (protected)
│       ├── login/
│       │   └── page.tsx
│       └── dashboard/
│           ├── page.tsx          # Orders list
│           └── kamar/
│               └── page.tsx      # Room management
│
├── components/                   # Reusable Components
│   ├── ui/                       # shadcn/ui components
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── RoomGrid.tsx
│   │   └── FeaturesSection.tsx
│   └── rooms/
│       ├── RoomCard.tsx
│       ├── RoomGallery.tsx
│       ├── BookingWidget.tsx
│       └── RoomFacilities.tsx
│
├── lib/                          # Utilities & Config
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server client
│   ├── duitku/
│   │   └── client.ts             # Duitku API client
│   ├── resend/
│   │   └── client.ts             # Resend email client
│   ├── telegram/
│   │   └── client.ts             # Telegram bot client
│   └── utils.ts                  # Helper functions
│
├── types/                        # TypeScript Types
│   ├── kamar.ts
│   ├── pesanan.ts
│   └── duitku.ts
│
├── public/                       # Static Assets
│   └── images/
│       └── rooms/
│
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

### 2.2 Supabase

| Aspek | Detail |
|-------|--------|
| **Database** | PostgreSQL 15+ |
| **Auth** | Supabase Auth (admin only) |
| **Storage** | Supabase Storage (room photos) |
| **RLS** | Row Level Security untuk proteksi data |
| **Real-time** | Supabase Realtime untuk update ketersediaan (optional) |

**Konfigurasi Koneksi:**
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';

export const createClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set(name, value, options),
        remove: (name, options) => cookieStore.set(name, '', options),
      },
    }
  );
};
```

**RLS Policies:**
```sql
-- Kamar: Public read
CREATE POLICY "kamar_public_select" ON kamar
  FOR SELECT USING (true);

-- Kamar: Admin only write
CREATE POLICY "kamar_admin_all" ON kamar
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));

-- Pesanan: Public create (untuk booking)
CREATE POLICY "pesanan_public_insert" ON pesanan
  FOR INSERT WITH CHECK (true);

-- Pesanan: Public read by email + kode
CREATE POLICY "pesanan_public_select" ON pesanan
  FOR SELECT USING (email = current_setting('request.jwt.claims')::json->>'email');
```

---

### 2.3 Duitku (Payment Gateway)

| Aspek | Detail |
|-------|--------|
| **Environment** | Sandbox (dev) / Production (live) |
| **API Base URL** | `https://sandbox.duitku.com` (sandbox) |
| **Endpoints** | `/api/merchant/v2/inquiry`, `/api/merchant/paymentmethod/getpaymentmethod`, `/api/merchant/transactionStatus` |
| **Security** | SHA256 Signature |
| **Callback** | Server-to-server POST callback |
| **Return URL** | Client redirect setelah pembayaran |

**Konfigurasi:**
```typescript
// lib/duitku/config.ts
export const DUITKU_CONFIG = {
  merchantCode: process.env.DUITKU_MERCHANT_CODE!,
  apiKey: process.env.DUITKU_API_KEY!,
  baseUrl: process.env.DUITKU_ENV === 'production' 
    ? 'https://passport.duitku.com'
    : 'https://sandbox.duitku.com',
  callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`,
  returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pesanan/sukses`,
  expiryPeriod: 1440, // 24 jam dalam menit
};
```

---

### 2.4 Resend (Email Service)

| Aspek | Detail |
|-------|--------|
| **API** | `https://api.resend.com/emails` |
| **Auth** | API Key via Authorization header |
| **Template** | React Email / HTML inline |
| **Rate Limit** | 100 emails/day (free), 50,000/month (paid) |

**Konfigurasi:**
```typescript
// lib/resend/client.ts
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

// Penggunaan
await resend.emails.send({
  from: 'MerbabuStay <invoice@merbabustay.id>',
  to: userEmail,
  subject: `Pesanan Confirmed - ${orderCode} | MerbabuStay`,
  html: invoiceHtml,
});
```

---

### 2.5 Telegram Bot API

| Aspek | Detail |
|-------|--------|
| **API Base** | `https://api.telegram.org/bot{token}` |
| **Method** | `sendMessage` untuk notifikasi teks |
| **Format** | MarkdownV2 dengan escape character |
| **Target** | Grup Telegram admin |

**Konfigurasi:**
```typescript
// lib/telegram/config.ts
export const TELEGRAM_CONFIG = {
  botToken: process.env.TELEGRAM_BOT_TOKEN!,
  adminGroupId: process.env.TELEGRAM_ADMIN_GROUP_ID!, // Contoh: -1001234567890
};
```

---

## 3. Communication Flow & Data Flow

### 3.1 Arsitektur Komunikasi Antar Komponen

```
┌──────────┐     HTTP Request      ┌──────────┐
│  Client  │ ────────────────────▶ │ Next.js  │
│ (Browser)│                      │  Server  │
│          │ ◀──────────────────── │          │
└──────────┘     HTML/JSON         └────┬─────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
              ┌──────────┐      ┌──────────┐      ┌──────────┐
              │ Supabase │      │  Duitku  │      │  Resend  │
              │          │      │          │      │          │
              │ PostgreSQL│      │  Payment │      │  Email   │
              │  Auth    │      │  Gateway │      │  Service │
              │ Storage  │      │          │      │          │
              └──────────┘      └──────────┘      └──────────┘
                                                      │
                                                      ▼
                                               ┌──────────┐
                                               │ Telegram │
                                               │   Bot    │
                                               └──────────┘
```

### 3.2 Data Flow Patterns

| Pattern | Deskripsi | Contoh Penggunaan |
|---------|-----------|-------------------|
| **SSR Data Fetch** | Server fetch data saat render | Landing page fetch daftar kamar |
| **Client Fetch** | Client-side fetch setelah hydrate | Kalender ketersediaan real-time |
| **Server Action** | Form submission langsung ke server | Form checkout, create pesanan |
| **Webhook** | External service push data ke server | Duitku callback |
| **API Route** | REST API endpoint | Cek status pembayaran, retry |

### 3.3 API Contract (Internal)

#### Create Order
```
POST /api/pesanan
Content-Type: application/json

Request:
{
  "kamar_id": "uuid",
  "nama_lengkap": "string (min 3)",
  "email": "string (email format)",
  "no_hp": "string (10-15 digit)",
  "check_in": "YYYY-MM-DD",
  "check_out": "YYYY-MM-DD",
  "jumlah_tamu": "integer (1-10)",
  "catatan": "string (optional, max 500)"
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "kode_pesanan": "MBS-20260624-7842",
    "status": "waiting_payment",
    "total_harga": 850000,
    "payment_url": "https://sandbox.duitku.com/...",
    "expired_at": "2026-06-25T14:30:00Z"
  }
}

Response 400:
{
  "success": false,
  "error": "Tanggal tidak tersedia"
}
```

#### Duitku Callback
```
POST /api/payment/callback
Content-Type: application/x-www-form-urlencoded

Payload:
{
  "merchantCode": "DXXXX",
  "amount": "850000",
  "merchantOrderId": "MBS-20260624-7842",
  "productDetail": "...",
  "additionalParam": "",
  "paymentCode": "OV",
  "resultCode": "00",
  "merchantUserId": "",
  "reference": "D1234567890",
  "publisherOrderId": "",
  "spUserHash": "",
  "settlementDate": "2026-06-25",
  "issuerCode": "",
  "signature": "sha256hash"
}

Response 200:
{ "status": "OK" }
```

---

## 4. Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=https://merbabustay.id

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Duitku (Payment Gateway)
DUITKU_MERCHANT_CODE=DXXXX
DUITKU_API_KEY=your_api_key_here
DUITKU_ENV=sandbox  # sandbox | production

# Resend (Email)
RESEND_API_KEY=re_xxxxxxxx

# Telegram Bot
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_ADMIN_GROUP_ID=-1001234567890

# Admin
ADMIN_SECRET_KEY=your_admin_secret_key
```

---

## 5. Keamanan & Validasi

| Layer | Mekanisme | Implementasi |
|-------|-----------|--------------|
| **Input Validation** | Zod schema validation | Setiap API route validate body/params |
| **SQL Injection** | Parameterized queries | Supabase client (auto-escaped) |
| **Authentication** | Supabase Auth | Admin login dengan email/password + session |
| **Authorization** | RLS Policies | Row Level Security di PostgreSQL |
| **Payment Security** | SHA256 Signature | Validasi signature Duitku callback |
| **CSRF Protection** | Next.js built-in | Server Actions auto-CSRF protection |
| **Rate Limiting** | Vercel Edge Config | Limit API calls per IP |

---

## 6. Deployment Strategy

| Environment | Platform | URL |
|-------------|----------|-----|
| **Development** | Localhost | `http://localhost:3000` |
| **Staging** | Vercel Preview | `https://staging.merbabustay.id` |
| **Production** | Vercel Pro | `https://merbabustay.id` |

**CI/CD Pipeline:**
```
Git Push ──▶ GitHub ──▶ Vercel Build ──▶ Deploy ──▶ Smoke Test
```

---

*Architecture ini dirancang untuk skalabilitas dan dapat di-extend dengan fitur tambahan.*

**Prepared by:** Lead Product Manager & Senior Architect  
**Date:** Juni 2026  
**Version:** 1.0
