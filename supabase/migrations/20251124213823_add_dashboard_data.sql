-- Create orders table
CREATE TABLE "public"."orders" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "menu_id" uuid NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "total_price" integer NOT NULL,
  "notes" text,
  "table_number" text,
  "guest_count" integer,
  "discount_applied" integer DEFAULT 0,
  "order_number" text UNIQUE,
  "customer_email" text NOT NULL,
  "customer_phone" text NOT NULL,
  "payment_status" text NOT NULL DEFAULT 'unpaid',
  "yoco_charge_id" text UNIQUE,
  "yoco_transaction_id" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "orders_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE CASCADE
);

-- Create indexes for orders table
CREATE INDEX "orders_menu_id_idx" ON "public"."orders"("menu_id");
CREATE INDEX "orders_status_idx" ON "public"."orders"("status");
CREATE INDEX "orders_payment_status_idx" ON "public"."orders"("payment_status");
CREATE INDEX "orders_created_at_idx" ON "public"."orders"("created_at" DESC);

-- Create order_items table
CREATE TABLE "public"."order_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "order_id" uuid NOT NULL,
  "dish_id" uuid NOT NULL,
  "quantity" integer NOT NULL,
  "price_at_time" integer NOT NULL,
  "dish_name" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE,
  CONSTRAINT "order_items_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE RESTRICT
);

-- Create indexes for order_items table
CREATE UNIQUE INDEX "unique_order_item" ON "public"."order_items"("order_id", "dish_id");
CREATE INDEX "order_items_order_id_idx" ON "public"."order_items"("order_id");
CREATE INDEX "order_items_dish_id_idx" ON "public"."order_items"("dish_id");

-- Add updated_at column to dishes table if not exists
ALTER TABLE "public"."dishes" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone NOT NULL DEFAULT now();