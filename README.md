# 🛕 Krishna General Store

A production-ready quick-commerce frontend for a local Indian general store, built with React + TypeScript + Vite.

## ✨ Features

| Feature | Details |
|---|---|
| 🛍️ Product Catalog | Grid with search + category filter pills |
| 📦 Product Detail | Full info, related products, add-to-cart |
| 🧾 Checkout | Delivery/pickup toggle, live total, form validation |
| 📱 OTP Verify | 6-digit auto-focus inputs, resend cooldown |
| 📍 Order Tracking | Visual status timeline, payment CTA, shipping info |
| 🎉 Confetti | Fires on payment success / delivery |
| 🌐 i18n | Hindi ↔ English toggle |
| 🌙 Dark Theme | Glassmorphism, purple accent, green success |
| 💾 Cart Persistence | Zustand + localStorage |
| ⚡ Performance | Lazy-loaded routes, code splitting |

## 🗂️ Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx + .module.css
│   │   ├── CartDrawer.tsx + .module.css
│   │   ├── FloatingCartButton.tsx + .module.css
│   │   └── Layout.tsx + .module.css
│   ├── ui/
│   │   ├── Badge.tsx + .module.css
│   │   ├── Button.tsx + .module.css
│   │   ├── Input.tsx + .module.css
│   │   ├── QuantityStepper.tsx + .module.css
│   │   ├── Spinner.tsx + .module.css
│   │   └── Toast.tsx + .module.css
│   └── ProductCard.tsx + .module.css
├── hooks/
│   └── useTranslation.ts
├── i18n/
│   └── translations.ts
├── pages/
│   ├── Home.tsx + .module.css
│   ├── ProductDetail.tsx + .module.css
│   ├── Checkout.tsx + .module.css
│   ├── OtpVerify.tsx + .module.css
│   ├── OrderTracking.tsx + .module.css
│   └── NotFound.tsx + .module.css
├── store/
│   └── index.ts
├── types/
│   └── index.ts
├── utils/
│   ├── api.ts
│   ├── confetti.ts
│   └── format.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create env file
cp .env.example .env
# Edit VITE_API_URL to point to your backend

# 3. Start dev server
npm run dev

# 4. Build for production
npm run build
```

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | Your backend API base URL |
| `VITE_DELIVERY_CHARGE` | `40` | Delivery charge in ₹ |

## 🔌 API Contract

### `GET /api/catalog`
```json
{
  "data": {
    "products": [Product],
    "categories": ["Grocery", "Dairy", ...]
  }
}
```

### `GET /api/catalog/:id`
```json
{
  "data": {
    "product": Product,
    "related": [Product]
  }
}
```

### `POST /api/order`
**Body:**
```json
{
  "items": [CartItem],
  "customer": { "name", "email", "phone", "address", "notes" },
  "deliveryMode": "delivery" | "pickup",
  "total": 540,
  "deliveryCharge": 40
}
```
**Response:** `{ "data": { "orderRef": "KGS-1234", "message": "..." } }`

### `POST /api/order/verify`
```json
{ "orderRef": "KGS-1234", "otp": "123456" }
```

### `POST /api/order/resend-otp`
```json
{ "orderRef": "KGS-1234" }
```

### `GET /api/track/:orderRef`
```json
{
  "data": {
    "order": {
      "orderRef": "KGS-1234",
      "status": "accepted",
      "items": [...],
      "customer": {...},
      "deliveryMode": "delivery",
      "total": 540,
      "deliveryCharge": 40,
      "paymentUrl": "https://...",
      "shippingInfo": { "trackingId", "carrier", "estimatedTime" },
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

## 🎨 Design System

| Token | Value |
|---|---|
| `--purple` | `#7C6FE9` |
| `--green` | `#34D399` |
| `--bg` | `#0d0d14` |
| `--font-display` | Baloo 2 |
| `--font-body` | Noto Sans |
| `--font-hindi` | Noto Sans Devanagari |

## 📱 Responsive Breakpoints

- Mobile: 2-col grid
- Tablet (640px): 3-col grid  
- Desktop (1024px): 4-col grid

## 🛒 Payment Integration

When `order.status === 'accepted'`, the tracking page shows a **Pay Now** button that opens `order.paymentUrl`. After payment, redirect the user to:

```
/track/KGS-1234?payment=success
```

The app detects this query param and fires the confetti animation.

## 📦 Demo Mode

The app ships with full mock data — **no backend needed** to run locally. All API calls gracefully fall back to mock data if the server is unreachable.
