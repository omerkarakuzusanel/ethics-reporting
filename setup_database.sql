-- Create the reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  identity_option TEXT NOT NULL,
  connection_option TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  access_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create the report_updates table to track all updates
CREATE TABLE report_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  previous_status TEXT,
  new_status TEXT,
  previous_notes TEXT,
  new_notes TEXT,
  update_type TEXT NOT NULL -- 'status_change', 'notes_update', etc.
);

-- Set up Row Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_updates ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to insert a report
CREATE POLICY "Allow anonymous insert" ON reports
FOR INSERT TO anon
WITH CHECK (true);

-- Create a policy to allow users to read their own reports using access_code
CREATE POLICY "Allow users to read their own reports" ON reports
FOR SELECT TO anon
USING (true);

-- Create a policy to allow authenticated users to read all reports
CREATE POLICY "Allow authenticated users to read all reports" ON reports
FOR SELECT TO authenticated
USING (true);

-- Create a policy to allow authenticated users to update reports
CREATE POLICY "Allow authenticated users to update reports" ON reports
FOR UPDATE TO authenticated
USING (true);

-- Create a policy to allow authenticated users to read report updates
CREATE POLICY "Allow authenticated users to read report updates" ON report_updates
FOR SELECT TO authenticated
USING (true);

-- Create a policy to allow authenticated users to insert report updates
CREATE POLICY "Allow authenticated users to insert report updates" ON report_updates
FOR INSERT TO authenticated
WITH CHECK (true);

-- Create a function to automatically update the updated_at and updated_by fields
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at field
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION update_reports_updated_at();

