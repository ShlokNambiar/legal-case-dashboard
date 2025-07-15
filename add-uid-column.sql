-- Add UID column to legal_cases table to handle duplicate case numbers
-- Run this in your Supabase SQL Editor

-- Step 1: Add the UID column with UUID type and default value
ALTER TABLE legal_cases ADD COLUMN IF NOT EXISTS uid UUID DEFAULT gen_random_uuid();

-- Step 2: Update existing records to have UIDs (only if they don't already have one)
UPDATE legal_cases SET uid = gen_random_uuid() WHERE uid IS NULL;

-- Step 3: Create an index on UID for faster lookups
CREATE INDEX IF NOT EXISTS idx_legal_cases_uid ON legal_cases(uid);

-- Step 4: Verify the changes
SELECT 
  COUNT(*) as total_records,
  COUNT(uid) as records_with_uid,
  COUNT(*) - COUNT(uid) as records_without_uid
FROM legal_cases;