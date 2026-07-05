---
name: Papua Biome Archive
colors:
  surface: '#fdf9ed'
  surface-dim: '#dedace'
  surface-bright: '#fdf9ed'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f3e7'
  surface-container: '#f2eee2'
  surface-container-high: '#ece8dc'
  surface-container-highest: '#e6e2d6'
  on-surface: '#1d1c15'
  on-surface-variant: '#424843'
  inverse-surface: '#323129'
  inverse-on-surface: '#f5f1e4'
  outline: '#737973'
  outline-variant: '#c2c8c2'
  surface-tint: '#4d6355'
  primary: '#051a0f'
  on-primary: '#ffffff'
  primary-container: '#1a2f23'
  on-primary-container: '#809787'
  inverse-primary: '#b4ccbb'
  secondary: '#506354'
  on-secondary: '#ffffff'
  secondary-container: '#d0e5d2'
  on-secondary-container: '#546758'
  tertiary: '#0f1902'
  on-tertiary: '#ffffff'
  tertiary-container: '#232e12'
  on-tertiary-container: '#899771'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d0e9d6'
  primary-fixed-dim: '#b4ccbb'
  on-primary-fixed: '#0a2014'
  on-primary-fixed-variant: '#364c3e'
  secondary-fixed: '#d3e8d5'
  secondary-fixed-dim: '#b7ccb9'
  on-secondary-fixed: '#0e1f13'
  on-secondary-fixed-variant: '#394b3d'
  tertiary-fixed: '#dae8be'
  tertiary-fixed-dim: '#becca3'
  on-tertiary-fixed: '#141f05'
  on-tertiary-fixed-variant: '#3f4b2c'
  background: '#fdf9ed'
  on-background: '#1d1c15'
  surface-variant: '#e6e2d6'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 32px
  margin-desktop: 64px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style

The design system is engineered to evoke the gravitas of a high-end natural history museum while maintaining the digital fluidity of a premium editorial platform. It targets researchers, conservationists, and high-culture enthusiasts who value precision and beauty.

The style is a synthesis of **Minimalism** and **Modern Editorial**. It leverages expansive whitespace to provide visual "oxygen," allowing high-resolution photography of Southwest Papua’s biodiversity to take center stage. The aesthetic is inspired by the Apple-esque devotion to clarity and the narrative depth of National Geographic. Elements are grounded in a tactile reality using layered surfaces and subtle depth, avoiding flat sterility in favor of a sophisticated, biological warmth.

## Colors

The palette is derived directly from the rainforest canopy and limestone karsts of West Papua. 

- **Deep Forest Green (#1A2F23):** Used for primary typography, deep-grounded navigation elements, and high-impact structural blocks. It provides the "ink" for the editorial feel.
- **Moss Green (#4A5D4E):** Reserved for secondary actions, accents, and tonal shifts in iconography.
- **Sage (#A3B18A):** An accent color for status indicators, active states, and decorative callouts.
- **Warm Stone (#E9E5D9):** Used for container backgrounds, card borders, and subtle section dividers to avoid the harshness of pure grey.
- **Off White (#F8F7F2):** The primary canvas color, chosen to reduce eye strain and provide a "paper-like" quality to the interface.

## Typography

This design system utilizes a high-contrast typographic pairing to establish clear information hierarchy. **Playfair Display** provides an authoritative, literary voice for all headings. On mobile, display sizes are aggressively scaled down to ensure legibility and prevent awkward line breaks.

**Inter** is used for body copy and UI labels, ensuring functional clarity at small sizes. For editorial body text, `body-lg` is preferred to maintain a spacious, premium reading experience. `label-caps` is used for category tags (e.g., "ENDANGERED," "AVES") to provide a technical, curated feel.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model on desktop to mimic the structured columns of a luxury magazine, transitioning to a fluid layout for mobile devices. 

- **The 12-Column Grid:** Desktop layouts utilize a 12-column grid with wide 32px gutters. 
- **Asymmetry:** Key editorial sections should purposely break the grid—for example, a species description may occupy 5 columns on the left, while the image spans 7 columns and bleeds off the right edge of the screen.
- **Vertical Rhythm:** Large vertical gaps (`section-gap`) are used between major content blocks to facilitate a sense of calm and focus.

## Elevation & Depth

Depth in this design system is achieved through **Tonal Layering** and **Ambient Shadows**. Instead of harsh black shadows, we use very soft, diffused shadows tinted with the Primary color (#1A2F23) at 4-8% opacity.

1.  **Level 0 (Base):** Off White (#F8F7F2) background.
2.  **Level 1 (Cards/Containers):** Warm Stone (#E9E5D9) with a 1px solid border in a slightly darker shade of stone.
3.  **Level 2 (Hover/Active):** Elements lift slightly with a 16px blur shadow, creating a subtle "float" effect.
4.  **Overlays:** High-end glassmorphism is used for navigation bars and image captions, utilizing a background blur (20px) and 80% opacity of the Off White background.

## Shapes

The shape language is "Soft" (0.25rem - 0.75rem). This avoids the clinical feel of sharp corners while remaining more structured and professional than highly rounded "bubbly" designs. 

- **Species Cards:** Use `rounded-lg` (0.5rem) to soften the impact of large photography.
- **Buttons:** Use `rounded-lg` for a modern, approachable feel.
- **Interactive Icons:** Contained within `rounded-xl` (0.75rem) soft-squares.

## Components

### Editorial Species Cards
Cards utilize a vertical layout with the image at the top. The image should have a subtle inner glow to feel "set into" the card. Titles use `headline-sm` in Deep Forest Green. Metadata (e.g., Habitat, Status) is displayed in `label-caps`.

### Premium Info Cards
These are used for quick stats (e.g., wingspan, population). They feature a Sage (#A3B18A) icon on the left, a `label-caps` header, and a `headline-sm` value. The background is a flat Warm Stone (#E9E5D9).

### Buttons
- **Primary:** Deep Forest Green background, Off White text. High-contrast, no shadow, `rounded-lg`.
- **Secondary:** Transparent background, Deep Forest Green 1px border. 

### Asymmetric Gallery Grid
A layout component where images alternate between portrait and landscape aspect ratios. One "Hero" image in the grid should span 2 columns and 2 rows, while others fill single slots, creating a rhythmic, non-linear visual flow.

### Input Fields
Minimalist style. Only a bottom border (1px) in Moss Green. When focused, the border thickens to 2px and a very soft Sage-tinted glow appears behind the input area.
