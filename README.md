# 🚀 Welcome to SAAKWA 1.0

Saakwa is a fast and convenient laundry service platform that allows users in Lagos to place laundry orders, schedule pickups, and have their clothes delivered seamlessly. Saakwa helps users save time and money by offering affordable laundry services with real-time updates and efficient logistics.

🌐 **Live Site:** [https://saakwa.com](https://saakwa.com)

---

## 📂 Project Overview

Saakwa connects users with a trusted laundry provider and a network of riders who handle pickup and delivery efficiently. The platform notifies Saakwa immediately when a customer places an order, ensuring quick service response.

---

## ✨ Tech Stack

- ⚡ **Vite** – Lightning-fast build tool.
- ⚛️ **React** – Frontend framework.
- 🦄 **shadcn/ui** – Accessible, beautiful UI components.
- 🎨 **Tailwind CSS** – Utility-first CSS framework.
- 📝 **TypeScript** – Type-safe JavaScript.

---

## 💻 Local Development Setup

### Prerequisites:

- [Node.js](https://nodejs.org/) and npm (recommended to install via [nvm](https://github.com/nvm-sh/nvm)).

### Steps:

1. **Clone the Repository:**
   ```bash
   git clone <YOUR_GIT_URL>
   ```
2. **Navigate to the Project Directory:**

   cd <YOUR_PROJECT_NAME>

3. **Install Dependencies:**

   npm install

4. **Start the Development Server:**
   npm run dev

🌟 How to Contribute
We welcome contributions to improve Saakwa! Here’s how you can get started:

📌 Branch Naming:
When creating a new feature branch, use the following convention:

git checkout -b feature/your-feature-name
🛠️ Contribute via Your IDE:
Clone the repo and create a new branch.

Make your changes.

Push your changes and open a pull request.

## 📢 Key Features

🚚 Laundry Order Placement: Easy-to-use order interface.

🔔 Instant Notifications: The system alerts Saakwa immediately when a customer places an order.

🗓️ Pickup Scheduling: Customers can schedule convenient pickup times.

💵 Affordable Pricing: Saakwa partners with cost-effective laundry providers.

🛵 Fast Delivery: Real-time logistics with dedicated riders.

## 📬 Contact

For issues, feature requests, or business inquiries:

Email: bernardofoegbu71@gmail.com

## 🧩 Marketplace Architecture (v2)

Saakwa now supports a three-sided marketplace:

- Users
- Laundry Houses
- Riders

### New Data Model

Added via migration: `supabase/migrations/20260222090000_marketplace_architecture.sql`

- `laundry_houses`
- `service_offerings`
- `riders`
- `orders`
- `ratings`
- `order_status_history`
- `rider_locations`

### Order State Machine

Canonical order states:

- `PENDING`
- `RIDER_ASSIGNED`
- `PICKED_UP`
- `AT_LAUNDRY`
- `PROCESSING`
- `READY`
- `OUT_FOR_DELIVERY`
- `DELIVERED`
- `CANCELLED`

Transitions are enforced at the database layer through:

- `public.is_valid_order_transition`
- `public.enforce_order_status_transition` trigger

### Rider Matching

Nearest-rider assignment is implemented in SQL:

- `public.assign_nearest_rider(p_order_id uuid)`

Uses Haversine distance against rider live coordinates and marks matched rider unavailable.

### Realtime Tracking

Realtime updates are delivered from Supabase channels:

- Order status updates from `orders`
- Rider GPS updates from `rider_locations`

### New Frontend Routes

- `/marketplace/laundries` - compare laundry houses (price, distance, rating, service filter)
- `/marketplace/orders/:orderId/tracking` - timeline + live map tracking
- `/marketplace/laundry-dashboard` - laundry operations dashboard
- `/marketplace/rider-dashboard` - rider operations dashboard
- `/marketplace/onboarding/laundry-house` - laundry onboarding + listing submission
- `/marketplace/onboarding/rider` - rider onboarding + location submission
- `/_saakwa/internal/admin-onboarding-approvals` - hidden admin queue for onboarding approvals

### Onboarding and Approval Workflow

- Laundry houses and riders submit onboarding requests to `onboarding_applications`.
- Hidden admin approves/rejects via `review_onboarding_application`.
- Only approved + active laundry houses are visible in marketplace listing.
- Rider assignment is constrained to approved riders within a 5km radius from order pickup coordinates.

### Implementation Modules

- API/service layer: `src/api/marketplaceApi.ts`
- Marketplace types: `src/features/marketplace/types.ts`
- Utilities:
  - `src/utils/haversine.ts`
  - `src/utils/pricing.ts`
  - `src/utils/orderStateMachine.ts`
- Hooks:
  - `src/hooks/useMarketplaceLaundries.ts`
  - `src/hooks/useOrderTracking.ts`

### Migration Notes

1. Apply Supabase migrations to your project.
2. Ensure RLS-authenticated users exist for laundry owners and riders where dashboard access is required.
3. Enable Realtime on `orders` and `rider_locations` tables in Supabase if not already enabled.
