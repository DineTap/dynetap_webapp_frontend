-- Add yocoCheckoutId to Orders table for Yoco Checkout API integration
-- This field stores the checkout session ID returned by the Yoco API
-- Reference: https://developer.yoco.com/docs/checkout-api

ALTER TABLE "public"."orders" 
ADD COLUMN "yoco_checkout_id" text UNIQUE;

CREATE INDEX "idx_orders_yoco_checkout_id" ON "public"."orders" ("yoco_checkout_id");
