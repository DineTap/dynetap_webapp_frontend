-- Create a test restaurant/menu for the admin user
-- First, get the admin user ID
DO $$
DECLARE
  v_user_id uuid;
  v_menu_id uuid;
  v_category_kebab_id uuid;
  v_category_drinks_id uuid;
  v_dish1_id uuid;
  v_dish2_id uuid;
  v_language_english_id uuid;
  v_language_polish_id uuid;
BEGIN
  -- Get admin user ID
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@dynetap.com';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found';
  END IF;
  
  -- Get language IDs
  SELECT id INTO v_language_english_id FROM public.languages WHERE iso_code = 'GB' LIMIT 1;
  SELECT id INTO v_language_polish_id FROM public.languages WHERE iso_code = 'PL' LIMIT 1;
  
  RAISE NOTICE 'Admin User ID: %', v_user_id;
  RAISE NOTICE 'English Language ID: %', v_language_english_id;
  RAISE NOTICE 'Polish Language ID: %', v_language_polish_id;
  
  -- Generate UUID for the menu
  v_menu_id := gen_random_uuid();
  
  -- Create test menu/restaurant
  INSERT INTO public.menus (
    id,
    name,
    user_id,
    slug,
    city,
    address,
    contact_number,
    is_published,
    created_at,
    updated_at
  ) VALUES (
    v_menu_id,
    'Test Restaurant',
    v_user_id,
    'test-restaurant-admin-' || floor(random() * 1000)::text,
    'New York',
    '123 Main Street',
    '+1-555-0123',
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Created menu with ID: %', v_menu_id;
  
  -- Add default language (English) to menu
  IF v_language_english_id IS NOT NULL THEN
    INSERT INTO public.menu_languages (
      menu_id,
      language_id,
      is_default
    ) VALUES (
      v_menu_id,
      v_language_english_id,
      true
    )
    ON CONFLICT DO NOTHING;
    RAISE NOTICE 'Added English as default language';
  END IF;
  
  -- Create categories
  v_category_kebab_id := gen_random_uuid();
  INSERT INTO public.categories (
    id,
    menu_id,
    created_at
  ) VALUES (
    v_category_kebab_id,
    v_menu_id,
    NOW()
  );
  
  v_category_drinks_id := gen_random_uuid();
  INSERT INTO public.categories (
    id,
    menu_id,
    created_at
  ) VALUES (
    v_category_drinks_id,
    v_menu_id,
    NOW()
  );
  
  RAISE NOTICE 'Created categories: Kebab (%) and Drinks (%)', v_category_kebab_id, v_category_drinks_id;
  
  -- Add category translations
  IF v_language_english_id IS NOT NULL THEN
    INSERT INTO public.categories_translation (category_id, name, language_id)
    VALUES 
      (v_category_kebab_id, 'Kebabs', v_language_english_id),
      (v_category_drinks_id, 'Beverages', v_language_english_id);
  END IF;
  
  IF v_language_polish_id IS NOT NULL THEN
    INSERT INTO public.categories_translation (category_id, name, language_id)
    VALUES 
      (v_category_kebab_id, 'Kebab', v_language_polish_id),
      (v_category_drinks_id, 'Napoje', v_language_polish_id);
  END IF;
  
  -- Create dishes
  v_dish1_id := gen_random_uuid();
  INSERT INTO public.dishes (
    id,
    price,
    created_at,
    menu_id,
    category_id,
    calories,
    protein,
    fats,
    carbohydrates
  ) VALUES (
    v_dish1_id,
    1299, -- $12.99
    NOW(),
    v_menu_id,
    v_category_kebab_id,
    650,
    35,
    28,
    45
  );
  
  v_dish2_id := gen_random_uuid();
  INSERT INTO public.dishes (
    id,
    price,
    created_at,
    menu_id,
    category_id
  ) VALUES (
    v_dish2_id,
    299, -- $2.99
    NOW(),
    v_menu_id,
    v_category_drinks_id
  );
  
  RAISE NOTICE 'Created dishes: Kebab (%) and Drink (%)', v_dish1_id, v_dish2_id;
  
  -- Add dish translations
  IF v_language_english_id IS NOT NULL THEN
    INSERT INTO public.dishes_translation (dish_id, language_id, name, description)
    VALUES 
      (v_dish1_id, v_language_english_id, 'Chicken Kebab Wrap', 'Grilled chicken with fresh vegetables and special sauce in a warm pita'),
      (v_dish2_id, v_language_english_id, 'Coca Cola', 'Classic Coca Cola - 330ml can');
  END IF;
  
  IF v_language_polish_id IS NOT NULL THEN
    INSERT INTO public.dishes_translation (dish_id, language_id, name, description)
    VALUES 
      (v_dish1_id, v_language_polish_id, 'Kebab z Kurczakiem', 'Grillowany kurczak ze świeżymi warzywami i specjalnym sosem w ciepłej picie'),
      (v_dish2_id, v_language_polish_id, 'Coca Cola', 'Klasyczna Coca Cola - puszka 330ml');
  END IF;
  
  RAISE NOTICE 'Test restaurant created successfully!';
  RAISE NOTICE 'Menu ID: %', v_menu_id;
  RAISE NOTICE 'You can view it in your dashboard';
  
END $$;

-- Show the created menu
SELECT 
  m.id,
  m.name,
  m.slug,
  m.city,
  m.address,
  m.contact_number,
  m.is_published,
  u.email as owner_email
FROM public.menus m
JOIN auth.users u ON m.user_id = u.id
WHERE u.email = 'admin@dynetap.com';
