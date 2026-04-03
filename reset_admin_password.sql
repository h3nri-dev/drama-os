-- ═══════════════════════════════════════════════════════════════════
-- Admin Password Reset
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════
-- Resets password for henry.d@huski.ai
-- New Password: Nekoi@Admin2026!
-- ═══════════════════════════════════════════════════════════════════

UPDATE auth.users
SET
  encrypted_password = crypt('Nekoi@Admin2026!', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'henry.d@huski.ai';

-- Verify the user exists and was updated
SELECT id, email, raw_app_meta_data->>'role' AS role, updated_at
FROM auth.users
WHERE email = 'henry.d@huski.ai';
