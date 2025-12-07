CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Simplified seed file for local MVP
-- No translation tables, direct name/description fields

-- =============================================
-- 1. Create test user in auth schema
-- =============================================
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES (
  '7042152a-7151-49f1-9bfd-3d8f156e7aef',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'test@dynetap.com',
  -- Password: Helloworld! (hashed using crypt function)
  extensions.crypt('Helloworld!', extensions.gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- =============================================
-- 2. Create identity for the test user
-- =============================================
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  '7042152a-7151-49f1-9bfd-3d8f156e7aef',
  '7042152a-7151-49f1-9bfd-3d8f156e7aef',
  '7042152a-7151-49f1-9bfd-3d8f156e7aef',
  '{"sub":"7042152a-7151-49f1-9bfd-3d8f156e7aef","email":"test@dynetap.com"}',
  'email',
  NOW(),
  NOW(),
  NOW()
);

-- =============================================
-- 3. Create test menu (restaurant)
-- =============================================
INSERT INTO "public"."menus" (
  "id",
  "user_id",
  "name",
  "slug",
  "address",
  "city",
  "contact_number",
  "is_published",
  "created_at",
  "updated_at"
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '7042152a-7151-49f1-9bfd-3d8f156e7aef',
  'Test Restaurant',
  'test-restaurant',
  '123 Main Street',
  'Test City',
  '+1234567890',
  true,
  NOW(),
  NOW()
);

-- =============================================
-- 4. Create categories with direct names
-- =============================================
INSERT INTO "public"."categories" (
  "id",
  "menu_id",
  "name",
  "sort_order",
  "created_at"
)
VALUES
  ('223e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'Appetizers', 0, NOW()),
  ('223e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174000', 'Drinks', 1, NOW()),
  ('223e4567-e89b-12d3-a456-426614174003', '123e4567-e89b-12d3-a456-426614174000', 'Main Courses', 2, NOW()),
  ('223e4567-e89b-12d3-a456-426614174004', '123e4567-e89b-12d3-a456-426614174000', 'Desserts', 3, NOW());

-- =============================================
-- 5. Create dishes with direct names and descriptions
-- =============================================
INSERT INTO "public"."dishes" (
  "id",
  "menu_id",
  "category_id",
  "name",
  "description",
  "price",
  "picture_url",
  "created_at"
)
VALUES
  -- Appetizers
  (
    '323e4567-e89b-12d3-a456-426614174001',
    '123e4567-e89b-12d3-a456-426614174000',
    '223e4567-e89b-12d3-a456-426614174001',
    'Bruschetta',
    'Toasted bread with fresh tomatoes, basil, and olive oil',
    850,
    NULL,
    NOW()
  ),
  (
    '323e4567-e89b-12d3-a456-426614174002',
    '123e4567-e89b-12d3-a456-426614174000',
    '223e4567-e89b-12d3-a456-426614174001',
    'Caesar Salad',
    'Crisp romaine lettuce with parmesan cheese and croutons',
    950,
    NULL,
    NOW()
  ),
  -- Drinks
  (
    '323e4567-e89b-12d3-a456-426614174003',
    '123e4567-e89b-12d3-a456-426614174000',
    '223e4567-e89b-12d3-a456-426614174002',
    'Lemonade',
    'Fresh squeezed lemonade',
    350,
    NULL,
    NOW()
  ),
  (
    '323e4567-e89b-12d3-a456-426614174004',
    '123e4567-e89b-12d3-a456-426614174000',
    '223e4567-e89b-12d3-a456-426614174002',
    'Iced Tea',
    'Freshly brewed iced tea',
    300,
    NULL,
    NOW()
  ),
  -- Main Courses
  (
    '323e4567-e89b-12d3-a456-426614174005',
    '123e4567-e89b-12d3-a456-426614174000',
    '223e4567-e89b-12d3-a456-426614174003',
    'Margherita Pizza',
    'Classic pizza with tomato sauce, mozzarella, and basil',
    1450,
    NULL,
    NOW()
  ),
  (
    '323e4567-e89b-12d3-a456-426614174006',
    '123e4567-e89b-12d3-a456-426614174000',
    '223e4567-e89b-12d3-a456-426614174003',
    'Grilled Salmon',
    'Fresh salmon fillet with seasonal vegetables',
    2200,
    NULL,
    NOW()
  ),
  (
    '323e4567-e89b-12d3-a456-426614174007',
    '123e4567-e89b-12d3-a456-426614174000',
    '223e4567-e89b-12d3-a456-426614174003',
    'Chicken Parmesan',
    'Breaded chicken breast with marinara sauce and melted cheese',
    1850,
    NULL,
    NOW()
  ),
  -- Desserts
  (
    '323e4567-e89b-12d3-a456-426614174008',
    '123e4567-e89b-12d3-a456-426614174000',
    '223e4567-e89b-12d3-a456-426614174004',
    'Tiramisu',
    'Classic Italian dessert with coffee-soaked ladyfingers',
    750,
    NULL,
    NOW()
  ),
  (
    '323e4567-e89b-12d3-a456-426614174009',
    '123e4567-e89b-12d3-a456-426614174000',
    '223e4567-e89b-12d3-a456-426614174004',
    'Chocolate Lava Cake',
    'Warm chocolate cake with a molten center',
    850,
    NULL,
    NOW()
  );

-- =============================================
-- 6. Create storage bucket for menu images
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('menus', 'menus', true);

-- Set storage policy for menus bucket
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'menus');

CREATE POLICY "Allow authenticated users to upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'menus' AND auth.role() = 'authenticated');
