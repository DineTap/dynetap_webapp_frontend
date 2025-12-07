# Order System Implementation Plan

**Philosophy**: Incremental stages following copilot.md principles  
**Approach**: Small, testable changes that compile and pass tests  
**Timeline**: 1-2 weeks total

---

## Overview: 5 Stages to Production

| Stage | Goal | Duration | Learn From | Status |
|-------|------|----------|-----------|--------|
| **0** | Schema + DB | 1-2 days | Prisma docs, migrations | Not Started |
| **1** | Yoco API | 1 day | Yoco API reference | Not Started |
| **2** | Checkout UI | 1-2 days | MainMenuView (existing cart) | Not Started |
| **3** | Dashboard | 2-3 days | DashboardNav structure | Not Started |
| **4** | Analytics | 1-2 days | Existing subscription analytics | Not Started |

---

# STAGE 0: Database Schema & Migrations

## Goal
Create Orders and OrderItems tables in Supabase with all required fields.

## Success Criteria
✅ `npx prisma migrate dev --name add_orders_system` runs successfully  
✅ New tables visible in `npx prisma studio`  
✅ Schema has proper indexes and foreign keys  
✅ All existing code still compiles  

## Plan
1. Add Orders model to schema
2. Add OrderItems model to schema
3. Update Menus and Dishes with relations
4. Run migration
5. Verify in Prisma Studio

## Tests
- [ ] No Prisma schema syntax errors
- [ ] Migration file created and valid SQL
- [ ] Can generate Prisma Client (`npx prisma generate`)
- [ ] No breaking changes to existing queries

## Implementation Checklist
- [ ] Open `prisma/schema.prisma`
- [ ] Add Orders model (UUID id, menuId FK, status, prices, customer info, yoco fields)
- [ ] Add OrderItems model (UUID id, orderId FK, dishId FK, quantity, priceAtTime)
- [ ] Add `orders Orders[]` to Menus model
- [ ] Add `orderItems OrderItems[]` to Dishes model
- [ ] Run `npx prisma migrate dev --name add_orders_system`
- [ ] Verify tables exist: `npx prisma studio`
- [ ] Commit with message: "feat: add orders schema (stage 0)"

## Status
🔴 Not Started

---

# STAGE 1: Yoco Payment API Client

## Goal
Create reusable Yoco API client that can create charges and verify webhooks.

## Success Criteria
✅ Can create Yoco charge and get checkout URL  
✅ Can verify webhook signatures (HMAC-SHA256)  
✅ Error handling for failed payments  
✅ Test with Yoco test credentials  

## Learn From
- Yoco API docs (charge creation, webhooks)
- Existing payment integration patterns (if any)
- Node.js crypto module for HMAC

## Implementation Checklist

### Create `src/utils/yoco.ts`
- [ ] Export `createCharge(amount, metadata)` function
  - Calls Yoco API with SECRET_KEY
  - Returns { chargeId, checkoutUrl, amount }
- [ ] Export `verifySignature(body, signature, secret)` function
  - Uses crypto.createHmac for SHA256
  - Returns boolean
- [ ] Export `getCharge(chargeId)` function (optional, for polling)

### Create `src/utils/yoco-session.ts`
- [ ] In-memory Map to store checkout sessions
- [ ] Session = { chargeId, items, totals, customerEmail, phone }
- [ ] Auto-expire after 1 hour
- [ ] Functions: saveSession, getSession, clearSession

### Update `src/env.mjs`
- [ ] Add YOCO_PUBLIC_KEY validation
- [ ] Add YOCO_SECRET_KEY validation
- [ ] Add YOCO_WEBHOOK_SECRET validation

## Tests
- [ ] `verifySignature()` returns true for valid signature
- [ ] `verifySignature()` returns false for invalid signature
- [ ] `createCharge()` with test key returns valid response
- [ ] Session storage and retrieval works
- [ ] Session auto-expires after timeout

## Status
🔴 Not Started

---

# STAGE 2: Customer Checkout Flow

## Goal
Replace "Complete Order" button with Yoco payment flow.

## Learn From
- `src/components/MainMenuView/MainMenuView.tsx` (existing cart UI)
- CartContext usage (how items stored)
- Modal pattern (if exists)

## Success Criteria
✅ Checkout collects email/phone  
✅ Calls initiateCheckout mutation  
✅ Redirects to Yoco payment page  
✅ Returns to /checkout/success or /checkout/failure  
✅ Customer sees order confirmation with order ID  

## Implementation Checklist

### Update `src/components/MainMenuView/MainMenuView.tsx`
- [ ] Change "Complete Order" button behavior
  - Instead of alert(), call initiateCheckout mutation
  - Show loading state during API call
  - Handle errors gracefully

### Create `src/server/api/routers/checkout.ts`
- [ ] Export `initiateCheckout` public mutation
  - Input: { menuId, items[], customerEmail, customerPhone, notes?, tableNumber? }
  - Validates menu exists
  - Re-validates dish prices (prevent tampering)
  - Calls Yoco createCharge
  - Saves session
  - Returns { yocoCheckoutUrl, checkoutId }
- [ ] Zod schema for input validation

### Create webhook handler
- [ ] Create `src/app/api/webhooks/yoco/route.ts`
  - Receives Yoco webhook POST
  - Validates signature
  - If charge.success: create Order + OrderItems, clear session
  - If charge.failed: clear session, don't create order
  - Return 200 OK

### Create redirect pages
- [ ] `src/app/checkout/success/page.tsx`
  - Shows "Order #123 confirmed"
  - Displays order details
  - Link to `/order/[id]` for tracking
  - Clear cart
- [ ] `src/app/checkout/failure/page.tsx`
  - Shows error message
  - Button to "Try Again"

### Create order tracking page
- [ ] `src/app/order/[orderId]/page.tsx`
  - Public page (no auth)
  - Shows order status
  - Displays items and total
  - Real-time polling (5 second intervals)
  - Status timeline (pending → preparing → served)

## Tests
- [ ] Email validation works
- [ ] Phone validation works
- [ ] initiateCheckout creates session
- [ ] Yoco redirect URL is valid
- [ ] Webhook creates order on success
- [ ] Webhook doesn't create order on failure
- [ ] Can access /order/[id] without auth
- [ ] Status updates appear within 5 seconds

## Status
🔴 Not Started

---

# STAGE 3: Restaurant Dashboard

## Goal
Create orders management page where restaurant owners see incoming orders and update status.

## Learn From
- `src/pageComponents/Dashboard/` (existing dashboard structure)
- DashboardNav component (navigation pattern)
- Private route pattern (`(authenticatedRoutes)`)

## Success Criteria
✅ `/dashboard/orders/[menuId]` page exists  
✅ Shows only PAID orders (paymentStatus='paid')  
✅ Restaurant can update order status (pending → preparing → served)  
✅ Real-time updates (polling every 5 seconds)  
✅ Filter by status works  
✅ Only menu owner can access  

## Implementation Checklist

### Create tRPC procedures in `checkout.ts`
- [ ] `getOrdersByMenu` query (private)
  - Input: { menuId, status?, limit, offset }
  - Checks: user owns this menu
  - Returns: only paid orders, ordered by createdAt DESC
- [ ] `updateOrderStatus` mutation (private)
  - Input: { orderId, newStatus }
  - Validates: user owns menu, order is paid, valid status transition
  - Updates order.status and updatedAt
  - Returns updated order

### Create dashboard pages
- [ ] `src/app/(authenticatedRoutes)/dashboard/orders/[menuId]/page.tsx`
  - Shows list of paid orders
  - Real-time polling with refetchInterval: 5000
  - Filter controls (by status)

### Create components
- [ ] `src/components/OrdersList/` component
  - Takes orders array
  - Displays in card format
- [ ] `src/components/OrderCard/` component
  - Shows customer name/email
  - Shows items and total (use CurrencyDisplay)
  - Shows current status with badge
  - Buttons to update status (if not served)
  - Loading state during update

### Update navigation
- [ ] Add "Orders" link to DashboardNav
- [ ] Link to `/dashboard/orders/[menuId]`

## Tests
- [ ] Only authenticated users can access
- [ ] Only menu owner sees their orders
- [ ] Non-paid orders don't appear
- [ ] Status filter works
- [ ] Status update button works
- [ ] Polling refreshes data
- [ ] Invalid status transitions are prevented

## Status
🔴 Not Started

---

# STAGE 4: Analytics & Polish

## Goal
Add revenue tracking and clean up UI polish.

## Learn From
- Existing subscription analytics (if any)
- Charts library (if used)

## Success Criteria
✅ Revenue metrics visible  
✅ Order count and average visible  
✅ Popular dishes tracked  
✅ R currency displayed consistently  
✅ Mobile responsive  

## Implementation Checklist

### Add tRPC procedures
- [ ] `getOrderHistory` query (private)
  - Input: { menuId, startDate?, endDate? }
  - Returns: totalRevenue, orderCount, averageValue, statusBreakdown
- [ ] `getPopularDishes` query (private)
  - Input: { menuId, limit }
  - Returns: dishes ordered by frequency

### Create analytics page
- [ ] `src/app/(authenticatedRoutes)/dashboard/analytics/[menuId]/page.tsx`
  - Revenue chart (if charting library available, use it; otherwise cards)
  - Total revenue card
  - Order count card
  - Average order value card
  - Popular dishes list

### Currency Display Improvement
- [ ] Create `src/components/CurrencyDisplay/index.tsx`
  - Props: amountInCents, size ('sm'|'md'|'lg'|'xl'), className
  - Formats: R 25.00 (bold R)
- [ ] Update all price displays to use it
  - MainMenuView prices
  - Cart items
  - Order totals
  - Dashboard orders
  - Analytics metrics

### Testing
- [ ] Analytics page loads
- [ ] Numbers are correct
- [ ] Charts/cards display properly
- [ ] Mobile responsive

## Status
🔴 Not Started

---

## When Stuck (3 Attempt Rule)

If something doesn't work after 3 attempts:

1. **Document what failed**
   - What you tried
   - Error message
   - What you expected

2. **Research alternatives**
   - Find similar code in codebase
   - Check if library has different API
   - Look for examples

3. **Question fundamentals**
   - Is this really needed?
   - Can it be simpler?
   - Different approach?

4. **Try different angle**
   - Different tRPC pattern
   - Different component structure
   - Simplify requirements

---

## Principles to Follow

✅ **Do This**:
- Commit working code frequently
- Write tests as you go
- Follow existing patterns in codebase
- Keep functions small and single-purpose
- Test manually before committing

❌ **Don't Do This**:
- Commit broken code
- Disable tests
- Make big changes without testing
- Copy-paste code (understand it first)
- Ignore linting errors

---

## Quick Commands Reference

```bash
# Create migration (after schema changes)
npx prisma migrate dev --name add_orders_system

# Check schema compiles
npx prisma generate

# View database
npx prisma studio

# Run tests
npm test

# Format code
npm run format

# Lint code
npm run lint
```

---

## Progress Tracking

Update this section as you complete stages:

- [ ] STAGE 0: Database schema - Not Started
- [ ] STAGE 1: Yoco API - Not Started
- [ ] STAGE 2: Checkout UI - Not Started
- [ ] STAGE 3: Dashboard - Not Started
- [ ] STAGE 4: Analytics - Not Started

**Total Progress**: 0%
