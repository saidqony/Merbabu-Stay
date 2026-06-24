# Wireframe UI/UX - Landing Page MerbabuStay

## 🎨 AI Design Prompt untuk Stitch AI

---

## 1. Design System & Color Palette

### 60-30-10 Color Rule

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              60-30-10 COLOR SYSTEM                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────┐  60% BASE    │
│  │                                                                    │              │
│  │   #F5F0E8  │  #FAF7F2  │  #EDE7DB  │  #FFFFFF  │  #F0EBE3        │  DOMINANT    │
│  │   Krem      │  Krem     │  Warm     │  Putih    │  Bone           │              │
│  │   Muda      │  Pucat    │  Beige    │  Tulang   │  Warm           │  Backgrounds │
│  │             │           │           │           │                 │  Surfaces    │
│  └────────────────────────────────────────────────────────────────────┘  Cards BG    │
│                                                                                      │
│  ┌────────────────────────────────────────────────────┐  30% SECONDARY               │
│  │   #7A8B6F  │  #5C6B52  │  #A8B89E  │  #3D4A35        │  SUPPORTING                │
│  │   Sage      │  Fern     │  Mint     │  Forest         │                            │
│  │   Green     │  Green    │  Green    │  Dark           │  Text Headings             │
│  │             │           │           │                 │  Primary Buttons           │
│  └────────────────────────────────────────────────────┘  Navbar                      │
│                                                                                      │
│  ┌────────────────────────────────────────────────────┐  10% ACCENT                  │
│  │   #C4956A  │  #D4A76A  │  #8B6F47  │  #E8DCC8        │  HIGHLIGHT                 │
│  │   Wood      │  Honey    │  Bronze   │  Sand           │                            │
│  │   Brown     │  Gold     │           │                 │  CTAs                      │
│  │             │           │           │                 │  Hover states              │
│  └────────────────────────────────────────────────────┘  Price tags                  │
│                                                          Icons                       │
│                                                          Decorative                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Complete Color Spec

| Token | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| `--color-base-100` | `#F5F0E8` | Page background, light sections | `bg-[#F5F0E8]` |
| `--color-base-200` | `#FAF7F2` | Card backgrounds, elevated surfaces | `bg-[#FAF7F2]` |
| `--color-base-300` | `#EDE7DB` | Borders, dividers, subtle backgrounds | `bg-[#EDE7DB]` |
| `--color-primary-500` | `#7A8B6F` | Primary buttons, active states, links | `bg-[#7A8B6F]` |
| `--color-primary-600` | `#5C6B52` | Button hover, headings, navbar | `bg-[#5C6B52]` |
| `--color-primary-700` | `#3D4A35` | Dark headings, footer background | `bg-[#3D4A35]` |
| `--color-accent-500` | `#C4956A` | CTA buttons, price highlights, badges | `bg-[#C4956A]` |
| `--color-accent-400` | `#D4A76A` | Hover accent, icons, decorative | `text-[#D4A76A]` |
| `--color-accent-700` | `#8B6F47` | Dark accent borders | `border-[#8B6F47]` |
| `--color-text-primary` | `#2D3328` | Body text, descriptions | `text-[#2D3328]` |
| `--color-text-secondary` | `#6B7560` | Secondary text, captions | `text-[#6B7560]` |

### Typography System

| Element | Font | Weight | Size (Desktop) | Size (Mobile) | Line Height |
|---------|------|--------|----------------|---------------|-------------|
| H1 (Hero) | Playfair Display | 700 | 56px | 36px | 1.1 |
| H2 (Section) | Playfair Display | 600 | 42px | 28px | 1.2 |
| H3 (Card Title) | Playfair Display | 600 | 24px | 20px | 1.3 |
| Body | Inter | 400 | 16px | 15px | 1.6 |
| Caption | Inter | 400 | 14px | 13px | 1.5 |
| Button | Inter | 600 | 16px | 15px | 1 |
| Price | Inter | 700 | 22px | 18px | 1 |

---

## 2. Wireframe Structure - Landing Page

### Section 1: NAVBAR (Fixed Header)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ NAVBAR - Fixed Position, z-50, Backdrop Blur on Scroll                             │
│ Height: 80px Desktop / 64px Mobile                                                  │
│ Background: transparent → rgba(245,240,232,0.95) on scroll (transition 300ms)      │
│ Border-bottom: 1px solid transparent → rgba(237,231,219,0.8) on scroll             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                             │    │
│  │  [🌿 LOGO]              Beranda    Kamar    Tentang    Kontak    [Booking▼] │    │
│  │   MerbabuStay           ──────    ─────    ───────    ───────   ┌────────┐ │    │
│  │   (Icon: Mountain     underline  plain    plain      plain     │Book Now│ │    │
│  │    leaf icon + text    active)   text     text       text      │ #7A8B6F│ │    │
│  │    #5C6B52)                       #2D3328  #2D3328   #2D3328   │ white  │ │    │
│  │                                  hover:    hover:    hover:    │ 16px   │ │    │
│  │                                  #7A8B6F   #7A8B6F   #7A8B6F   │ 600w   │ │    │
│  │                                  underline underline underline  └────────┘ │    │
│  │                                                                             │    │
│  │  Mobile: Hamburger Menu (☰)  ──▶  Slide-in Drawer from Right              │    │
│  │                                                                             │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Logo Spec:**
- Icon: Gunung + daun (simple line art, stroke 2px, color: `#5C6B52`)
- Text: "MerbabuStay" - Playfair Display 700, 22px, color: `#5C6B52`
- Subtitle: "HOMEMADE STAY" - Inter 500, 8px, letter-spacing: 3px, color: `#7A8B6F`

**Navigation Behavior:**
- `Beranda`: Scroll to top, active state (underline 2px `#7A8B6F`)
- `Kamar`: Scroll to rooms section (`#kamar`)
- `Tentang`: Scroll to about/features section
- `Kontak`: Scroll to footer
- `Book Now`: Solid pill button, `#7A8B6F` bg, white text, hover: `#5C6B52`, shadow on hover

---

### Section 2: HERO SECTION

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ HERO SECTION - Full Viewport Height (100vh) min-height: 600px                       │
│ Background: Full-width atmospheric image of Gunung Merbabu at golden hour           │
│ Overlay: Linear gradient from rgba(45,51,40,0.5) bottom to transparent top          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐     │
│  │                                                                             │     │
│  │                                                                             │     │
│  │                    ┌─────────────────────────────────────┐                  │     │
│  │                    │  🏷️ TAGLINE PILL                    │                  │     │
│  │                    │                                     │                  │     │
│  │                    │  "Penginapan Terbaik di Kaki        │                  │     │
│  │                    │   Gunung Merbabu"                   │                  │     │
│  │                    │                                     │                  │     │
│  │                    │  Style: bg-white/20 backdrop-blur   │                  │     │
│  │                    │  Border: 1px solid rgba(255,255,255,│                  │     │
│  │                    │  0.3), rounded-full px-4 py-2       │                  │     │
│  │                    │  Font: Inter 500, 13px, white       │                  │     │
│  │                    └─────────────────────────────────────┘                  │     │
│  │                                                                             │     │
│  │                                                                             │     │
│  │              ┌─────────────────────────────────────────────────┐            │     │
│  │              │  MAIN HEADLINE                                  │            │     │
│  │              │                                                 │            │     │
│  │              │  Rasakan Ketenangan                             │            │     │
│  │              │  Menginap di Kaki                               │            │     │
│  │              │  Gunung Merbabu                                 │            │     │
│  │              │                                                 │            │     │
│  │              │  Font: Playfair Display 700                     │            │     │
│  │              │  Size: 56px (mobile: 36px)                      │            │     │
│  │              │  Color: #FFFFFF                                 │            │     │
│  │              │  Text Shadow: 0 2px 20px rgba(0,0,0,0.3)       │            │     │
│  │              │  Max-width: 640px                               │            │     │
│  │              │  Line-height: 1.1                               │            │     │
│  │              └─────────────────────────────────────────────────┘            │     │
│  │                                                                             │     │
│  │                                                                             │     │
│  │         ┌──────────────────────────────────────────────────────┐             │     │
│  │         │  SUBTITLE                                          │             │     │
│  │         │                                                      │             │     │
│  │         │  Homestay nyaman dengan pemandangan spektakuler,   │             │     │
│  │         │  udara segar pegunungan, dan fasilitas lengkap     │             │     │
│  │         │  untuk liburan keluarga maupun petualanganmu.      │             │     │
│  │         │                                                      │             │     │
│  │         │  Font: Inter 400, 18px (mobile: 16px)              │             │     │
│  │         │  Color: rgba(255,255,255,0.9)                      │             │     │
│  │         │  Max-width: 520px                                  │             │     │
│  │         │  Line-height: 1.6                                  │             │     │
│  │         └──────────────────────────────────────────────────────┘             │     │
│  │                                                                             │     │
│  │                                                                             │     │
│  │     ┌──────────────────────┐      ┌────────────────────────────────────┐    │     │
│  │     │  PRIMARY CTA         │      │  SECONDARY CTA                     │    │     │
│  │     │                      │      │                                    │    │     │
│  │     │  "Pesan Sekarang"    │      │  "Lihat Kamar"                     │    │     │
│  │     │                      │      │                                    │    │     │
│  │     │  bg: #7A8B6F        │      │  bg: transparent                   │    │     │
│  │     │  text: white         │      │  border: 2px solid white           │    │     │
│  │     │  px: 32px            │      │  text: white                       │    │     │
│  │     │  py: 16px            │      │  px: 32px                          │    │     │
│  │     │  rounded: 12px       │      │  py: 16px                          │    │     │
│  │     │  font: 600           │      │  rounded: 12px                     │    │     │
│  │     │  hover: bg-#5C6B52   │      │  hover: bg-white/10                │    │     │
│  │     │  shadow: lg          │      │                                    │    │     │
│  │     │                      │      │  Icon: ↓ (scroll indicator)        │    │     │
│  │     └──────────────────────┘      └────────────────────────────────────┘    │     │
│  │                                                                             │     │
│  │                                                                             │     │
│  │  ═══════════════════════════════════════════════════════════════════════════ │     │
│  │  SCROLL INDICATOR: Animated bouncing chevron-down at bottom center          │     │
│  │  Color: white, opacity: 0.7, animation: bounce 2s infinite                  │     │
│  │  ═══════════════════════════════════════════════════════════════════════════ │     │
│  │                                                                             │     │
│  └─────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Hero Image Spec for AI:**
> "Wide-angle landscape photograph of Gunung Merbabu at golden hour sunrise, misty mountains layered in the background, traditional Javanese village rooftops in the foreground, warm golden sunlight, atmospheric haze, cinematic composition, no text, no watermark, 16:9 aspect ratio, 4K quality"

---

### Section 3: QUICK BOOKING BAR (Overlapping Hero)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ QUICK BOOKING BAR - Floating card overlapping Hero bottom                           │
│ Position: Relative, margin-top: -60px, z-index: 10                                  │
│ Width: max-w-5xl mx-auto, padding: 0 24px                                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                             │    │
│  │   Shadow: 0 20px 60px rgba(45,51,40,0.15)                                   │    │
│  │   Border-radius: 20px                                                       │    │
│  │   Background: #FFFFFF                                                       │    │
│  │   Padding: 32px                                                             │    │
│  │                                                                             │    │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │    │
│  │   │  CHECK-IN    │  │  CHECK-OUT   │  │  TAMU        │  │  BOOK        │   │    │
│  │   │              │  │              │  │              │  │              │   │    │
│  │   │  📅 Tanggal  │  │  📅 Tanggal  │  │  👥 2 Dewasa │  │  Cari        │   │    │
│  │   │  Masuk       │  │  Keluar      │  │              │  │ Kamar        │   │    │
│  │   │              │  │              │  │  ▼ Dropdown  │  │              │   │    │
│  │   │  24 Jun 2026 │  │  26 Jun 2026 │  │  1-10 tamu   │  │              │   │    │
│  │   │              │  │              │  │              │  │  bg: #7A8B6F │   │    │
│  │   │  Label:      │  │  Label:      │  │  Label:      │  │  text: white │   │    │
│  │   │  "Tanggal    │  │  "Tanggal    │  │  "Jumlah     │  │  rounded:    │   │    │
│  │   │   Masuk"     │  │   Keluar"    │  │   Tamu"      │  │  12px        │   │    │
│  │   │  Font: 13px  │  │  Font: 13px  │  │  Font: 13px  │  │  px: 32px    │   │    │
│  │   │  #6B7560     │  │  #6B7560     │  │  #6B7560     │  │  py: 16px    │   │    │
│  │   │              │  │              │  │              │  │  font: 600   │   │    │
│  │   │  Date:       │  │  Date:       │  │  Value:      │  │  hover:      │   │    │
│  │   │  Inter 500   │  │  Inter 500   │  │  Inter 500   │  │  #5C6B52     │   │    │
│  │   │  16px        │  │  16px        │  │  16px        │  │  shadow-lg   │   │    │
│  │   │  #2D3328     │  │  #2D3328     │  │  #2D3328     │  │              │   │    │
│  │   │              │  │              │  │              │  │  Icon: 🔍    │   │    │
│  │   │  Icon: 📅    │  │  Icon: 📅    │  │  Icon: 👥    │  │              │   │    │
│  │   │  #7A8B6F     │  │  #7A8B6F     │  │  #7A8B6F     │  │              │   │    │
│  │   │              │  │              │  │              │  │              │   │    │
│  │   │  Divider:    │  │  Divider:    │  │              │  │              │   │    │
│  │   │  1px solid   │  │  1px solid   │  │              │  │              │   │    │
│  │   │  #EDE7DB     │  │  #EDE7DB     │  │              │  │              │   │    │
│  │   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │    │
│  │                                                                             │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  Mobile: Stack vertically (1 column), full width, padding: 20px                     │
│  Tablet: 2x2 grid (dates row 1, guest+button row 2)                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Section 4: FEATURES / WHY CHOOSE US

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ FEATURES SECTION - Padding: 100px 0 (desktop), 60px 0 (mobile)                      │
│ Background: #F5F0E8 (base color)                                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                             │    │
│  │  Section Label: "MENGAPA MEMILIH KAMI"                                      │    │
│  │  Font: Inter 600, 13px, #7A8B6F, letter-spacing: 2px, uppercase            │    │
│  │                                                                             │    │
│  │  Section Title: "Pengalaman Menginap yang                                    │    │
│  │                 Berkesan dan Nyaman"                                        │    │
│  │  Font: Playfair Display 600, 42px (mobile: 28px), #5C6B52                   │    │
│  │  Max-width: 600px, text-align: center, mx-auto                              │    │
│  │                                                                             │    │
│  │  Subtitle: "Kami hadir untuk memastikan setiap momen liburan Anda           │    │
│  │            di Merbabu menjadi pengalaman tak terlupakan"                    │    │
│  │  Font: Inter 400, 16px, #6B7560, text-align: center                        │    │
│  │                                                                             │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                             │    │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │    │
│  │  │   🌿             │  │   🏔️             │  │   🔥             │          │    │
│  │  │                  │  │                  │  │                  │          │    │
│  │  │  Icon: 48x48px   │  │  Icon: 48x48px   │  │  Icon: 48x48px   │          │    │
│  │  │  Color: #7A8B6F  │  │  Color: #7A8B6F  │  │  Color: #7A8B6F  │          │    │
│  │  │  Style: Line art │  │  Style: Line art │  │  Style: Line art │          │    │
│  │  │  stroke: 1.5px   │  │  stroke: 1.5px   │  │  stroke: 1.5px   │          │    │
│  │  │                  │  │                  │  │                  │          │    │
│  │  │  Lokasi Strategis│  │  Pemandangan     │  │  Fasilitas       │          │    │
│  │  │                  │  │  Memukau         │  │  Lengkap         │          │    │
│  │  │  Title:          │  │  Title:          │  │  Title:          │          │    │
│  │  │  Playfair 600    │  │  Playfair 600    │  │  Playfair 600    │          │    │
│  │  │  20px, #5C6B52   │  │  20px, #5C6B52   │  │  20px, #5C6B52   │          │    │
│  │  │                  │  │                  │  │                  │          │    │
│  │  │  Description:    │  │  Description:    │  │  Description:    │          │    │
│  │  │  Hanya 5 menit   │  │  Nikmati sunrise │  │  WiFi, TV,       │          │    │
│  │  │  dari basecamp   │  │  & sunset        │  │  kitchen,        │          │    │
│  │  │  pendakian       │  │  langsung dari   │  │  hot water,      │          │    │
│  │  │  Gunung Merbabu  │  │  balkon kamar    │  │  parking         │          │    │
│  │  │                  │  │                  │  │                  │          │    │
│  │  │  Font: Inter     │  │  Font: Inter     │  │  Font: Inter     │          │    │
│  │  │  15px, #6B7560   │  │  15px, #6B7560   │  │  15px, #6B7560   │          │    │
│  │  │  text-center     │  │  text-center     │  │  text-center     │          │    │
│  │  │                  │  │                  │  │                  │          │    │
│  │  │  Card BG:        │  │  Card BG:        │  │  Card BG:        │          │    │
│  │  │  #FAF7F2         │  │  #FAF7F2         │  │  #FAF7F2         │          │    │
│  │  │  Border-radius:  │  │  Border-radius:  │  │  Border-radius:  │          │    │
│  │  │  16px            │  │  16px            │  │  16px            │          │    │
│  │  │  Padding: 40px   │  │  Padding: 40px   │  │  Padding: 40px   │          │    │
│  │  │  text-center     │  │  text-center     │  │  text-center     │          │    │
│  │  │  Shadow: subtle  │  │  Shadow: subtle  │  │  Shadow: subtle  │          │    │
│  │  │  hover: translate│  │  hover: translate│  │  hover: translate│          │    │
│  │  │  Y(-4px) shadow  │  │  Y(-4px) shadow  │  │  Y(-4px) shadow  │          │    │
│  │  │  increase        │  │  increase        │  │  increase        │          │    │
│  │  │  transition 300ms│  │  transition 300ms│  │  transition 300ms│          │    │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘          │    │
│  │                                                                             │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  Mobile: Single column stack, 3 cards vertical                                       │
│  Tablet: 3 columns (1 row)                                                           │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Section 5: ROOMS GRID (Daftar Kamar)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ ROOMS GRID SECTION - Padding: 100px 0, ID: "kamar"                                  │
│ Background: #FAF7F2 (slightly lighter than base)                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                             │    │
│  │  Section Label: "PILIHAN KAMAR"                                             │    │
│  │  Font: Inter 600, 13px, #C4956A, letter-spacing: 2px, uppercase            │    │
│  │                                                                             │    │
│  │  Section Title: "Temukan Kamar Ideal untuk                                  │    │
│  │                 Liburan Anda"                                               │    │
│  │  Font: Playfair Display 600, 42px (mobile: 28px), #5C6B52                   │    │
│  │                                                                             │    │
│  │  Subtitle: "Dari kamar cozy untuk solo traveler hingga villa               │    │
│  │            keluarga dengan pemandangan gunung"                              │    │
│  │  Font: Inter 400, 16px, #6B7560                                            │    │
│  │                                                                             │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                             │    │
│  │  FILTER TABS:                                                               │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │    │
│  │  │ Semua    │ │ Standard │ │ Deluxe   │ │ Family   │ │ Villa    │        │    │
│  │  │ (active) │ │          │ │          │ │          │ │          │        │    │
│  │  │ bg:      │ │ bg:      │ │ bg:      │ │ bg:      │ │ bg:      │        │    │
│  │  │ #5C6B52  │ │transparnt│ │transparnt│ │transparnt│ │transparnt│        │    │
│  │  │ text:    │ │ text:    │ │ text:    │ │ text:    │ │ text:    │        │    │
│  │  │ white    │ │ #5C6B52  │ │ #5C6B52  │ │ #5C6B52  │ │ #5C6B52  │        │    │
│  │  │ rounded: │ │ rounded: │ │ rounded: │ │ rounded: │ │ rounded: │        │    │
│  │  │ pill     │ │ pill     │ │ pill     │ │ pill     │ │ pill     │        │    │
│  │  │ px:20    │ │ px:20    │ │ px:20    │ │ px:20    │ │ px:20    │        │    │
│  │  │ py:8     │ │ py:8     │ │ py:8     │ │ py:8     │ │ py:8     │        │    │
│  │  │ border:  │ │ border:  │ │ border:  │ │ border:  │ │ border:  │        │    │
│  │  │ none     │ │ 1px solid│ │ 1px solid│ │ 1px solid│ │ 1px solid│        │    │
│  │  │          │ │ #5C6B52  │ │ #5C6B52  │ │ #5C6B52  │ │ #5C6B52  │        │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │    │
│  │                                                                             │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ═══════════════════════════════════════════════════════════════════════════════     │
│                                                                                      │
│  GRID LAYOUT: 3 columns desktop / 2 columns tablet / 1 column mobile                │
│  Gap: 32px, Max-width: 1200px, mx-auto                                              │
│                                                                                      │
│  ┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐
│  │   🏠 ROOM CARD 1         │  │   🏠 ROOM CARD 2         │  │   🏠 ROOM CARD 3         │
│  │                          │  │                          │  │                          │
│  │  ┌──────────────────────┐│  │  ┌──────────────────────┐│  │  ┌──────────────────────┐│
│  │  │                      ││  │  │                      ││  │  │                      ││
│  │  │   ROOM PHOTO         ││  │  │   ROOM PHOTO         ││  │  │   ROOM PHOTO         ││
│  │  │                      ││  │  │                      ││  │  │                      ││
│  │  │   Aspect: 4:3        ││  │  │   Aspect: 4:3        ││  │  │   Aspect: 4:3        ││
│  │  │   Object-fit: cover  ││  │  │   Object-fit: cover  ││  │  │   Object-fit: cover  ││
│  │  │   Border-radius:     ││  │  │   Border-radius:     ││  │  │   Border-radius:     ││
│  │  │   16px 16px 0 0      ││  │  │   16px 16px 0 0      ││  │  │   16px 16px 0 0      ││
│  │  │                      ││  │  │                      ││  │  │                      ││
│  │  │  [BADGE top-left]    ││  │  │  [BADGE top-left]    ││  │  │  [BADGE top-left]    ││
│  │  │  "Populer"           ││  │  │  "Best View"         ││  │  │  "Family"            ││
│  │  │  bg: #C4956A         ││  │  │  bg: #7A8B6F         ││  │  │  bg: #5C6B52         ││
│  │  │  text: white         ││  │  │  text: white         ││  │  │  text: white         ││
│  │  │  px: 12px, py: 4px   ││  │  │  px: 12px, py: 4px   ││  │  │  px: 12px, py: 4px   ││
│  │  │  rounded: 0 8px 0 8px││  │  │  rounded: 0 8px 0 8px││  │  │  rounded: 0 8px 0 8px│
│  │  │  font: 12px 600      ││  │  │  font: 12px 600      ││  │  │  font: 12px 600      ││
│  │  │                      ││  │  │                      ││  │  │                      ││
│  │  └──────────────────────┘│  │  └──────────────────────┘│  │  └──────────────────────┘│
│  │                          │  │                          │  │                          │
│  │  Card Body (bg: white,   │  │  Card Body (bg: white,   │  │  Card Body (bg: white,   │
│  │  padding: 24px,          │  │  padding: 24px,          │  │  padding: 24px,          │
│  │  border-radius: 0 0      │  │  border-radius: 0 0      │  │  border-radius: 0 0      │
│  │  16px 16px)              │  │  16px 16px)              │  │  16px 16px)              │
│  │                          │  │                          │  │                          │
│  │  Room Name               │  │  Room Name               │  │  Room Name               │
│  │  "Kamar Pemandangan      │  │  "Suite Sunrise Deluxe   │  │  "Villa Keluarga Merbabu"│
│  │   Gunung"                │  │   Room"                  │  │                          │
│  │  Font: Playfair 600      │  │  Font: Playfair 600      │  │  Font: Playfair 600      │
│  │  20px, #5C6B52           │  │  20px, #5C6B52           │  │  20px, #5C6B52           │
│  │                          │  │                          │  │                          │
│  │  Room Specs (flex row):  │  │  Room Specs (flex row):  │  │  Room Specs (flex row):  │
│  │  👥 2 Tamu  │  🛏️ 1 Bed │  │  👥 2 Tamu  │  🛏️ 1 King │  │  👥 6 Tamu  │  🛏️ 3 Beds│
│  │  Font: Inter 13px        │  │  Font: Inter 13px        │  │  Font: Inter 13px        │
│  │  #6B7560, gap: 16px      │  │  #6B7560, gap: 16px      │  │  #6B7560, gap: 16px      │
│  │                          │  │                          │  │                          │
│  │  Divider: 1px solid      │  │  Divider: 1px solid      │  │  Divider: 1px solid      │
│  │  #EDE7DB, my: 12px       │  │  #EDE7DB, my: 12px       │  │  #EDE7DB, my: 12px       │
│  │                          │  │                          │  │                          │
│  │  Bottom Row (flex,       │  │  Bottom Row (flex,       │  │  Bottom Row (flex,       │
│  │  justify-between):       │  │  justify-between):       │  │  justify-between):       │
│  │                          │  │                          │  │                          │
│  │  Harga:                  │  │  Harga:                  │  │  Harga:                  │
│  │  Rp 425.000              │  │  Rp 650.000              │  │  Rp 1.200.000            │
│  │  /malam                  │  │  /malam                  │  │  /malam                  │
│  │                          │  │                          │  │                          │
│  │  Font: Inter 700,        │  │  Font: Inter 700,        │  │  Font: Inter 700,        │
│  │  18px, #C4956A           │  │  18px, #C4956A           │  │  18px, #C4956A           │
│  │  "/malam": Inter 400,    │  │  "/malam": Inter 400,    │  │  "/malam": Inter 400,    │
│  │  13px, #6B7560           │  │  13px, #6B7560           │  │  13px, #6B7560           │
│  │                          │  │                          │  │                          │
│  │  [Lihat Detail →]        │  │  [Lihat Detail →]        │  │  [Lihat Detail →]        │
│  │  bg: #7A8B6F             │  │  bg: #7A8B6F             │  │  bg: #7A8B6F             │
│  │  text: white             │  │  text: white             │  │  text: white             │
│  │  rounded: 8px            │  │  rounded: 8px            │  │  rounded: 8px            │
│  │  px: 16px, py: 8px       │  │  px: 16px, py: 8px       │  │  px: 16px, py: 8px       │
│  │  font: 14px 500          │  │  font: 14px 500          │  │  font: 14px 500          │
│  │                          │  │                          │  │                          │
│  │  Card Shadow: 0 4px      │  │  Card Shadow: 0 4px      │  │  Card Shadow: 0 4px      │
│  │  20px rgba(0,0,0,0.06)   │  │  20px rgba(0,0,0,0.06)   │  │  20px rgba(0,0,0,0.06)   │
│  │  hover: shadow-lg,       │  │  hover: shadow-lg,       │  │  hover: shadow-lg,       │
│  │  translateY(-4px)        │  │  translateY(-4px)        │  │  translateY(-4px)        │
│  │  transition 300ms ease   │  │  transition 300ms ease   │  │  transition 300ms ease   │
│  │                          │  │                          │  │                          │
│  └──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘
│                                                                                      │
│  Mobile: Stack 1 column, full width cards                                           │
│  Tablet: 2 columns                                                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Room Card Image Specs for AI:**
> "Cozy bedroom interior with large window showing mountain view, natural wood furniture, white linen bedding, warm morning light, minimalist decor with green plant, sage green accent wall, 4:3 aspect ratio, interior photography style, 4K quality"

---

### Section 6: TESTIMONIALS / GUEST REVIEWS

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ TESTIMONIALS SECTION - Padding: 100px 0                                             │
│ Background: #F5F0E8                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                             │    │
│  │  Section Label: "TESTIMONI TAMU"                                            │    │
│  │  Font: Inter 600, 13px, #7A8B6F, letter-spacing: 2px, uppercase            │    │
│  │                                                                             │    │
│  │  Section Title: "Apa Kata Tamu Kami?"                                       │    │
│  │  Font: Playfair Display 600, 42px (mobile: 28px), #5C6B52                    │    │
│  │                                                                             │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  Carousel / Horizontal Scroll:                                                       │
│                                                                                      │
│  ┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐
│  │                          │  │                          │  │                          │
│  │  ┌────┐                 │  │  ┌────┐                 │  │  ┌────┐                 │
│  │  │ 👤 │  "Pengalaman     │  │  │ 👤 │  "Pemandangan   │  │  │ 👤 │  "Anak-anak     │
│  │  │    │   menginap      │  │  │    │   dari kamar     │  │  │    │   sangat senang  │
│  │  │    │   yang luar      │  │  │    │   sungguh        │  │  │    │   dengan         │
│  │  │    │   biasa! Kamar   │  │  │    │   luar biasa.    │  │  │    │   ruang bermain  │
│  │  │    │   bersih,        │  │  │    │   Sunrise dari   │  │  │    │   dan area       │
│  │  │    │   pemandangan    │  │  │    │   balkon         │  │  │    │   terbuka.       │
│  │  │    │   gunung yang    │  │  │    │   indah          │  │  │    │   Pasti akan     │
│  │  │    │   menakjubkan,   │  │  │    │   banget!"       │  │  │    │   kembali!"      │
│  │  │    │   dan host       │  │  │    │                  │  │  │    │                  │
│  │  │    │   sangat ramah." │  │  │    │                  │  │  │    │                  │
│  │  └────┘                  │  │  └────┘                  │  │  └────┘                  │
│  │                          │  │                          │  │                          │
│  │  Stars: ⭐⭐⭐⭐⭐        │  │  Stars: ⭐⭐⭐⭐⭐        │  │  Stars: ⭐⭐⭐⭐⭐        │
│  │  Color: #D4A76A          │  │  Color: #D4A76A          │  │  Color: #D4A76A          │
│  │                          │  │                          │  │                          │
│  │  Name: Budi S.           │  │  Name: Sarah M.          │  │  Name: Keluarga Wijaya   │
│  │  From: Jakarta           │  │  From: Bandung           │  │  From: Surabaya          │
│  │  Date: Jun 2026          │  │  Date: Mei 2026          │  │  Date: Jun 2026          │
│  │                          │  │                          │  │                          │
│  │  Card:                   │  │  Card:                   │  │  Card:                   │
│  │  bg: #FFFFFF             │  │  bg: #FFFFFF             │  │  bg: #FFFFFF             │
│  │  border-radius: 16px     │  │  border-radius: 16px     │  │  border-radius: 16px     │
│  │  padding: 32px           │  │  padding: 32px           │  │  padding: 32px           │
│  │  max-width: 380px        │  │  max-width: 380px        │  │  max-width: 380px        │
│  │  shadow: subtle          │  │  shadow: subtle          │  │  shadow: subtle          │
│  │                          │  │                          │  │                          │
│  │  Quote Icon: "            │  │  Quote Icon: "            │  │  Quote Icon: "            │
│  │  Color: #C4956A          │  │  Color: #C4956A          │  │  Color: #C4956A          │
│  │  Size: 32px              │  │  Size: 32px              │  │  Size: 32px              │
│  │  Font: Georgia           │  │  Font: Georgia           │  │  Font: Georgia           │
│  │  opacity: 0.5            │  │  opacity: 0.5            │  │  opacity: 0.5            │
│  │                          │  │                          │  │                          │
│  │  Avatar: 48x48 circle    │  │  Avatar: 48x48 circle    │  │  Avatar: 48x48 circle    │
│  │  bg: #EDE7DB             │  │  bg: #EDE7DB             │  │  bg: #EDE7DB             │
│  │  Icon: 👤 or initials    │  │  Icon: 👤 or initials    │  │  Icon: 👤 or initials    │
│  │                          │  │                          │  │                          │
│  └──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘
│                                                                                      │
│  Navigation: ◀ prev  ● ○ ○  next ▶                                                  │
│  Dot active: #7A8B6F, inactive: #EDE7DB                                             │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Section 7: CTA / BOOKING CALLOUT

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ CTA SECTION - Padding: 80px 0                                                       │
│ Background: #5C6B52 (dark green) - Full width                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                             │    │
│  │                                                                             │    │
│  │         ┌─────────────────────────────────────────────────────┐             │    │
│  │         │  "Siap untuk Pengalaman Menginap yang             │             │    │
│  │         │   Tak Terlupakan?"                                │             │    │
│  │         │                                                     │             │    │
│  │         │  Font: Playfair Display 600                         │             │    │
│  │         │  Size: 42px (mobile: 28px)                          │             │    │
│  │         │  Color: #FFFFFF                                     │             │    │
│  │         │  text-align: center                                 │             │    │
│  │         │  max-width: 700px                                   │             │    │
│  │         └─────────────────────────────────────────────────────┘             │    │
│  │                                                                             │    │
│  │         ┌─────────────────────────────────────────────────────┐             │    │
│  │         │  "Pesan kamar Anda sekarang dan nikmati liburan    │             │    │
│  │         │   menyenangkan di kaki Gunung Merbabu."            │             │    │
│  │         │                                                     │             │    │
│  │         │  Font: Inter 400, 18px (mobile: 16px)               │             │    │
│  │         │  Color: rgba(255,255,255,0.8)                       │             │    │
│  │         │  text-align: center                                 │             │    │
│  │         └─────────────────────────────────────────────────────┘             │    │
│  │                                                                             │    │
│  │         ┌──────────────────────┐  ┌────────────────────────────────────┐    │    │
│  │         │  "Pesan Sekarang"    │  │  "Hubungi Kami"                    │    │    │
│  │         │                      │  │                                    │    │    │
│  │         │  bg: #C4956A         │  │  bg: transparent                   │    │    │
│  │         │  text: white         │  │  border: 2px solid rgba(255,255,   │    │    │
│  │         │  px: 36px            │  │  255,0.6)                          │    │    │
│  │         │  py: 16px            │  │  text: white                       │    │    │
│  │         │  rounded: 12px       │  │  px: 36px                          │    │    │
│  │         │  font: 600 16px      │  │  py: 16px                          │    │    │
│  │         │  hover: bg-#D4A76A   │  │  rounded: 12px                     │    │    │
│  │         │  shadow-lg           │  │  hover: bg-white/10                │    │    │
│  │         │                      │  │                                    │    │    │
│  │         │  Icon: →             │  │  Icon: 💬                          │    │    │
│  │         └──────────────────────┘  └────────────────────────────────────┘    │    │
│  │                                                                             │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  Decorative: Subtle leaf/branch pattern on corners (opacity: 0.05, white)          │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Section 8: FOOTER

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ FOOTER - Background: #3D4A35 (darkest green), Padding: 80px 0 top / 40px 0 bottom │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                             │    │
│  │  ┌─────────────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │    │
│  │  │   🌿                │  │ NAVIGASI     │  │ BANTUAN      │  │ HUBUNGI  │ │    │
│  │  │   MerbabuStay       │  │              │  │              │  │          │ │    │
│  │  │                     │  │ • Beranda    │  │ • Cara Pesan │  │ 📍 Jl.   │ │    │
│  │  │   Logo (white ver.) │  │ • Kamar      │  │ • FAQ        │  │   Pendaki│ │    │
│  │  │                     │  │ • Tentang    │  │ • Kebijakan  │  │   No. 12 │ │    │
│  │  │   "Homestay nyaman  │  │ • Kontak     │  │   Privasi    │  │   Selo,  │ │    │
│  │  │    dengan           │  │              │  │ • Syarat     │  │   Boyolali│ │    │
│  │  │    pemandangan      │  │ Font: Inter  │  │              │  │          │ │    │
│  │  │    Gunung Merbabu   │  │ 15px         │  │ Font: Inter  │  │ 📧 info@ │ │    │
│  │  │    yang memukau"    │  │ #A8B89E      │  │ 15px         │  │   merbabu│ │    │
│  │  │                     │  │ hover: white │  │ #A8B89E      │  │   stay.id│ │    │
│  │  │   Social Icons:     │  │              │  │ hover: white │  │          │ │    │
│  │  │   [IG] [FB] [WA]    │  │              │  │              │  │ 📱 +62   │ │    │
│  │  │   24x24px,          │  │              │  │              │  │   812-   │ │    │
│  │  │   #A8B89E,          │  │              │  │              │  │   3456-  │ │    │
│  │  │   hover: white      │  │              │  │              │  │   7890   │ │    │
│  │  │                     │  │              │  │              │  │          │ │    │
│  │  │   Font: Inter       │  │              │  │              │  │ Font:    │ │    │
│  │  │   14px, #A8B89E     │  │              │  │              │  │ Inter    │ │    │
│  │  │   max-width: 280px  │  │              │  │              │  │ 15px     │ │    │
│  │  │   line-height: 1.6  │  │              │  │              │  │ #A8B89E  │ │    │
│  │  │                     │  │              │  │              │  │          │ │    │
│  │  └─────────────────────┘  └──────────────┘  └──────────────┘  └──────────┘ │    │
│  │                                                                             │    │
│  ═══════════════════════════════════════════════════════════════════════════   │    │
│                                                                             │    │
│  Bottom Bar:                                                                 │    │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │    │
│  │  © 2026 MerbabuStay. All rights reserved.                               │ │    │
│  │  Font: Inter 13px, #6B7560                                              │ │    │
│  │  text-center, padding-top: 40px                                         │ │    │
│  │  Border-top: 1px solid rgba(168,184,158,0.2)                            │ │    │
│  └─────────────────────────────────────────────────────────────────────────┘ │    │
│                                                                             │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Responsive Breakpoints

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ BREAKPOINT SPECIFICATIONS                                                            │
├───────────────────┬───────────┬─────────────────────────────────────────────────────┤
│ Breakpoint        │ Width     │ Layout Changes                                      │
├───────────────────┼───────────┼─────────────────────────────────────────────────────┤
│ Mobile            │ < 640px   │ Single column, stacked sections, hamburger menu     │
│                   │           │ Hero headline 36px, cards full width, booking bar   │
│                   │           │ stacked vertically, footer 1 column                 │
├───────────────────┼───────────┼─────────────────────────────────────────────────────┤
│ Tablet (sm/md)    │ 640-1024px│ 2-column grids, hero headline 44px, booking bar     │
│                   │           │ 2x2 grid, room cards 2 columns, features 3 columns  │
├───────────────────┼───────────┼─────────────────────────────────────────────────────┤
│ Desktop (lg)      │ 1024-1280 │ 3-column room grid, full navigation visible,        │
│                   │           │ hero 56px, all sections max-width 1200px centered   │
├───────────────────┼───────────┼─────────────────────────────────────────────────────┤
│ Wide (xl)         │ > 1280px  │ Max-width 1280px container, generous whitespace     │
│                   │           │ larger spacing between sections                     │
└───────────────────┴───────────┴─────────────────────────────────────────────────────┘
```

---

## 4. Animation & Interaction Specs

| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Navbar bg | Scroll > 50px | opacity 0 → 0.95, blur | 300ms | ease-out |
| Hero text | Page load | translateY(30px→0), opacity 0→1 | 800ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Hero CTA | Page load (delay 400ms) | translateY(20px→0), opacity 0→1 | 600ms | ease-out |
| Room cards | Scroll into viewport | translateY(40px→0), opacity 0→1 | 500ms | ease-out |
| Feature cards | Scroll into viewport | translateY(30px→0), opacity 0→1, stagger 100ms | 500ms | ease-out |
| Button hover | Mouse enter | scale(1.02), shadow increase | 200ms | ease-out |
| Card hover | Mouse enter | translateY(-4px), shadow-lg | 300ms | ease-out |
| Scroll indicator | Continuous | translateY(0→10px→0) | 2000ms | ease-in-out, infinite |
| Testimonial carousel | Auto / Manual | translateX slide, opacity crossfade | 400ms | ease-out |

---

## 5. Assets Required

| Asset | Type | Dimensions | Description for AI Generation |
|-------|------|------------|-------------------------------|
| Hero Background | Photo | 1920x1080 | "Wide landscape photo of Gunung Merbabu at golden hour, misty mountains, warm sunlight, atmospheric, cinematic, no watermark" |
| Room Card 1 | Photo | 800x600 | "Cozy bedroom with mountain view through window, natural wood furniture, white bedding, warm light, minimalist decor" |
| Room Card 2 | Photo | 800x600 | "Luxury hotel suite with king bed, large windows, mountain panorama, elegant interior design, warm tones" |
| Room Card 3 | Photo | 800x600 | "Family villa interior, spacious living area, multiple beds, mountain view, comfortable and warm atmosphere" |
| Feature Icon 1 | SVG | 48x48 | Mountain + location pin, line art style, sage green |
| Feature Icon 2 | SVG | 48x48 | Sunrise over mountains, line art style, sage green |
| Feature Icon 3 | SVG | 48x48 | Campfire + amenities, line art style, sage green |
| Logo | SVG | 160x40 | Mountain silhouette + leaf + "MerbabuStay" text |
| Testimonial Avatar | SVG | 48x48 | Simple user avatar placeholder, warm beige tones |

---

## 6. Stitch AI Prompt (Copy-Paste Ready)

```
Generate a premium homestay landing page design for "MerbabuStay" - a cozy accommodation at the foot of Mount Merbabu, Indonesia.

COLOR SYSTEM (60-30-10 Rule):
- 60% Base: #F5F0E8 (warm cream), #FAF7F2 (off-white), #FFFFFF
- 30% Secondary: #7A8B6F (sage green), #5C6B52 (forest green), #3D4A35 (dark green)
- 10% Accent: #C4956A (wood brown), #D4A76A (honey gold)

SECTIONS TO DESIGN:

1. NAVBAR: Fixed header, 80px height, transparent on top transitioning to frosted glass (blur + #F5F0E8/95%) on scroll. Left: mountain+leaf logo with "MerbabuStay" text in Playfair Display. Center: nav links (Beranda, Kamar, Tentang, Kontak). Right: green "Book Now" pill button. Mobile: hamburger menu.

2. HERO: Full viewport height, stunning photo of Mount Merbabu at golden hour with gradient overlay (dark at bottom). Top: white pill badge "Penginapan Terbaik di Kaki Gunung Merbabu". Center: Large headline "Rasakan Ketenangan Menginap di Kaki Gunung Merbabu" in Playfair Display 56px white with text shadow. Below: subtitle in Inter 18px white/90%. Two CTAs: primary green "Pesan Sekarang" button + secondary outlined "Lihat Kamar" button. Bottom: animated bouncing scroll chevron.

3. QUICK BOOKING BAR: Floating white rounded-2xl card overlapping hero bottom, shadow-2xl. 4 columns: Check-in date picker, Check-out date picker, Guest dropdown, "Cari Kamar" green button. Sage green calendar icons. Pill-style layout.

4. FEATURES: Cream background (#F5F0E8). Section title "Pengalaman Menginap yang Berkesan dan Nyaman" in Playfair Display 42px forest green. 3 cards in a row: (1) "Lokasi Strategis" - 5 min from basecamp, (2) "Pemandangan Memukau" - sunrise/sunset view, (3) "Fasilitas Lengkap" - WiFi, kitchen, hot water. Each card: off-white bg, rounded-2xl, centered icon (48px sage line art), title, description. Subtle hover lift effect.

5. ROOMS GRID: Off-white background (#FAF7F2). Title "Temukan Kamar Ideal untuk Liburan Anda". Filter tabs: Semua (active, filled green), Standard, Deluxe, Family, Villa (outlined). 3-column grid of room cards. Each card: 4:3 photo with badge overlay ("Populer"/"Best View"), white body with room name (Playfair 20px), specs (guest count, bed count), divider, price in accent gold "Rp 425.000/malam", green "Lihat Detail" button. Hover: lift + shadow.

6. TESTIMONIALS: Cream background. Title "Apa Kata Tamu Kami?". Horizontal scrollable cards with quote marks, star ratings (gold), guest name, location, and date. White cards, sage quote icons.

7. CTA: Dark green background (#5C6B52). White headline "Siap untuk Pengalaman Menginap yang Tak Terlupakan?". Two buttons: accent gold "Pesan Sekarang" + outlined white "Hubungi Kami".

8. FOOTER: Darkest green (#3D4A35). 4 columns: Logo + description + social icons, Navigation links, Help links, Contact info (address, email, phone). Bottom bar with copyright.

TYPOGRAPHY: Playfair Display (headings), Inter (body). Overall feel: warm, natural, premium, earthy, inviting - like a cozy mountain retreat. Generous whitespace. Rounded corners throughout (12-20px). Subtle shadows. No harsh borders.

Generate the complete landing page as a single cohesive design, desktop version, 1440px wide.
```

---

*Wireframe ini dirancang untuk menghasilkan desain visual yang warm, natural, dan premium menggunakan AI design generator.*

**Prepared by:** Senior UI/UX Designer  
**Date:** Juni 2026  
**Version:** 1.0
