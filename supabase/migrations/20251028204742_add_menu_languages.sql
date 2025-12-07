-- CreateTable
CREATE TABLE "public"."menu_language" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "menu_id" uuid NOT NULL,
    "language_code" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT "menu_language_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- Ensures that a specific menu only has one entry for a given language
CREATE UNIQUE INDEX "menu_language_menuId_languageCode_key" ON "public"."menu_language"("menu_id", "language_code");

-- AddForeignKey
ALTER TABLE "public"."menu_language" ADD CONSTRAINT "menu_language_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;