# Design System — FragranceHub storefront

<!-- impeccable:design-schema 1 -->

## Overview

Light atelier / daylight gallery for FragranceHub’s customer site. Porcelain–stone ground, deep botanical ink, quiet architectural chrome. Product imagery leads; marketing noise is stripped. Admin UI is **out of scope** and keeps the default neutral shadcn / Geist system.

## Brand & Voice

- **Name:** FragranceHub (wordmark text; no logo asset)
- **Tone:** calm, precise, premium — signature-scent hunt, not club nightlife
- **Anti-patterns:** purple/pink gradients, emoji as product placeholders, icon-feature strips, dark club lighting, cream+terracotta AI luxury, broadsheet hairlines

## Color

Scoped under `.storefront` in `src/app/globals.css` (does not rewrite root admin tokens).

| Role | Token / value | Notes |
|------|----------------|-------|
| Ground | `--background` ≈ oklch(0.975 0.006 95) | Cool porcelain |
| Ink | `--foreground` ≈ oklch(0.22 0.02 155) | Deep botanical charcoal |
| Accent / primary | `--primary` ≈ oklch(0.32 0.055 155) | Quiet botanical green |
| Mist / image well | `--storefront-mist` ≈ oklch(0.94 0.012 120) | Product plate ground |
| Bronze (optional) | `--storefront-bronze` | Soft metallic whisper |
| Borders | `--border` ≈ oklch(0.88 0.01 95) | Hairline architectural |

### Night mode (`.dark .storefront`)

Calm stone charcoal ground (not pure black), porcelain ink, lifted botanical primary for contrast. Same radius/fonts. Toggle: light → dark → system via nav control (`next-themes`).

## Typography

| Role | Face | Usage |
|------|------|--------|
| Display | Bodoni Moda (`--font-storefront-display`) | Brand, page titles, product names |
| UI / body | Manrope (`--font-storefront-sans`) | Nav labels, body, forms |
| Admin | Geist Sans / Mono | Unchanged outside `.storefront` |

Labels use small tracked uppercase (≈0.65–0.7rem, ~0.18–0.2em tracking). Display stays large and restrained — no gradient text.

## Layout & spacing

- Content width: `max-w-6xl` with `px-6` / `lg:px-8`
- Radius: tight (`--radius: 0.25rem`); many controls are square (`rounded-none`)
- Sections: one job each; generous vertical rhythm (`py-16`–`py-28`)
- Product cards: image-led 3:4 plates, no card chrome

## Components

- **Navigation:** sticky, blurred porcelain bar; display wordmark; sparse uppercase links; precise cart badge
- **Footer:** editorial columns, quiet borders
- **ProductCard** (`src/components/product-card.tsx`): shared home / catalog / related
- **Buttons:** primary filled botanical; outline with ink border; uppercase tracked labels
- **Auth panels:** bordered card on storefront ground — no heavy drop shadow

## Motion

- Product image hover: slow scale (~700ms ease-out)
- Link/opacity transitions for chrome
- Prefer restraint over entrance animation stacks

## Surfaces covered

Home, products, PDP, cart/checkout, orders, about, contact, login/register/forgot/reset, profile — all under `(public)` + cart layout with `.storefront`.

## Surfaces excluded

`/admin/*` and shared admin templates remain on root tokens + Geist.
