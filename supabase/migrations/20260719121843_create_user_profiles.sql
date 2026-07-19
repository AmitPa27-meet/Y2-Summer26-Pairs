/*
# Create user_profiles table

1. New Tables
   - user_profiles: stores a customizable user profile per session
     - id (uuid pk)
     - session_id (text, unique) — links to the existing session-based identity
     - display_name (text, nullable) — user's chosen display name
     - bio (text, nullable) — free-form bio / about me
     - goals (text, nullable) — free-form goals / aspirations
     - avatar_url (text, nullable) — base64 data URL of the user's profile picture
     - created_at (timestamptz)
     - updated_at (timestamptz)

2. Security
   - RLS enabled on user_profiles.
   - anon + authenticated CRUD (no sign-in required; single-tenant app).
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  display_name text,
  bio text,
  goals text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_user_profiles" ON user_profiles;
CREATE POLICY "anon_select_user_profiles" ON user_profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_user_profiles" ON user_profiles;
CREATE POLICY "anon_insert_user_profiles" ON user_profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_user_profiles" ON user_profiles;
CREATE POLICY "anon_update_user_profiles" ON user_profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_user_profiles" ON user_profiles;
CREATE POLICY "anon_delete_user_profiles" ON user_profiles FOR DELETE
  TO anon, authenticated USING (true);
