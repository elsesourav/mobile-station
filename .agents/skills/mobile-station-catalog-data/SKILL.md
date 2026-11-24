---
name: mobile-station-catalog-data
description: >-
  Defines the electronics taxonomy, category handles, technical specification schemas, HSN codes,
  GST rates, warranty metadata, and seed dataset conventions for Mobile Station. Use when adding
  categories, importing products, editing seed JSONs, or writing catalog filters and validation.
---

# Mobile Station Electronics Catalog & Data Skill

## Canonical Sources
- Category Taxonomy: [categories.json](../../../data/taxonomy/categories.json)
- Brand Registry: [brands.json](../../../data/taxonomy/brands.json)
- Spec Filter Schemas: [spec-schemas.json](../../../data/taxonomy/spec-schemas.json)
- Seed Products: [products-seed.json](../../../data/catalog/products-seed.json)
- TypeScript & Zod Schemas: [electronics.ts](../../../packages/types/src/electronics.ts) · [validations.ts](../../../packages/types/src/validations.ts)
- Category Research Doc: [01-CATEGORY-AND-CATALOG-RESEARCH.md](../../../docs/01-CATEGORY-AND-CATALOG-RESEARCH.md)

## Rules for Adding or Modifying Products & Categories
1. **7 Root Categories**: `smartphones`, `tablets`, `laptops`, `audio`, `keyboards-mice`, `power-charging`, `accessories-storage`.
2. **Integer Paise Pricing**: Always store `price_paise` and `mrp_paise` as integers (`₹1,499` = `149900`, `mrp_paise >= price_paise`).
3. **Mandatory Compliance Metadata**: Every product seed entry MUST validate against `electronicsMetadataSchema`:
   - `brand`, `model_number`, `hsn_code` (4–8 digits, e.g., `8517` mobiles, `8471` laptops/tablets/keyboards/mice, `8518` audio, `8504` chargers, `8507` power banks, `8544` cables, `8523` storage, `3926` cases), `gst_rate_percent` (`18`).
   - `warranty_months`, `warranty_type` (`brand_authorized` | `seller_warranty` | `replacement_only`), `warranty_summary`.
   - `in_the_box`: explicit list of included accessories (never omit whether charger/adapter is included).
   - `requires_imei_or_serial`: `true` for phones, tablets, laptops, monitors, high-value SSDs.
   - `requires_open_box_delivery`: `true` when flagship/laptop price >= `₹25,000` (`2500000` paise).
4. **Variant Structuring**: Group colors, storage/RAM tiers, or mechanical switch types under one parent product rather than duplicating product listings.
