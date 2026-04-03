-- ═══════════════════════════════════════════════════════════════════
-- Admin User Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════
-- Sets up henry.d@huski.ai as an admin user.
-- Password: Nekoi@Admin2026!
-- ═══════════════════════════════════════════════════════════════════

-- Step 1: Create the user in Supabase Auth (if they don't already exist)
-- NOTE: If the user already exists, skip to Step 2.
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Only insert if user doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'henry.d@huski.ai') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
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
      'henry.d@huski.ai',
      crypt('Nekoi@Admin2026!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"],"role":"admin"}',
      '{"name":"Henry D","role":"admin"}',
      false,
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
    RAISE NOTICE 'User henry.d@huski.ai created successfully.';
  ELSE
    RAISE NOTICE 'User henry.d@huski.ai already exists. Updating to admin...';
  END IF;
END $$;

-- Step 2: Ensure admin role is set in app_metadata (works whether user is new or existing)
UPDATE auth.users
SET
  raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb,
  raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'::jsonb,
  updated_at = NOW()
WHERE email = 'henry.d@huski.ai';

-- Verify
SELECT id, email, raw_app_meta_data->>'role' AS role, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'henry.d@huski.ai';
