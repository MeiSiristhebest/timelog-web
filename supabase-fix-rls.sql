-- Supabase RLS Policy Check and Fix for Profiles Table
-- Run this in your Supabase SQL Editor

-- 1. Check current RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- 2. Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 3. Enable RLS if not enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for authenticated users to read/write their own profile
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to view profiles by user_id (for family connections)
CREATE POLICY "Users can view profiles by user_id" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Special policy for admins to view all profiles (optional)
-- Uncomment if you want admins to see all profiles
-- CREATE POLICY "Admins can view all profiles" ON profiles
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE id = auth.uid() AND role = 'family_owner'
--     )
--   );

-- 6. Verify policies were created
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';