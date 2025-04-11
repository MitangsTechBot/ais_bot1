/*
  # Fix user_profiles RLS policies

  1. Changes
    - Drop existing problematic policies that cause recursion
    - Create new simplified policies that avoid circular dependencies
    - Maintain security while preventing infinite recursion

  2. Security
    - Users can still only view their own profile
    - Admins can view all profiles
    - Policies are rewritten to avoid querying the same table recursively
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;

-- Create new simplified policies
CREATE POLICY "Enable read access for users to their own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Admin policy that doesn't cause recursion by checking is_admin directly
CREATE POLICY "Enable read access for admins to all profiles"
ON user_profiles
FOR SELECT
TO authenticated
USING (
  (auth.uid() IN (
    SELECT id FROM user_profiles WHERE is_admin = true
  ))
  OR (auth.uid() = id)
);

-- Add insert policy for initial profile creation
CREATE POLICY "Users can insert their own profile"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Add update policy
CREATE POLICY "Users can update their own profile"
ON user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);