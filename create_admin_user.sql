CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create admin user with password "Helloworld!"
-- This uses Supabase's auth.users table

-- First, let's create the user with a hashed password
-- The password hash for "Helloworld!" is generated using bcrypt with cost factor 10
-- Hash: $2a$10$VXxBXcQDV8lN4Q8JxCF6zO9BqQZ3qQNQT9WqGnPEZF0ULLq5l5Zra

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@dynetap.com',
  extensions.crypt('Helloworld!', extensions.gen_salt('bf')),
  NOW(),
  NULL,
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING
RETURNING id, email;

-- Create identity for the new user
INSERT INTO auth.identities (
  id,
  user_id,
  provider,
  provider_id,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid() AS id,
  u.id AS user_id,
  'email' AS provider,
  u.id::text AS provider_id,
  jsonb_build_object('sub', u.id::text, 'email', u.email) AS identity_data,
  NOW() AS last_sign_in_at,
  NOW() AS created_at,
  NOW() AS updated_at
FROM auth.users u
WHERE u.email = 'admin@dynetap.com'
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities i 
    WHERE i.user_id = u.id AND i.provider = 'email'
  );
