# Electronics E-Commerce Category, Spec & Indian Compliance Research

> **Purpose:** Research summary establishing the category taxonomy, filter facets, comparison matrix attributes, HSN/GST compliance, warranty UX, and Open-Box Delivery protocols for **Mobile Station**.

---

## 1. Electronics Category Taxonomy (7 Core Pillars, 28 Subcategories)

Benchmarking major Indian electronics retailers (**Croma**, **Reliance Digital**, **Amazon India**, **Flipkart Electronics**) alongside specialized peripheral brands (**Keychron**, **Logitech**, **Anker**, **Spigen**) reveals that shoppers navigate by **device pillar + primary spec/use-case**:

| # | Root Category | Handle | Subcategories | Default HSN | GST |
|---|---|---|---|---|---|
| 1 | **Mobiles & Smartphones** | `smartphones` | 5G Smartphones, Apple iPhones, Gaming Phones, Phones Under ₹15,000 | `8517` | 18% |
| 2 | **Tablets & E-Readers** | `tablets` | Apple iPads, Android Tablets, Styluses & Keyboard Folios | `8471` | 18% |
| 3 | **Laptops & Monitors** | `laptops` | Thin & Light Laptops, Gaming & RTX Laptops, Apple MacBooks, Computer Monitors | `8471` (`8528` monitors) | 18% |
| 4 | **Earphones & Audio** | `audio` | TWS Earbuds, Wireless Neckbands, Wired Earphones, Over-Ear & Gaming Headsets, Bluetooth Speakers & Soundbars | `8518` | 18% |
| 5 | **Keyboards & Mice** | `keyboards-mice` | Mechanical Keyboards, Wireless & Office Keyboards, Wireless & Gaming Mice, Keyboard & Mouse Combos | `8471` | 18% |
| 6 | **Chargers, Power Banks & Cables** | `power-charging` | GaN & PD Fast Chargers (`8504`), Power Banks (`8507`), USB-C / HDMI Cables (`8544`), USB-C Hubs & Docks (`8471`) | `8504` / `8507` / `8544` | 18% |
| 7 | **Accessories, Protection & Storage** | `accessories-storage` | Phone Cases & MagSafe Covers (`3926`), Screen Protectors (`3919`), Portable SSDs / Pen Drives / SD Cards (`8523`), Laptop Stands / Sleeves / Smartwatches (`7616`) | `3926` / `8523` | 18% |

Full structured taxonomy JSON lives in [`data/taxonomy/categories.json`](../data/taxonomy/categories.json).

---

## 2. Dynamic Filter & Comparison Findings (Baymard & Indian UX Research)

1. **Contextual Spec Filters Only**: Never show RAM/GPU filters inside "Earphones" or ANC filters inside "Mechanical Keyboards". Each root category reads its active filter facets from [`data/taxonomy/spec-schemas.json`](../data/taxonomy/spec-schemas.json).
2. **Variant Swatches on Cards**: Group storage (`128GB`, `256GB`, `512GB`), switch types (`Brown`, `Red`, `Blue`), and finishes under a single parent product so listings aren't bloated with duplicate cards.
3. **Avoid Hidden Horizontal Spec Tabs**: Use an above-the-fold **4-card Key Specs Summary** + expandable **Full Specifications Accordion** + **"What's in the Box"** box (critical because brands like Apple & Samsung omit charging bricks).
4. **Side-by-Side Compare Matrix**: Support 2–4 products in a sticky compare tray with automatic difference highlighting (`Show Differences Only`).

---

## 3. Indian Regulatory, Payment & Delivery Safeguards

| Area | Rule / Pattern for Mobile Station |
|---|---|
| **Pricing Display** | Always show **MRP (strikethrough)**, **Selling Price (Inclusive of all taxes)**, and exact `% OFF` in `₹` using integer paise (`100 paise = ₹1`). |
| **HSN & GST Split** | Store 4–8 digit HSN per SKU. Generate intra-state (**9% CGST + 9% SGST** for Bihar buyers) vs inter-state (**18% IGST**) tax invoices. |
| **B2B Input Tax Credit (ITC)** | Checkout includes an optional **"Need GST Invoice for Business?"** toggle validating 15-character GSTIN + Business Name. |
| **IMEI / Serial Tracking** | High-value smartphones, tablets, laptops, monitors, and NVMe SSDs flag `requires_imei_or_serial: true` so warehouse dispatch logs the exact IMEI/Serial on the GST PDF invoice for warranty claims. |
| **Open-Box Delivery (OBD)** | Orders `>= ₹25,000` flag `requires_open_box_delivery: true`: customer inspects seal, physical condition, accessories, and IMEI before releasing the Delivery OTP. |
| **COD Safeguards** | COD capped at `₹10,000` (`COD_MAX_AMOUNT_PAISE=1000000`) with SMS OTP verification to block fake RTO orders; high-ticket mobiles/laptops use Razorpay (UPI, NetBanking, Cards, No-Cost EMI). |
| **Affordability / EMI** | Razorpay Affordability Widget directly below PDP price (`"No-Cost EMI from ₹X/mo"`) reduces sticker shock on phones and laptops. |
