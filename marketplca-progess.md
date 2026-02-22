# Saakwa Marketplace Progress

_Last updated: 2026-02-22_

## What is done

### Core marketplace architecture
- Added three-sided marketplace foundation for:
  - Users
  - Laundry Houses
  - Riders
- Existing checkout/booking flow remains available.

### Database and backend logic (Supabase migrations)
- Added marketplace schema in `supabase/migrations/20260222090000_marketplace_architecture.sql`:
  - `laundry_houses`
  - `service_offerings`
  - `riders`
  - `orders`
  - `ratings`
  - `order_status_history`
  - `rider_locations`
- Added order state machine enum + transition enforcement:
  - `PENDING`
  - `RIDER_ASSIGNED`
  - `PICKED_UP`
  - `AT_LAUNDRY`
  - `PROCESSING`
  - `READY`
  - `OUT_FOR_DELIVERY`
  - `DELIVERED`
  - `CANCELLED`
- Added SQL functions/triggers for:
  - Valid state transition enforcement
  - Status history logging
  - Auto-confirm behavior for laundries with auto-confirm enabled
- Added nearest rider assignment via Haversine.

### 5km rider assignment + onboarding approvals
- Added onboarding and admin approval schema in `supabase/migrations/20260222100000_onboarding_and_admin_approvals.sql`:
  - `onboarding_applications`
  - `admin_users`
  - onboarding status fields on `laundry_houses` and `riders`
- Added review RPC: `review_onboarding_application(...)`
- Updated rider assignment to enforce:
  - rider is approved and active
  - rider is within 5km of pickup target

### API/service layer
- Added marketplace service module: `src/api/marketplaceApi.ts`
- Supports:
  - Laundry comparison data
  - Marketplace order creation
  - Order status transitions
  - Rider assignment
  - Rider location updates
  - Realtime subscriptions for order and rider location
  - Laundry onboarding submission
  - Rider onboarding submission
  - Admin pending onboarding fetch
  - Admin approve/reject onboarding

### Frontend routes/pages
- Added routes in `src/App.tsx`:
  - `/marketplace/laundries`
  - `/marketplace/orders/:orderId/tracking`
  - `/marketplace/laundry-dashboard`
  - `/marketplace/rider-dashboard`
  - `/marketplace/onboarding/laundry-house`
  - `/marketplace/onboarding/rider`
  - `/_saakwa/internal/admin-onboarding-approvals` (hidden admin)
- Added pages:
  - `src/pages/MarketplaceLaundries.tsx`
  - `src/pages/OrderTracking.tsx`
  - `src/pages/LaundryDashboard.tsx`
  - `src/pages/RiderDashboard.tsx`
  - `src/pages/LaundryOnboarding.tsx`
  - `src/pages/RiderOnboarding.tsx`
  - `src/pages/AdminOnboardingApprovals.tsx`

### Home page update
- Updated `src/pages/Home.tsx` to reflect marketplace features and onboarding.
- Added colorful visual direction while keeping blue primary.
- Added hero image (joyful woman with clean clothes).

### Laundry onboarding catalog pricing (latest)
- Laundry onboarding now uses the full predefined clothing catalog from:
  - `src/utils/clothing-items.ts`
- For each item, onboarding now shows:
  - Suggested price (Saakwa)
  - Laundry custom price input
  - Include/exclude selection
- Submission includes suggested + custom item pricing metadata.

## Supporting modules added
- `src/features/marketplace/types.ts`
- `src/hooks/useMarketplaceLaundries.ts`
- `src/hooks/useOrderTracking.ts`
- `src/components/marketplace/OrderTimeline.tsx`
- `src/components/marketplace/LiveTrackingMap.tsx`
- `src/utils/haversine.ts`
- `src/utils/pricing.ts`
- `src/utils/orderStateMachine.ts`

## Current known constraints / notes
- Hidden admin page currently uses email allow-list logic in frontend and admin table/function in DB.
- Build passes (`npm run build` completed successfully after changes).
- Bundle size warnings remain from Vite about chunk size (not a blocking error).

## Suggested next tasks
- Add dedicated admin auth guard hook/component to centralize permission checks.
- Add migrations/tests for stricter uniqueness and data validation around onboarding payload.
- Add map-based coordinate picker for laundry/rider onboarding.
- Add dynamic imports/code-splitting for new marketplace routes.
- Add e2e tests for full onboarding -> approval -> assignment flow.
