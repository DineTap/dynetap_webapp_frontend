-- Add the new columns to the public.menus table

ALTER TABLE "public"."menus" 
ADD COLUMN "logo_image_url" TEXT,
ADD COLUMN "background_image_url" TEXT;