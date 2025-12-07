# MVP Simplification Plan for DyneTap

## Goal
Create a simple, functional QR code menu app with only essential features:
- Restaurant owners can sign up and create menus
- Add categories and dishes with prices
- Generate QR codes for customers to scan
- Customers view digital menu without authentication

## Stage 1: Remove Non-Essential Features
**Status**: Not Started

### Features to Remove:
1. ❌ Payment integration (LemonSqueezy)
2. ❌ Subscription system
3. ❌ Analytics (Umami)
4. ❌ Multi-language support (keep English only)
5. ❌ Social media integrations
6. ❌ OAuth providers (keep email/password only)
7. ❌ Advanced menu customization (themes, colors)
8. ❌ Email notifications
9. ❌ PDF export/print templates (keep simple view)
10. ❌ Billing page

### Files to Modify/Remove:
- [ ] Remove `src/app/(authenticatedRoutes)/billing`
- [ ] Remove `src/pageComponents/Billing`
- [ ] Remove `src/utils/payments.ts`
- [ ] Remove `src/app/payments-api`
- [ ] Remove analytics provider
- [ ] Simplify `src/env.mjs` (remove payment vars)
- [ ] Remove Polish translations (keep English only)

## Stage 2: Simplify Database Schema
**Status**: Not Started

### Tables to Keep:
- ✅ users (id, email, password)
- ✅ menus (id, userId, name, slug, address, city, contactNumber, isPublished)
- ✅ categories (id, menuId, name, sortOrder)
- ✅ dishes (id, categoryId, name, description, price, imageUrl)

### Tables to Remove:
- ❌ subscriptions
- ❌ menuLanguages
- ❌ languages
- ❌ dishesTranslation
- ❌ categoriesTranslation
- ❌ dishesTag
- ❌ dishVariants
- ❌ variantTranslations

### Actions:
- [ ] Create new simplified migration
- [ ] Update Prisma schema
- [ ] Generate Prisma client

## Stage 3: Simplify tRPC API
**Status**: Not Started

### Routers to Keep (Simplified):
- ✅ menus.upsertMenu (create/update restaurant)
- ✅ menus.getMenus (list user's menus)
- ✅ menus.getMenuBySlug (public menu view)
- ✅ menus.deleteMenu
- ✅ menus.publishMenu / unpublishMenu
- ✅ categories.addCategory
- ✅ categories.updateCategory
- ✅ categories.deleteCategory
- ✅ dishes.addDish
- ✅ dishes.updateDish
- ✅ dishes.deleteDish

### Endpoints to Remove:
- ❌ updateMenuSocials
- ❌ updateMenuBackgroundImg / updateMenuLogoImg
- ❌ All translation-related endpoints
- ❌ Dish variants endpoints
- ❌ Tags endpoints
- ❌ Subscription check endpoints

### Actions:
- [ ] Simplify `src/server/api/routers/menus.ts`
- [ ] Remove `src/server/api/routers/dishes.ts` complexity
- [ ] Remove subscription checks from procedures

## Stage 4: Simplify UI Components
**Status**: Not Started

### Pages to Keep (Simplified):
- ✅ Landing page (simple hero + CTA)
- ✅ Login/Register
- ✅ Dashboard (list menus)
- ✅ Create/Edit Menu (name, address, city, phone)
- ✅ Manage Menu (categories + dishes CRUD)
- ✅ Public Menu View (customer-facing)
- ✅ QR Code display

### Pages to Remove:
- ❌ Billing
- ❌ Analytics
- ❌ Settings (social media)
- ❌ Print templates
- ❌ Advanced customization

### Components to Simplify:
- [ ] MenuForm (remove image uploads, keep text only)
- [ ] DishForm (name, description, price, category)
- [ ] CategoryForm (name, sortOrder)
- [ ] Remove language selector
- [ ] Remove color/theme customization

## Stage 5: Simplify Auth
**Status**: Not Started

### Keep:
- ✅ Email/password authentication
- ✅ Password reset

### Remove:
- ❌ OAuth providers (Google, GitHub, etc.)
- ❌ Magic link
- ❌ Email verification

## Stage 6: Environment & Configuration
**Status**: Not Started

### Simplify:
- [ ] Remove payment env vars from `src/env.mjs`
- [ ] Remove analytics vars
- [ ] Keep only: DATABASE_URL, SUPABASE keys, NEXTAUTH_SECRET
- [ ] Update `.env.example`

## Stage 7: Testing
**Status**: Not Started

### Test Scenarios:
1. [ ] User can register with email/password
2. [ ] User can log in
3. [ ] User can create a restaurant/menu
4. [ ] User can add categories
5. [ ] User can add dishes with prices
6. [ ] User can publish menu
7. [ ] Public menu is viewable without auth
8. [ ] QR code is generated and works
9. [ ] User can edit/delete dishes and categories
10. [ ] User can delete menu

## Success Criteria
- [ ] Application runs without errors
- [ ] All core functionality works
- [ ] Code is 50%+ smaller and simpler
- [ ] No payment/subscription code remains
- [ ] Only English language
- [ ] Simple, clean UI
- [ ] Fast page loads

## MVP Feature Set Summary

### Restaurant Owner Features:
1. Sign up / Login
2. Create restaurant (name, address, city, phone)
3. Create categories
4. Add dishes (name, description, price)
5. Edit/delete dishes and categories
6. Publish/unpublish menu
7. View QR code for menu

### Customer Features:
1. Scan QR code
2. View menu (categories + dishes)
3. See prices
4. See restaurant contact info

---

**Next Step**: Start with Stage 1 - Remove non-essential features
