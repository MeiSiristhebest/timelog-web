-- Supabase SQL Script for Role Management
-- Run this in your Supabase SQL Editor to manage user roles

-- View all users and their roles
SELECT
  p.id,
  p.email,
  p.display_name,
  p.role,
  p.created_at,
  fm.status as family_status
FROM profiles p
LEFT JOIN family_members fm ON p.id = fm.user_id
ORDER BY p.created_at DESC;

-- Make a user an administrator
-- Replace 'user-id-here' with the actual user ID
UPDATE profiles
SET role = 'family_owner'
WHERE id = 'user-id-here';

-- Make a user a regular member
-- Replace 'user-id-here' with the actual user ID
UPDATE profiles
SET role = 'family_member'
WHERE id = 'user-id-here';

-- Remove admin privileges from all users (reset to members)
UPDATE profiles
SET role = 'family_member'
WHERE role = 'family_owner';

-- Find the first registered user (automatically becomes admin)
SELECT id, email, display_name, created_at
FROM profiles
ORDER BY created_at ASC
LIMIT 1;

-- Check current role distribution
SELECT role, COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY count DESC;

-- Grant admin to specific email
UPDATE profiles
SET role = 'family_owner'
WHERE email = 'admin@example.com';