-- Migration: Simplify schema by removing translation tables
-- This migration consolidates translation data into main tables

-- Step 1: Add name and description columns to dishes table
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS description TEXT;

-- Step 2: Add name and sort_order columns to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Step 3: Migrate dish data (take first available translation)
UPDATE public.dishes d
SET 
  name = COALESCE(
    (SELECT dt.name FROM public.dishes_translation dt WHERE dt.dish_id = d.id LIMIT 1),
    'Unnamed Dish'
  ),
  description = COALESCE(
    (SELECT dt.description FROM public.dishes_translation dt WHERE dt.dish_id = d.id LIMIT 1),
    ''
  )
WHERE d.name IS NULL;

-- Step 4: Migrate category data (take first available translation)
UPDATE public.categories c
SET 
  name = COALESCE(
    (SELECT ct.name FROM public.categories_translation ct WHERE ct.category_id = c.id LIMIT 1),
    'Unnamed Category'
  )
WHERE c.name IS NULL;

-- Step 5: Make name columns NOT NULL after data migration
ALTER TABLE public.dishes ALTER COLUMN name SET NOT NULL;
ALTER TABLE public.categories ALTER COLUMN name SET NOT NULL;

-- Step 6: Drop translation tables and related tables
DROP TABLE IF EXISTS public.variant_translations CASCADE;
DROP TABLE IF EXISTS public.dish_variants CASCADE;
DROP TABLE IF EXISTS public.dishes_tag CASCADE;
DROP TABLE IF EXISTS public.dishes_translation CASCADE;
DROP TABLE IF EXISTS public.categories_translation CASCADE;
DROP TABLE IF EXISTS public.menu_languages CASCADE;
DROP TABLE IF EXISTS public.languages CASCADE;

-- Step 7: Remove unused columns from menus table
ALTER TABLE public.menus DROP COLUMN IF EXISTS background_image_url;
ALTER TABLE public.menus DROP COLUMN IF EXISTS logo_image_url;
ALTER TABLE public.menus DROP COLUMN IF EXISTS facebook_url;
ALTER TABLE public.menus DROP COLUMN IF EXISTS google_review_url;
ALTER TABLE public.menus DROP COLUMN IF EXISTS instagram_url;

-- Step 8: Remove unused columns from dishes table
ALTER TABLE public.dishes DROP COLUMN IF EXISTS carbohydrates;
ALTER TABLE public.dishes DROP COLUMN IF EXISTS fats;
ALTER TABLE public.dishes DROP COLUMN IF EXISTS protein;
ALTER TABLE public.dishes DROP COLUMN IF EXISTS weight;
ALTER TABLE public.dishes DROP COLUMN IF EXISTS calories;

-- Step 9: Update foreign key constraint for dishes.category_id to SET NULL on delete
ALTER TABLE public.dishes DROP CONSTRAINT IF EXISTS dishes_category_id_fkey;
ALTER TABLE public.dishes ADD CONSTRAINT dishes_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id) 
  ON DELETE SET NULL ON UPDATE NO ACTION;

-- Step 10: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dishes_menu_id ON public.dishes(menu_id);
CREATE INDEX IF NOT EXISTS idx_dishes_category_id ON public.dishes(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_menu_id ON public.categories(menu_id);
