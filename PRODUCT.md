# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: fragrance shoppers hunting for a signature scent — browsing, comparing, and choosing a bottle with care rather than rushing a commodity purchase.

Secondary: returning customers checking orders and managing their account. Staff/admin operators use a separate admin surface (out of scope for storefront redesign).

## Product Purpose

FragranceHub is a luxury perfume ecommerce storefront. Customers discover fragrances, inspect variants (volume/concentration), add to cart, and place orders (including shipping and payment selection). Success means a shopper finds and purchases a scent they identify with, with clear price, stock, and checkout.

## Positioning

A curated fragrance shop focused on signature-scent discovery — brand, scent family, and product imagery lead the experience — not a generic multi-category marketplace or ops dashboard.

## Operating Context

Next.js App Router storefront under `(public)` plus auth-gated `/cart`. Catalog, PDP, cart/checkout (combined), orders, about, contact, and account/auth. Admin lives under `/admin` and must remain untouched by storefront visual work. i18n via next-intl. Product images from attachment records with placeholder fallback.

## Capabilities and Constraints

- Browse products by category; view PDP with variants; cart via Zustand; place order via existing server action.
- Checkout lives on `/cart` (no separate checkout route).
- Stripe option may appear in UI; do not invent payment capabilities beyond what exists.
- Do not change Prisma models, cart logic, or admin UI.
- Do not fabricate testimonials, awards, or commercial claims.

## Brand Commitments

- Product name: **FragranceHub**
- Voice: calm, premium, minimal — daylight luxury; not dark/clubby, not loud marketing
- Binding redesign constraints from user: entire customer site; admin untouched; signature-scent hunt; avoid too dark/clubby

## Evidence on Hand

- Live product/brand/category data via Prisma
- Product images under attachments / `public/images/placeholder.jpeg` and `public/images/products/`
- Copy in `localization/en/*.json`
- No separate brand logo asset beyond wordmark text

## Product Principles

1. Product imagery and scent identity lead; chrome stays quiet.
2. Signature-scent hunt over promotional clutter — one job per section.
3. Preserve real prices, stock, and checkout behavior.
4. Storefront and admin remain visually and structurally separate.
5. Light, airy luxury — never a dark club atmosphere.
