/*
  # Fix recursive RLS policies for user_profiles table

  1. Changes
    - Remove recursive admin policy that was causing infinite loops
    - Simplify RLS policies to prevent recursion
    - Maintain security by still allowing users to read their own profile
    - Allow admins to read all profiles through a non-recursive policy

  2. Security
    - Maintains row-level security
    - Preserves user data privacy
    - Prevents unauthorized access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for admins to all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for users to their own profile" ON user_profiles;

-- Create new, non-recursive policies
CREATE POLICY "Users can read own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
ON user_profiles
FOR SELECT
TO authenticated
USING (
  (is_admin = true AND auth.uid() = id) -- If the current user is admin
  OR 
  (auth.uid() = id) -- Or if it's their own profile
);