---
name: mobile-station-design-system
description: >-
  Guides UI implementation, Tailwind styling, design token updates, and brand logo or favicon usage
  in Mobile Station. Use whenever creating or modifying storefront components, CSS variables, themes,
  or brand imagery.
---

# Mobile Station Design System Skill

Follow this procedure when authoring UI components or modifying styles in `apps/storefront`.

## Canonical Files
- CSS Custom Properties: [tokens.css](../../../apps/storefront/src/styles/tokens.css)
- Global CSS & Base Layers: [globals.css](../../../apps/storefront/src/styles/globals.css)
- Tailwind Mapping: [tailwind.config.ts](../../../apps/storefront/tailwind.config.ts)
- Style Guide: [DESIGN-SYSTEM.md](../../../docs/style/DESIGN-SYSTEM.md)
- UI & Electronics UX Architecture: [UI-ARCHITECTURE.md](../../../docs/style/UI-ARCHITECTURE.md)

## Rules & Steps
1. **Never hardcode colors, radii, or z-index numbers** in `.tsx` files. Use Tailwind semantic tokens (`bg-obsidian-900`, `text-gold-700`, `bg-surface-canvas`, `text-commerce-savings`, `bg-commerce-warrantyBg`) or `var(--color-*)`.
2. **Dark vs. Light Surface Pairing**:
   - Use **Obsidian (`#0B0F17`)** for the primary header, brand banner strips, flagship hero cards, and footer so the brushed gold `MOBILE` + chrome silver `STATION` wordmark retains sharp contrast.
   - Use **Studio Slate (`#F8FAFC`)** and **Pure White (`#FFFFFF`)** for catalog grids, dense spec tables, comparison matrices, and checkout forms.
   - On white backgrounds, use `text-gold-700` (`#A16207`), never bright `#E5A01D` text, to preserve WCAG AA contrast.
3. **Electronics UX Requirements**:
   - Product cards MUST show Brand, Title, 3 compact mono spec chips, interactive color/storage variant swatches, INR price (`.tabular-nums`), MRP strikethrough, discount `%`, official warranty tag, and Compare toggle.
   - PDP MUST surface key specs above the fold, "What's in the Box", full accordion spec tables (not hidden horizontal tabs), Razorpay Affordability/EMI preview, and inline 6-digit PIN + Open-Box Delivery checker.
   - Mobile interactive targets MUST be at least `44px × 44px`.
4. **Regenerating Favicons / Brand Assets**:
   - If root brand PNGs (`mobile-station-icon.png` or `mobile-station-name.png`) are updated, run `pnpm assets:brand` and visually inspect `apps/storefront/public/og-image.png` and `apple-touch-icon.png`.
