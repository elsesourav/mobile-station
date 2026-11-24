# Mobile Station — Storefront UI & Electronics UX Architecture

> **Version:** 1.0.0  
> **Target Stack:** Next.js 15 App Router · React 19 · Tailwind CSS · Meilisearch · Medusa v2 Store API  
> **Design System:** [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)

---

## 1. Navigation & Global Shell

### 1.1 Multi-Tier Obsidian Header
1. **Top Trust & Offer Strip (`36px`)**: Rotating strip featuring GST Tax Invoice support (`Claim 18% GST Input Credit`), Open-Box Delivery for Smartphones & Laptops, No-Cost EMI availability, and Muzaffarpur Flagship Store pickup/support hours.
2. **Primary Brand & Instant Search Bar (`68px`, `bg-obsidian-900`)**:
   - Left: `MOBILE STATION` logo wordmark + `MS` badge.
   - Center: Instant **Meilisearch** typo-tolerant search bar (`"Search iPhone 16, RTX 4060 laptop, 65W GaN charger, mechanical keyboard..."`) with product thumbnails, live INR price, and category shortcuts in dropdown.
   - Right: Compare Tray badge (`0–4` items), Wishlist, Account/Orders, Cart Drawer trigger with item counter.
3. **Category Mega-Navigation (`44px`, `bg-obsidian-800`)**:
   - 7 Top-Level Electronics Categories: **Mobiles** · **Tablets** · **Laptops** · **Earphones & Audio** · **Keyboards & Mice** · **Chargers & Power** · **Accessories & Storage** + **Deals & Combos**.
   - Desktop hover/click opens structured mega-menu grouped by Use Case, Brand, and Budget Tier (e.g., *Under ₹15,000*, *5G Flagships*, *Gaming Laptops*).

---

## 2. Homepage Conversion Architecture

| Section | Purpose | Key UI Elements |
|---|---|---|
| **1. Flagship Hero Carousel** | Showcase key launches & seasonal tech offers | `2048×746` desktop / `1080×1350` mobile Cloudinary banners, dark obsidian overlay, gold CTA button |
| **2. Category Circle / Tile Rail** | Fast visual entry into the 7 core categories | Hardware silhouette/product thumbnails, SKU counts, swipeable on mobile |
| **3. Value & Authenticity Bar** | Overcome online electronics trust anxiety | **100% Brand Warranty** · **Open-Box Delivery** · **GST Tax Invoice** · **Muzaffarpur Store Support** |
| **4. Curated Tabs & Product Rails** | High-velocity browsing across verticals | Tabs: *Trending Mobiles*, *Work & Gaming Laptops*, *TWS & Audio*, *Mechanical Keyboards & Mice*, *Fast Chargers* |
| **5. Shop by Brand Strip** | Electronics buyers frequently shop by ecosystem | Apple, Samsung, OnePlus, Lenovo, ASUS, Sony, Keychron, Logitech, Anker, Spigen |
| **6. Build Your Desk / Accessory Bundles** | Increase Average Order Value (AOV) | Cross-sell pairings (Laptop + USB-C Hub + Wireless Mouse; Phone + 30W Charger + MagSafe Case) |

---

## 3. Product Card Anatomy (Electronics-Optimized)

Electronics buyers scan specs and variants *before* clicking into a Product Detail Page (PDP):
1. **Top Badges**: Condition / Offer badge (`20% OFF`, `No-Cost EMI`, `New Launch`) + top-right **Compare (`+`)** & **Wishlist** icon toggles.
2. **1:1 Studio Image Frame**: Crisp `#FFFFFF` product canvas with Cloudinary `f_auto,q_auto` sizing and hover secondary angle.
3. **Brand + Title**: Brand label (`LOGITECH`, `APPLE`, `KEYCHRON`) + 2-line product title (`font-display`).
4. **3-Chip Quick Spec Row**: Compact mono pills tailored to category (e.g., `16GB RAM` · `512GB SSD` · `RTX 4050` for Laptops, or `ANC 48dB` · `40h Battery` · `BT 5.4` for TWS).
5. **Live Variant Swatches**: Interactive color dots or storage/switch pills (`128GB`, `256GB`) right on the card.
6. **Pricing & EMI Line**: Active `₹` price (`tabular-nums`), strikethrough MRP, `% OFF`, plus subtle *"EMI from ₹X/mo"*.
7. **Primary CTA**: Quick **Add to Cart** (for single-variant accessories) or **Select Variant** drawer trigger.

---

## 4. Product Detail Page (PDP) & Comparison UX

- **Media Gallery**: Multi-angle product gallery + 16:9 lifestyle shots + zoom lightbox.
- **Sticky Buy Box (Right Column)**:
  - Official Brand Warranty badge (`1 Year Apple India Warranty` / `2 Year Logitech Warranty`).
  - Variant selectors: Color swatches + Storage/RAM or Switch Type chips (with live stock badge).
  - **Razorpay Affordability / EMI Preview**: Monthly No-Cost EMI breakdown & bank cashback offers.
  - **Delivery & Open-Box Pincode Checker**: Checks Shiprocket serviceability for 6-digit Indian PIN code, shows estimated ETA, indicates whether **Open-Box Delivery (OBD)** applies, and displays **Muzaffarpur Store Pickup** availability for `842001–842002` local PINs.
- **No Hidden Spec Tabs (Baymard Best Practice)**:
  - **Key Specs Highlight Grid** above the fold (4–6 critical attributes with icons).
  - **What's in the Box** checklist (explicitly states if power adapter/cable/dongle is included!).
  - **Full Technical Specifications Table** in clean expandable accordion groups (*Display*, *Performance*, *Connectivity*, *Battery & Power*, *Warranty & HSN*).
- **Side-by-Side Product Compare Bar (`Compare 2–4 Products`)**:
  - Sticky bottom drawer appears when 1+ products are added to Compare.
  - `/compare` page highlights differing rows in soft gold tint and lets buyers toggle *"Show Differences Only"*.

---

## 5. Cart, Checkout & Indian Tax Invoice Flow

1. **Slide-Over Cart Drawer**:
   - Free Express Insured Shipping progress bar.
   - Smart **Compatible Accessories Upsell** rail (e.g., Tempered Glass / 65W GaN Charger / Laptop Sleeve matching items in cart).
   - Coupon code box (`WELCOME500`, `TECHCOMBO`).
2. **Checkout Flow**:
   - **Step 1**: Indian Delivery Address with 6-digit PIN & 10-digit mobile validation.
   - **Step 2**: **Need a GST Invoice for Business (ITC)?** toggle -> captures 15-char `GSTIN` + Registered Business Name, auto-computes 18% GST split (`CGST + SGST` inside Bihar, `IGST` inter-state).
   - **Step 3**: Delivery Speed (Standard Insured vs Express Air; auto-flags **Open-Box Delivery** for orders `>= ₹25,000`).
   - **Step 4**: Payment Method — **Razorpay** (UPI / Cards / NetBanking / No-Cost EMI) or **Cash on Delivery** (allowed up to `₹10,000` with optional SMS OTP confirmation; disabled above cap or flagged for OBD cash-first protocol).
3. **Post-Purchase Order Confirmation & Account**:
   - Displays order reference (`MS-ORD-YYYY-XXXXX`), live Shiprocket AWB tracking timeline, **IMEI / Serial Number** recorded upon dispatch, and one-click **Download GST Tax Invoice (PDF)** fetched via short-lived presigned URL from private S3/R2 storage!
