# Customer Experience Flow - DyneTap

## Current State Analysis

### What EXISTS:
1. **Shopping Cart Context** (`src/contexts/CartContext.tsx`)
   - ✅ Cart state management with localStorage persistence
   - ✅ Add/remove/update items functionality
   - ✅ Price calculation (total, item count)
   - ❌ NOT YET INTEGRATED into any pages

2. **Public Menu View** (`src/components/MainMenuView/MainMenuView.tsx`)
   - ✅ Displays restaurant info, categories, and dishes
   - ✅ Shows dish name, description, price, tags, macros, images
   - ✅ Category navigation
   - ✅ Language selector
   - ❌ NO "Add to Cart" buttons
   - ❌ NO cart icon/badge

3. **Payment/Checkout System**
   - ⚠️ **ONLY for RESTAURANT OWNERS** (subscription billing via LemonSqueezy)
   - ❌ NO customer checkout flow
   - ❌ NO customer payment processing
   - ❌ NO order summary page for customers

### What's MISSING (Customer Ordering Flow):
- [ ] CartProvider wrapper for public menu pages
- [ ] "Add to Order" buttons on dishes
- [ ] Cart icon with item count badge
- [ ] Cart preview/sidebar
- [ ] Checkout page (`/menu/[slug]/checkout`)
- [ ] Order summary with line items
- [ ] Dummy payment button
- [ ] Order confirmation

---

## Proposed Customer Experience Flow

### 1. **QR Code Scan**
```
Customer scans QR code at table
    ↓
Redirects to: /menu/[restaurant-slug]
```

**Current URL Structure:**
- Public menu: `/menu/[slug]` (e.g., `/menu/test-restaurant-admin-3`)
- Uses `src/app/menu/[slug]/page.tsx` → `MenuPage` component
- Renders `MainMenuView` with full menu data

---

### 2. **Browse Menu** (✅ EXISTS)
```
Customer lands on public menu page
    ↓
Sees restaurant header with:
  - Restaurant name, logo
  - Address, city, phone number
  - Category navigation bar
    ↓
Scrolls through categories:
  - Appetizers
  - Main Courses
  - Desserts
  - Drinks
    ↓
Each dish shows:
  - Name
  - Description
  - Price (PLN)
  - Tags (vegan, gluten-free, etc.)
  - Nutritional info (calories, protein, carbs, fat)
  - Image (if available)
```

**Current Implementation:**
- Component: `src/components/MainMenuView/MainMenuView.tsx`
- Language switching supported
- Categories auto-scroll navigation
- Dish variants supported

---

### 3. **Add Items to Cart** (❌ NEEDS IMPLEMENTATION)
```
Customer clicks "Add to Order" button on dish
    ↓
Item added to cart with:
  - Dish ID
  - Name
  - Price (in cents)
  - Quantity (default: 1)
  - Picture URL
    ↓
Cart icon badge updates (+1)
    ↓
Toast notification: "Added to order!"
```

**Implementation Needed:**
1. Wrap `/menu/[slug]` route with `CartProvider`
2. Add "Add to Order" button to each dish card
3. Add floating cart icon (bottom-right or header)
4. Show item count badge on cart icon
5. Add toast feedback

**Files to Modify:**
- `src/app/menu/[slug]/layout.tsx` (create, wrap with CartProvider)
- `src/components/MainMenuView/MainMenuView.tsx` (add button to dish cards)
- Add cart icon component with badge

---

### 4. **View Cart Summary** (❌ NEEDS IMPLEMENTATION)
```
Customer clicks cart icon
    ↓
Slides open cart sidebar/modal OR navigates to checkout page
    ↓
Shows:
  - List of items (name, qty, price)
  - Quantity controls (+/- buttons)
  - Remove item button
  - Subtotal
  - "Continue Shopping" button
  - "Proceed to Checkout" button
```

**Two Options:**
- **Option A:** Sidebar/Drawer component (quick view)
- **Option B:** Full checkout page (recommended for MVP)

**Files to Create:**
- `src/components/CartDrawer/CartDrawer.tsx` (Option A)
  OR
- `src/app/menu/[slug]/checkout/page.tsx` (Option B - RECOMMENDED)

---

### 5. **Checkout Page** (❌ NEEDS IMPLEMENTATION)
```
URL: /menu/[restaurant-slug]/checkout

Customer sees:
  - Restaurant name/logo
  - "Your Order" heading
  - Order Summary:
    ┌─────────────────────────────────────┐
    │ Chicken Kebab       x2    24.00 PLN │
    │ Coca Cola           x1     4.00 PLN │
    │ Fries               x1     8.00 PLN │
    ├─────────────────────────────────────┤
    │ Total                     36.00 PLN │
    └─────────────────────────────────────┘
  - Quantity adjustment controls
  - "Back to Menu" button
  - "Proceed to Payment" button (dummy)
```

**File to Create:**
- `src/app/menu/[slug]/checkout/page.tsx`
- Component: `src/pageComponents/Checkout/Checkout.page.tsx`

**Features:**
- Read cart items from CartContext
- Display line items with images
- Update quantity inline
- Remove items
- Calculate total (PLN)
- "Back to Menu" link
- "Pay Now" dummy button

---

### 6. **Payment (Dummy)** (❌ NEEDS IMPLEMENTATION)
```
Customer clicks "Pay Now" button
    ↓
Shows modal/overlay:
  ┌─────────────────────────────────┐
  │   ✓  Order Placed!              │
  │                                 │
  │   Your order has been sent      │
  │   to the kitchen.               │
  │                                 │
  │   Total: 36.00 PLN             │
  │                                 │
  │   [OK]                         │
  └─────────────────────────────────┘
    ↓
Clears cart
    ↓
Redirects back to menu OR shows "Order Again" button
```

**Implementation:**
- Success modal component
- Clear cart on "payment"
- No actual payment processing (dummy button for MVP)
- Optional: Save order to database (future feature)

---

## Technical Implementation Plan

### Phase 1: Add Cart to Public Menu
```typescript
// src/app/menu/[slug]/layout.tsx (CREATE)
import { CartProvider } from "~/contexts/CartContext";

export default function MenuLayout({ children }) {
  return <CartProvider>{children}</CartProvider>;
}
```

### Phase 2: Add "Add to Order" Buttons
```typescript
// Modify src/components/MainMenuView/MainMenuView.tsx
import { useCart } from "~/contexts/CartContext";

// Inside dish card:
const { addItem } = useCart();

<Button 
  onClick={() => addItem({
    dishId: dish.id,
    name: dish.name,
    price: dish.price,
    pictureUrl: dish.pictureUrl
  })}
>
  Add to Order
</Button>
```

### Phase 3: Create Cart Icon Header
```typescript
// src/components/CartIcon/CartIcon.tsx (CREATE)
import { ShoppingCart } from "lucide-react";
import { useCart } from "~/contexts/CartContext";

export function CartIcon() {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();
  
  return (
    <Link href="./checkout">
      <Button variant="outline" size="icon">
        <ShoppingCart />
        {itemCount > 0 && <Badge>{itemCount}</Badge>}
      </Button>
    </Link>
  );
}
```

### Phase 4: Create Checkout Page
```typescript
// src/app/menu/[slug]/checkout/page.tsx (CREATE)
import { CheckoutPage } from "~/pageComponents/Checkout/Checkout.page";

export default function Page({ params }) {
  return <CheckoutPage slug={params.slug} />;
}

// src/pageComponents/Checkout/Checkout.page.tsx (CREATE)
"use client";
import { useCart } from "~/contexts/CartContext";

export function CheckoutPage({ slug }) {
  const { items, getTotal, updateQuantity, removeItem, clearCart } = useCart();
  
  // Render order summary with controls
  // Add dummy payment button
}
```

---

## Database Schema (Future - Not MVP)

For tracking actual orders (OPTIONAL, not needed for MVP):

```sql
-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  menu_id UUID REFERENCES menus(id),
  table_number TEXT,
  status TEXT, -- pending, preparing, completed
  total INTEGER, -- in cents
  created_at TIMESTAMP
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  dish_id UUID REFERENCES dishes(id),
  quantity INTEGER,
  price_at_time INTEGER, -- snapshot of price
  created_at TIMESTAMP
);
```

**For MVP:** Skip database, just use client-side cart.

---

## Current vs. Desired State

| Feature | Current | Needed for MVP |
|---------|---------|----------------|
| Public menu view | ✅ Exists | No changes needed |
| Add to cart buttons | ❌ Missing | ✅ Add to dish cards |
| Cart icon with badge | ❌ Missing | ✅ Create component |
| Cart state management | ✅ Exists (CartContext) | ✅ Integrate into layout |
| Checkout page | ❌ Missing | ✅ Create page |
| Order summary | ❌ Missing | ✅ Create component |
| Dummy payment | ❌ Missing | ✅ Add button + modal |
| Payment processing | ❌ None | ❌ Not needed for MVP |
| Order history | ❌ None | ❌ Not needed for MVP |

---

## Summary: Customer Journey

1. **Scan QR** → Opens `/menu/test-restaurant-admin-3`
2. **Browse Menu** → See categories, dishes, prices
3. **Add Items** → Click "Add to Order" buttons
4. **View Cart** → Click cart icon (badge shows count)
5. **Checkout** → Navigate to `/menu/test-restaurant-admin-3/checkout`
6. **Review Order** → See line items, adjust quantities
7. **Pay (Dummy)** → Click "Pay Now" → Success modal
8. **Complete** → Cart clears, return to menu

**No actual payment processing, no order tracking, no database persistence.**  
**Pure client-side cart for MVP demonstration.**
