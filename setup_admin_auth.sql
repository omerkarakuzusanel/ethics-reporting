-- Enable Supabase Auth
-- This is already enabled by default in Supabase

-- Create a policy to allow authenticated users to read all reports
CREATE POLICY "Allow authenticated users to read all reports" ON reports
  FOR SELECT TO authenticated
  USING (true);

-- Create a policy to allow authenticated users to update reports
CREATE POLICY "Allow authenticated users to update reports" ON reports
  FOR UPDATE TO authenticated
  USING (true);

-- Create an admin user (run this in the SQL editor)
-- Replace 'admin@example.com' and 'password' with your desired credentials
-- Note: In production, you should use a more secure method to create users
SELECT supabase_auth.create_user(
  'admin@example.com',
  'password',
  'admin@example.com',
  '{"admin": true}'
);

