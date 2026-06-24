---
name: MerbabuStay
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#444840'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ec'
  outline: '#757870'
  outline-variant: '#c5c8be'
  surface-tint: '#536349'
  primary: '#516147'
  on-primary: '#ffffff'
  primary-container: '#69795e'
  on-primary-container: '#f8ffee'
  inverse-primary: '#baccad'
  secondary: '#7d5630'
  on-secondary: '#ffffff'
  secondary-container: '#ffca9b'
  on-secondary-container: '#7a532e'
  tertiary: '#725361'
  on-tertiary: '#ffffff'
  tertiary-container: '#8d6b7a'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e8c8'
  primary-fixed-dim: '#baccad'
  on-primary-fixed: '#111f0b'
  on-primary-fixed-variant: '#3c4b33'
  secondary-fixed: '#ffdcbf'
  secondary-fixed-dim: '#f0bd8f'
  on-secondary-fixed: '#2d1600'
  on-secondary-fixed-variant: '#623f1b'
  tertiary-fixed: '#ffd8e8'
  tertiary-fixed-dim: '#e4bccc'
  on-tertiary-fixed: '#2c1420'
  on-tertiary-fixed-variant: '#5b3e4c'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
  base-100: '#F5F0E8'
  base-200: '#FAF7F2'
  base-300: '#EDE7DB'
  forest-green: '#5C6B52'
  dark-green: '#3D4A35'
  honey-gold: '#D4A76A'
  bronze: '#8B6F47'
  text-primary: '#2D3328'
  text-secondary: '#6B7560'
typography:
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  price-display:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-desktop: 64px
  margin-mobile: 20px
  gutter: 24px
  section-gap: 80px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

# Design System: MerbabuStay

## 🎨 Color Palette (60-30-10 Rule)

### 60% Base (Dominant)
- **Base 100 (Page Background):** `#F5F0E8`
- **Base 200 (Elevated Surfaces):** `#FAF7F2`
- **Base 300 (Borders/Dividers):** `#EDE7DB`
- **White:** `#FFFFFF`

### 30% Secondary (Supporting)
- **Primary 500 (Buttons/Links):** `#7A8B6F` (Sage Green)
- **Primary 600 (Hover/Headings):** `#5C6B52` (Forest Green)
- **Primary 700 (Dark Headings/Footer):** `#3D4A35` (Dark Green)

### 10% Accent (Highlight)
- **Accent 500 (CTAs/Price):** `#C4956A` (Wood Brown)
- **Accent 400 (Hover Accent/Icons):** `#D4A76A` (Honey Gold)
- **Accent 700 (Dark Accent):** `#8B6F47` (Bronze)

### Text
- **Text Primary:** `#2D3328`
- **Text Secondary:** `#6B7560`

## Typography

- **Headings (H1, H2, H3):** `Playfair Display`, Serif. Bold/Semi-bold.
- **Body & Buttons:** `Inter`, Sans-serif. 400-600 weight.
- **Price:** `Inter`, Sans-serif. 700 weight.

## UI Patterns
- **Radius:** 12px for buttons, 16-20px for cards and containers.
- **Shadows:** Soft, natural shadows for elevated cards (`rgba(45,51,40,0.15)`).
- **Buttons:** Solid pill or rounded-xl for primary CTAs, outlined for secondary.
