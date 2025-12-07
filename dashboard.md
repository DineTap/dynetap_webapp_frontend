# Order System Implementation Plan (T3 Stack + Prisma + Yoco)

## Executive Summary

Transform DyneTap from client-side cart MVP to **persistent, real-time order management system**.

**Current State**: Cart in localStorage only (CartContext), no database persistence  
**Target State**: Cart → Checkout (Yoco payment) → Database-persisted orders with real-time updates

**Timeline**: 1-2 weeks across 5 stages

---

## Implementation Overview (By Stage)

| Stage | Focus | Duration | Status |
|-------|-------|----------|--------|
| **0** | Prisma schema + database | 1-2 days | Not Started |
| **1** | Yoco API integration | 1 day | Not Started |
| **2** | Customer checkout UI | 1-2 days | Not Started |
| **3** | Restaurant dashboard | 2-3 days | Not Started |
| **4** | Analytics + polish | 1-2 days | Not Started |

---

# STAGE 0: Database Schema & Core Infrastructure

**Goal**: Orders and OrderItems tables exist in Supabase, migrations clean

**Success Criteria**:
- ✅ Prisma schema compiles without errors
- ✅ `npx prisma migrate dev` succeeds
- ✅ New tables visible in `npx prisma studio`
- ✅ All existing tests still pass

**Tests**:
- [ ] Schema has no syntax errors
- [ ] Foreign keys properly defined
- [ ] Indexes created for performance
- [ ] Can run `prisma generate` without errors

**Status**: Not Started

---

## 1. System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        CUSTOMER FLOW (Public)                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Browse Menu (getMenuForCustomer - public query)             │
│  2. Add Items to Cart (CartContext - localStorage)              │
│  3. Proceed to Checkout (collect email, phone)                  │
│  4. Payment via Yoco API (customer on Yoco hosted page)         │
│  5. Order Persisted on Payment Success (webhook)                │
│     └─ Creates: Orders + OrderItems records                     │
│  6. Order Confirmation (show Order ID)                          │
│  7. Real-time Order Status Updates (polling)                    │
│     └─ Displays: Pending → Preparing → Served                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                   RESTAURANT OWNER FLOW (Private)                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Dashboard → Orders Section (new authenticated page)         │
│  2. View Paid Orders (getOrdersByMenu - query)                  │
│  3. Update Order Status (updateOrderStatus - mutation)          │
│     ├─ Pending → Preparing (acknowledge order)                  │
│     └─ Preparing → Served (food ready)                          │
│  4. Real-time Updates (polling every 5 seconds)                 │
│     └─ New orders appear, status changes visible instantly      │
│  5. Analytics (past orders, revenue, popular dishes)            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│            DATABASE LAYER (PostgreSQL + Prisma ORM)              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Orders (NEW)                OrderItems (NEW)                    │
│  ├─ id (UUID)               ├─ id (UUID)                        │
│  ├─ menuId (FK) ──┐         ├─ orderId (FK) ─────┐              │
│  ├─ status        │         ├─ dishId (FK)       │              │
│  ├─ paymentStatus │         ├─ quantity          │              │
│  ├─ totalPrice    │         ├─ priceAtTime       │              │
│  ├─ customerEmail │         └─ dishName (snapshot)              │
│  ├─ customerPhone │                              │              │
│  ├─ yocoChargeId  │         Snapshot at order     │              │
│  ├─ notes         │         time (price, name)   │              │
│  ├─ tableNumber   │                              │              │
│  ├─ createdAt     │    Links to existing        │              │
│  └─ updatedAt ───┼───────► Menus, Dishes        │              │
│                  │                               │              │
│                  └───────────────────────────────┘              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Prisma Schema Design

### Current Schema Analysis

**Existing Models** (in `prisma/schema.prisma`):
- ✅ Profiles (users, linked to auth.users)
- ✅ Menus (restaurant menus, linked to Profiles)
- ✅ Dishes (menu items with price in cents)
- ✅ Categories (menu sections)
- ✅ Subscriptions (Lemon Squeezy owner subscriptions)
- ✅ MenuLanguage (language support)
- ✅ Both schema: auth (Supabase) and public (app data)

**Missing Models** (need to add):
- ❌ Orders (track orders with payment status)
- ❌ OrderItems (line items in orders)

### New Prisma Models to Add

Add these models to `prisma/schema.prisma` in the public schema:

```prisma
model Orders {
  id                String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  
  // Relationships
  menuId            String        @map("menu_id") @db.Uuid
  menu              Menus         @relation(fields: [menuId], references: [id], onDelete: Cascade, onUpdate: NoAction)
  
  // Order State
  status            String        @default("pending")  // pending, preparing, served, cancelled
  
  // Order Data
  totalPrice        Int           // Total price in cents
  notes             String?
  tableNumber       String?
  
  // Customer Contact Info
  customerEmail     String
  customerPhone     String
  
  // Payment Information (Yoco)
  paymentStatus     String        @default("unpaid")  // unpaid, paid, failed, refunded
  yocoChargeId      String?       @unique @map("yoco_charge_id")
  yocoTransactionId String?       @map("yoco_transaction_id")
  
  // Relations
  items             OrderItems[]
  
  // Tracking
  createdAt         DateTime      @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt         DateTime      @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)
  
  @@index([menuId])
  @@index([status])
  @@index([paymentStatus])
  @@index([createdAt(sort: Desc)])
  @@map("orders")
  @@schema("public")
}

model OrderItems {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  
  // Relationships
  orderId       String    @map("order_id") @db.Uuid
  order         Orders    @relation(fields: [orderId], references: [id], onDelete: Cascade, onUpdate: NoAction)
  
  dishId        String    @map("dish_id") @db.Uuid
  dish          Dishes    @relation(fields: [dishId], references: [id], onDelete: Restrict, onUpdate: NoAction)
  
  // Item Details
  quantity      Int
  priceAtTime   Int       @map("price_at_time")  // Captured at order time
  dishName      String?   @map("dish_name")      // Snapshot of dish name
  
  // Tracking
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  
  @@index([orderId])
  @@index([dishId])
  @@map("order_items")
  @@schema("public")
}
```

### Update Existing Models

Add relations to `Menus` and `Dishes`:

```prisma
model Menus {
  // ... existing fields
  orders Orders[]  // NEW: One menu has many orders
}

model Dishes {
  // ... existing fields
  orderItems OrderItems[]  // NEW: Track which orders include this dish
}
```

### Migration Steps

1. Add the two new models above to `prisma/schema.prisma`
2. Update `Menus` and `Dishes` models with new relations
3. Run `npx prisma migrate dev --name add_orders_system`
4. Prisma will create migration file and apply to database
5. Run `npx prisma generate` to regenerate Prisma Client

---

## 3. API Endpoints: New Checkout Router

### Create New Checkout Router
Location: `src/server/api/routers/checkout.ts` (NEW)

**Why separate from payments router?**
- `payments` router = subscription billing (Lemon Squeezy, restaurant owner pays for access)
- `checkout` router = per-order payments (Yoco, customer pays for order)
- Clean separation of concerns

### Endpoints

#### 1. `initiateCheckout` - Start Yoco payment
```typescript
// Input (from CartContext)
{
  menuId: string,
  items: [
    { dishId: string, quantity: number },
    { dishId: string, quantity: number }
  ],
  customerEmail: string,
  customerPhone: string,
  notes?: string,
  tableNumber?: string
}

// Process
1. Validate menu exists and is published
2. Fetch fresh dish prices (validate against current DB)
3. Validate all dishes exist and belong to menu
4. Calculate totalPrice = sum(dish.price * quantity)
5. Create Yoco charge via API
6. Store checkout session temporarily (expires 1 hour)
7. Return { yocoChargeId, yocoCheckoutUrl, totalPrice }

// Access: PUBLIC (anyone)

// Returns
{
  yocoChargeId: string,
  yocoCheckoutUrl: string,
  totalPrice: number
}
```

**Key Design Decision**: Order NOT created yet. Only created after payment succeeds via webhook.

---

#### 2. `handleYocoWebhook` - Process payment result
```typescript
// Webhook from Yoco
// POST /api/webhooks/yoco

// Events handled: charge.success, charge.failed, charge.refunded

// Process
1. Validate webhook signature (HMAC with YOCO_WEBHOOK_SECRET)
2. Extract charge ID and status from webhook body
3. Look up temporary checkout session by yocoChargeId
4. If charge.success:
   a. Create Order record with paymentStatus='paid'
   b. Create OrderItems for each item in session
   c. Clear temporary session
   d. Return 200 OK
5. If charge.failed or charge.refunded:
   a. Don't create order
   b. Clear temporary session
   c. Return 200 OK

// Side Effects
- Creates Order + OrderItems if payment successful
- Broadcasts real-time update to restaurant dashboard
- Order now visible in /dashboard/orders for restaurant owner
```

---

#### 3. `getOrderStatus` - Check order status
```typescript
// Input
{ orderId: string }

// Process
1. Fetch order by ID
2. Return with related items

// Access: PUBLIC (anyone, UUID is hard to guess)

// Returns
{
  id: string,
  status: "pending" | "preparing" | "served" | "cancelled",
  paymentStatus: "paid" | "failed" | "refunded",
  totalPrice: number,
  items: [
    {
      dishName: string,
      quantity: number,
      priceAtTime: number
    }
  ],
  customerEmail: string,
  createdAt: Date,
  updatedAt: Date
}
```

**Use Case**: Customer gets Order ID after payment, checks status anytime at `/order/[id]`

---

#### 4. `getOrdersByMenu` - List orders for restaurant
```typescript
// Input
{
  menuId: string,
  status?: "pending" | "preparing" | "served" | "cancelled",
  limit?: number,
  offset?: number
}

// Process
1. Check authorization (user owns this menu)
2. Fetch orders where:
   - menuId matches
   - paymentStatus = 'paid' (only show paid orders)
   - status matches optional filter
3. Ordered by createdAt DESC
4. Include items and customer info

// Access: PRIVATE (must be menu owner)

// Returns
{
  orders: [
    {
      id: string,
      status: string,
      paymentStatus: string,
      totalPrice: number,
      customerEmail: string,
      customerPhone: string,
      items: [{ dishName, quantity, priceAtTime }],
      notes?: string,
      tableNumber?: string,
      createdAt: Date,
      updatedAt: Date
    }
  ],
  total: number
}
```

---

#### 5. `updateOrderStatus` - Change order state
```typescript
// Input
{
  orderId: string,
  newStatus: "preparing" | "served" | "cancelled"
}

// Process
1. Fetch order with menu relation
2. Check authorization (user owns menu)
3. Validate paymentStatus='paid' (can't update unpaid orders)
4. Validate status transition:
   - pending → preparing or cancelled
   - preparing → served or cancelled
   - served → no changes
5. Update order.status and updatedAt
6. Return updated order

// Access: PRIVATE (must be menu owner)

// Returns
{
  success: true,
  order: { id, status, updatedAt }
}
```

---

#### 6. `getOrderHistory` - Analytics data
```typescript
// Input
{
  menuId: string,
  startDate?: Date,
  endDate?: Date
}

// Process
1. Check authorization
2. Fetch all paid orders in date range
3. Calculate metrics:
   - Total revenue
   - Order count
   - Average order value
   - Status breakdown
   - Most popular dishes

// Access: PRIVATE

// Returns
{
  orders: [...],
  totalRevenue: number,
  orderCount: number,
  averageOrderValue: number,
  statusBreakdown: { pending, preparing, served }
}
```

---

## 4. Customer Checkout Flow & UI

### Flow Summary

```
Customer in Menu View
    ↓
Adds items to cart (CartContext, localStorage)
    ↓
Clicks "Proceed to Checkout"
    ↓
OrderCheckoutModal opens with:
  - Cart summary (items, total)
  - Email input
  - Phone input
  - Optional notes
  - Optional table number
    ↓
Clicks "Pay with Yoco"
    ↓
initiateCheckout mutation called
    ↓
Returns yocoCheckoutUrl
    ↓
Redirects to Yoco payment page (hosted by Yoco)
    ↓
Customer enters card details on Yoco
    ↓
Payment succeeds/fails
    ↓
Yoco redirects to /checkout/success or /checkout/failure
    ↓
Webhook arrives: charge.success
    ↓
Server creates Order + OrderItems in database
    ↓
Order.paymentStatus = 'paid'
    ↓
CartContext cleared
    ↓
Display "Order #123 Placed!"
    ↓
Customer can:
  - View order at /order/123
  - Track status in real-time (polling)
    ↓
Restaurant dashboard receives new PAID order
    ↓
Restaurant marks pending → preparing → served
    ↓
Customer sees status updates in real-time
```

### Components Needed

**New Components**:
- `src/components/OrderCheckoutModal/` - Modal for checkout form
  - Email field validation
  - Phone field validation
  - Cart summary display
  - "Pay with Yoco" button
  - Loading state during API call

- `src/components/PaymentStatusBadge/` - Shows payment status
  - Paid (green)
  - Failed (red)
  - Refunded (orange)

- `src/app/checkout/success/page.tsx` - Success redirect page
  - Shows order ID
  - Links to /order/[id]
  - Clear cart

- `src/app/checkout/failure/page.tsx` - Payment failure page
  - Shows error message
  - Button to retry checkout

- `src/app/order/[orderId]/page.tsx` - Order tracking page
  - Display all order details
  - Real-time status updates (polling)
  - Timeline component

**Modified Components**:
- `src/components/MainMenuView/` - Add "Proceed to Checkout" button
- `src/contexts/CartContext.tsx` - (unchanged, already has clear functionality)

---

## 5. Implementation Stages

### Stage 1: Database Schema & Core API (1-2 days)

**Deliverables**:
- [ ] Add Orders model to `prisma/schema.prisma`
- [ ] Add OrderItems model to `prisma/schema.prisma`
- [ ] Add relations to Menus and Dishes
- [ ] Run `npx prisma migrate dev --name add_orders_system`
- [ ] Verify schema with `npx prisma studio`
- [ ] Create `src/server/api/routers/checkout.ts` with endpoints:
  - [ ] `initiateCheckout` mutation
  - [ ] `getOrderStatus` query
  - [ ] `getOrdersByMenu` query (private)
  - [ ] `updateOrderStatus` mutation (private)
- [ ] Create `src/utils/yoco.ts` - Yoco API client
- [ ] Create `src/server/api/webhooks/yoco.ts` - Webhook handler
- [ ] Add environment variables: YOCO_PUBLIC_KEY, YOCO_SECRET_KEY, YOCO_WEBHOOK_SECRET

**Testing**:
- [ ] Prisma schema validates without errors
- [ ] All routers compile without type errors
- [ ] Manual tRPC endpoint testing
- [ ] Database queries work in Prisma Studio

**Files**:
- `prisma/schema.prisma` (modified)
- `src/server/api/routers/checkout.ts` (new)
- `src/utils/yoco.ts` (new)
- `src/server/api/webhooks/yoco.ts` (new)
- `src/env.mjs` (add variables)
- `prisma/migrations/[date]_add_orders_system/` (auto-generated)

---

### Stage 2: Yoco Payment Integration (1 day)

**Deliverables**:
- [ ] Yoco API client in `src/utils/yoco.ts`:
  - [ ] `createCharge()` method
  - [ ] `retrieveCharge()` method
  - [ ] Webhook signature verification
- [ ] Temporary checkout session storage (in-memory Map or Redis)
- [ ] Webhook handler creates Order + OrderItems on charge.success
- [ ] Error handling for failed payments
- [ ] Test with Yoco test keys

**Testing**:
- [ ] Create checkout session → returns Yoco URL
- [ ] Complete payment on Yoco test page → webhook received
- [ ] Webhook creates order with correct items/total
- [ ] Failed payment doesn't create order
- [ ] Webhook signature validation works

**Files**:
- `src/utils/yoco.ts` (complete)
- `src/server/api/webhooks/yoco.ts` (complete)
- `src/server/api/routers/checkout.ts` (update)

---

### Stage 3: Customer Checkout UI (1-2 days)

**Deliverables**:
- [ ] OrderCheckoutModal component
- [ ] Validate email/phone inputs
- [ ] Display cart summary
- [ ] "Pay with Yoco" button calls initiateCheckout
- [ ] Redirect to yocoCheckoutUrl
- [ ] /checkout/success page
- [ ] /checkout/failure page
- [ ] /order/[orderId] tracking page
- [ ] Real-time polling for status updates (every 5 seconds)
- [ ] Payment status badge

**Testing**:
- [ ] Add items to cart
- [ ] Open checkout modal
- [ ] Submit with valid email/phone
- [ ] Redirect to Yoco
- [ ] Complete test payment
- [ ] Redirect to /checkout/success
- [ ] Order appears in database
- [ ] Can access /order/[id]
- [ ] Status updates in real-time

**Files**:
- `src/components/OrderCheckoutModal/` (new)
- `src/components/PaymentStatusBadge/` (new)
- `src/app/checkout/success/page.tsx` (new)
- `src/app/checkout/failure/page.tsx` (new)
- `src/app/order/[orderId]/page.tsx` (new)
- `src/components/MainMenuView/` (modified - add button)

---

### Stage 4: Restaurant Dashboard (2-3 days)

**Deliverables**:
- [ ] `/dashboard/orders/[menuId]` page
- [ ] OrdersList component (only paid orders)
- [ ] OrderCard component with expandable details
- [ ] Status update buttons (Pending → Preparing → Served)
- [ ] Real-time polling (every 5 seconds)
- [ ] Status filter controls
- [ ] Customer info display (email/phone)
- [ ] Navigation updates

**Testing**:
- [ ] View only paid orders
- [ ] Filter by status
- [ ] Update status → see changes immediately
- [ ] Customer sees status changes in real-time
- [ ] Only menu owner can access/edit

**Files**:
- `src/pageComponents/Orders/` (new)
- `src/components/OrdersList/` (new)
- `src/components/OrderCard/` (new)
- `src/pageComponents/Dashboard/DashboardNav.tsx` (modified)
- `src/app/(authenticatedRoutes)/dashboard/orders/[menuId]/page.tsx` (new)

---

### Stage 5: Analytics & Reporting (1-2 days)

**Deliverables**:
- [ ] `/dashboard/analytics/[menuId]` page
- [ ] Revenue chart (only paid orders)
- [ ] Order status breakdown
- [ ] Popular dishes report
- [ ] Payment success rate
- [ ] Peak ordering times

**Files**:
- `src/pageComponents/Analytics/` (new)
- `src/components/RevenueChart/` (new)
- `src/components/OrderStats/` (new)
- `src/app/(authenticatedRoutes)/dashboard/analytics/[menuId]/page.tsx` (new)

---

### Stage 6: WebSocket Real-Time (Future, Not MVP)

Current polling approach is sufficient for MVP. WebSocket can be added later for true real-time (<100ms latency) if needed.

---

## 6. Input Validation with Zod

### Checkout Initiation Schema

```typescript
import { z } from "zod";

export const initiateCheckoutSchema = z.object({
  menuId: z.string().uuid("Invalid menu ID"),
  items: z
    .array(
      z.object({
        dishId: z.string().uuid("Invalid dish ID"),
        quantity: z.number().int().min(1, "Minimum 1 item required"),
      })
    )
    .min(1, "At least 1 item required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone must be at least 10 digits"),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
  tableNumber: z.string().max(10).optional(),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  newStatus: z.enum(["preparing", "served", "cancelled"]),
});
```

---

## 7. Error Handling & Authorization

### Authorization Checks

**Public Endpoints** (no auth required):
- `initiateCheckout` - Anyone can initiate
- `getOrderStatus` - Anyone with order ID
- `handleYocoWebhook` - Validated by HMAC signature (YOCO_WEBHOOK_SECRET)

**Private Endpoints** (requires authentication):
- `getOrdersByMenu` - Must be menu owner
  - Check: `menu.userId === ctx.user.id`
  - Only return paid orders (paymentStatus='paid')
- `updateOrderStatus` - Must be menu owner
  - Check: `menu.userId === ctx.user.id`
  - Cannot update unpaid orders
- `getOrderHistory` - Must be menu owner

### Error Handling Examples

```typescript
// Menu not found
if (!menu) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Menu not found or not published",
  });
}

// Validation: Dish not in menu
if (dish.menuId !== menuId) {
  throw new TRPCError({
    code: "CONFLICT",
    message: "Dish does not belong to this menu",
  });
}

// Authorization: Not menu owner
if (menu.userId !== ctx.user.id) {
  throw new TRPCError({
    code: "FORBIDDEN",
    message: "You can only manage orders for your own menus",
  });
}

// Order not found
if (!order) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Order not found",
  });
}

// Cannot modify unpaid orders
if (order.paymentStatus !== "paid") {
  throw new TRPCError({
    code: "CONFLICT",
    message: "Cannot modify unpaid orders",
  });
}

// Invalid status transition
const validNextStatuses: Record<string, string[]> = {
  pending: ["preparing", "cancelled"],
  preparing: ["served", "cancelled"],
  served: [],  // final state
};

if (!validNextStatuses[order.status]?.includes(newStatus)) {
  throw new TRPCError({
    code: "CONFLICT",
    message: `Cannot change from ${order.status} to ${newStatus}`,
  });
}

// Webhook signature validation
const yocoSignature = req.headers['x-yoco-signature'] as string;
const isValid = verifyYocoSignature(body, yocoSignature, env.YOCO_WEBHOOK_SECRET);

if (!isValid) {
  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "Invalid webhook signature",
  });
}
```

---

## 8. Webhook Security Deep Dive: Why YOCO_WEBHOOK_SECRET is Critical

### The Problem: Webhook Validation

When Yoco sends a webhook to your server after a payment, your server needs to verify that:
1. **The webhook actually came from Yoco** (not from an attacker)
2. **The webhook hasn't been tampered with** (the data inside is genuine)
3. **The webhook is fresh** (not a replay attack from an old webhook)

Without this validation, an attacker could:
- Send fake `charge.success` webhooks to create orders without payment
- Create orders with wrong amounts (e.g., charge customer $1 but create $100 order)
- Bypass payment entirely

### How It Works: HMAC-SHA256 Signature

**Step 1: Yoco creates a signature**

Yoco has the secret key: `sk_test_960bfde0VBrLlpK098e4ffeb53e1`

When they send a webhook, they:
1. Take the raw webhook body (e.g., `{"type":"charge.success","data":{...}}`)
2. Calculate HMAC-SHA256 hash using the secret key
3. Include the hash in the `X-Yoco-Signature` header

```
Raw Body: {"type":"charge.success","data":{"id":"ch_123"}}
Secret: sk_test_960bfde0VBrLlpK098e4ffeb53e1
Hash: HMAC-SHA256(body, secret) = "abc123def456..."

X-Yoco-Signature: abc123def456...
```

**Step 2: Your server validates the signature**

When you receive the webhook, you:
1. Get the signature from the `X-Yoco-Signature` header
2. Recalculate the HMAC-SHA256 hash using YOUR copy of the secret
3. Compare: if signatures match, webhook is genuine; if not, reject

```typescript
// Your server receives
POST /api/webhooks/yoco
X-Yoco-Signature: abc123def456...
{
  "type": "charge.success",
  "data": { "id": "ch_123" }
}

// Your code does:
const body = '{"type":"charge.success","data":{"id":"ch_123"}}';
const secret = env.YOCO_WEBHOOK_SECRET;
const calculatedSignature = crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('hex');

// abc123def456... === abc123def456... ✅ VALID
// Webhook is from Yoco, proceed to create order
```

### Why You Need the Secret

The `YOCO_WEBHOOK_SECRET` is a **shared secret between Yoco and your server**:

- **Yoco knows it** - Uses it to sign webhooks when sending to you
- **Your server knows it** - Uses it to verify signatures when receiving from Yoco
- **Attackers don't know it** - Can't fake valid signatures without the secret

If you don't validate:
```typescript
// ❌ VULNERABLE CODE - Never do this!
app.post('/api/webhooks/yoco', (req, res) => {
  const { data } = req.body;
  // Just trust whatever comes in!
  if (data.status === 'succeeded') {
    createOrder(data); // ATTACKER COULD FAKE THIS!
  }
});
```

### Real-World Attack Scenario

**Attacker sends fake webhook:**
```
POST /api/webhooks/yoco
{
  "type": "charge.success",
  "data": {
    "id": "ch_fake_123",
    "amount": 2500,  // Customer pays $25
    "metadata": { "orderId": "550e8400..." }
  }
}
```

**Without signature validation:**
- Your server creates order for $25 ✅ (attacker's order)
- Yoco never actually received payment ❌
- Customer not charged, restaurant loses money

**With signature validation:**
- Header `X-Yoco-Signature` is missing or invalid
- Your server rejects with 401 Unauthorized
- Order never created ✅
- Attack prevented

### Security Best Practices

1. **Always validate signatures** - Never trust webhook source
2. **Keep secret private** - Never commit to git, use environment variables
3. **Use exact body** - Signature includes exact bytes, any change breaks it
4. **Store secret securely**:
   ```env
   # .env.local (never commit this)
   YOCO_WEBHOOK_SECRET=whsk_test_[very_long_secret]
   ```
5. **Regenerate if compromised** - Yoco dashboard lets you generate new secrets
6. **Log validation failures** - Alert if someone tries fake webhooks

### Where to Get the Secret

1. Go to [Yoco Dashboard](https://dashboard.yoco.com)
2. Navigate to **Settings → API Keys**
3. Find **Webhook Signing Secret**
4. Copy the secret (starts with `whsk_`)
5. Add to your `.env.local`:
   ```env
   YOCO_WEBHOOK_SECRET=whsk_test_[your_secret]
   ```

### Implementation in Your Code

```typescript
// src/utils/yoco.ts
import crypto from 'crypto';

export function verifyYocoSignature(
  body: string, // Raw request body as string
  signature: string, // From X-Yoco-Signature header
  secret: string // YOCO_WEBHOOK_SECRET from env
): boolean {
  try {
    const calculatedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    // Constant-time comparison (prevents timing attacks)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  } catch {
    return false;
  }
}
```

```typescript
// src/server/api/webhooks/yoco.ts
import { verifyYocoSignature } from '~/utils/yoco';

export async function POST(req: Request) {
  const signature = req.headers.get('x-yoco-signature');
  const body = await req.text();

  // Validate signature
  if (!signature || !verifyYocoSignature(body, signature, env.YOCO_WEBHOOK_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Signature valid - process webhook
  const event = JSON.parse(body);
  
  if (event.type === 'charge.success') {
    // Safe to create order - webhook is from Yoco
    await createOrderFromWebhook(event.data);
  }

  return new Response('OK', { status: 200 });
}
```

---

## 9. Environment Variables Required

Add to `.env.local`:

```env
# Yoco Payment API
YOCO_PUBLIC_KEY=pk_test_ed3c54a6gOol69qa7f45
YOCO_SECRET_KEY=sk_test_960bfde0VBrLlpK098e4ffeb53e1
YOCO_WEBHOOK_SECRET=whsk_test_[webhook_secret_from_yoco]

# Existing variables (keep unchanged)
DATABASE_URL=...
NEXT_PUBLIC_SUPABASE_URL=...
# ... etc
```

**Important**: Get `YOCO_WEBHOOK_SECRET` from Yoco dashboard → API Keys → Webhook section

---

## 10. Real-Time Strategy: Polling vs WebSocket

### Phase 1: Polling (Current MVP)
- **Mechanism**: React Query auto-refetch every 5 seconds
- **Pros**: Works immediately, no infrastructure changes, simple to implement
- **Cons**: More bandwidth (1 request per 5 seconds), slight delay (up to 5s)
- **Implementation**: `refetchInterval: 5000` on useQuery

Example:
```typescript
const { data: orders, refetch } = trpc.checkout.getOrdersByMenu.useQuery(
  { menuId },
  { refetchInterval: 5000 }  // Poll every 5 seconds
);
```

### Phase 2: WebSocket (Future Enhancement)
- **Mechanism**: tRPC subscriptions with persistent WebSocket
- **Pros**: True real-time (< 100ms), reduces bandwidth
- **Cons**: Requires server infrastructure upgrade
- **Will implement when**: Platform scales or latency becomes critical

**For now, stick with polling. It's simple, reliable, and sufficient for MVP.**

---

## 11. Security Considerations

### Payment Security
- ✅ Yoco handles PCI compliance (customer never sees card processing)
- ✅ Webhook signature validation with HMAC-SHA256
- ✅ Order only created AFTER payment success (not before)
- ✅ Prices re-validated at checkout (prevent price tampering)

### Data Security
- ✅ Customer email/phone stored (needed for communication)
- ✅ Order IDs are UUIDs (cryptographically random, hard to guess)
- ✅ Menu owner access control on status updates
- ✅ No sensitive payment data stored locally

### Access Control
- ✅ Menu owner can only update their own orders
- ✅ Private endpoints require authentication
- ✅ Public endpoints have no sensitive data

---

## 12. Key Design Decisions

### 1. Order Created AFTER Payment
- **Why**: Prevents "ghost orders" if webhook fails
- **Alternative**: Create immediately, update on webhook
- **Impact**: Restaurant only sees confirmed paid orders

### 2. Customer Email/Phone Required
- **Why**: Can contact customer if needed
- **Alternative**: Optional (harder to communicate)
- **Impact**: Better customer service

### 3. Price Snapshot (priceAtTime)
- **Why**: If restaurant changes prices, order history stays accurate
- **Alternative**: Store dish reference only
- **Impact**: Fair billing, accurate reporting

### 4. Polling Not WebSocket
- **Why**: Simple, works immediately, no ops burden
- **Alternative**: WebSocket for true real-time
- **Impact**: 5s latency acceptable for MVP, can upgrade later

### 5. Separate Checkout Router
- **Why**: Clear separation from subscription payments
- **Alternative**: Merge into payments router
- **Impact**: Cleaner code, easier to maintain

### 6. Only Paid Orders in Dashboard
- **Why**: Restaurant only acts on confirmed payments
- **Alternative**: Show all orders, filter failed
- **Impact**: Simpler workflow, less confusion

---

## 13. Testing Checklist

### Unit Tests
- [ ] Zod schemas validate correctly
- [ ] Yoco signature verification works
- [ ] Order status transitions enforced
- [ ] Price calculations correct

### Integration Tests
- [ ] Create checkout → Yoco URL returned
- [ ] Complete payment → Webhook received
- [ ] Webhook creates order in database
- [ ] Order has correct items and total
- [ ] Failed payment doesn't create order
- [ ] Restaurant dashboard shows only paid orders
- [ ] Only menu owner can update status
- [ ] Customer can view /order/[id]

### Manual Testing
- [ ] Full customer flow: menu → cart → checkout → Yoco → order
- [ ] Full restaurant flow: see order → update status → complete
- [ ] Real-time updates: customer sees status changes within 5s
- [ ] Error handling: payment failure shows graceful error
- [ ] Mobile responsive: works on phone (important for customers)

---

## 14. Success Criteria

### Functional
- ✅ Customers can add items, checkout, and pay via Yoco
- ✅ Orders persist to database only after payment
- ✅ Restaurant owners see paid orders only
- ✅ Order status can be updated (pending → preparing → served)
- ✅ Customers see real-time status updates
- ✅ Order history available for analytics

### Non-Functional
- ✅ Real-time updates within 5 seconds (polling)
- ✅ Proper authorization on all endpoints
- ✅ Input validation on all inputs
- ✅ Error handling with meaningful messages
- ✅ Mobile-friendly UI
- ✅ No data loss on network issues

### Security
- ✅ Webhook signature validated
- ✅ Menu owner can only edit own orders
- ✅ Customer cannot see other orders
- ✅ Prices immutable after order created
- ✅ No payment data stored locally

---

## 15. Timeline

- **Stage 1**: 1-2 days (database + API)
- **Stage 2**: 1 day (Yoco integration)
- **Stage 3**: 1-2 days (checkout UI)
- **Stage 4**: 2-3 days (restaurant dashboard)
- **Stage 5**: 1-2 days (analytics)

**Total: 1-2 weeks for full implementation**

Next step: Start Stage 1 - Update Prisma schema and create checkout router

---

## Appendix: Yoco API Reference

### Yoco Credentials
```
Public Key: pk_test_ed3c54a6gOol69qa7f45
Secret Key: sk_test_960bfde0VBrLlpK098e4ffeb53e1
Webhook Secret: [to be configured in Yoco dashboard]
```

### Create Charge
```bash
POST https://api.yoco.com/v1/charges
Authorization: Bearer sk_test_960bfde0VBrLlpK098e4ffeb53e1
Content-Type: application/json

{
  "amount": 2500,  # Amount in cents (e.g., 2500 = R25.00)
  "currency": "ZAR",
  "metadata": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "menuId": "550e8400-e29b-41d4-a716-446655440001"
  },
  "successUrl": "https://dynetap.com/checkout/success",
  "failureUrl": "https://dynetap.com/checkout/failure"
}
```

### Webhook Events
- `charge.success` - Payment successful
- `charge.failed` - Payment failed
- `charge.pending` - Payment pending (rare)
- `charge.refunded` - Payment refunded

### Webhook Payload Example
```json
{
  "type": "charge.success",
  "data": {
    "id": "ch_test_123",
    "amount": 2500,
    "currency": "ZAR",
    "status": "succeeded",
    "metadata": {
      "orderId": "550e8400-e29b-41d4-a716-446655440000"
    },
    "createdAt": "2025-11-23T10:30:00Z"
  },
  "createdAt": "2025-11-23T10:30:00Z"
}
```

---

This comprehensive plan combines all components needed for implementing the order system with T3 Stack, Prisma, and Yoco integration. Ready for Stage 1 implementation.
