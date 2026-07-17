/*
# Create Teyvat Mentor tables

1. New Tables
   - linnea_images: stores every image uploaded to the Linnea chat
     - id (uuid pk), image_url (text), image_name (text), mode (text), created_at
   - linnea_memories: stores remembered facts about the user per session
     - id (uuid pk), session_id (text), key (text), value (text), updated_at
   - conversations: stores chat history per session per agent
     - id (uuid pk), session_id (text), agent (text), role (text), content (text), image_url (text nullable), created_at
   - user_prefs: stores UI preferences (theme color) per session
     - id (uuid pk), session_id (text), theme (text), updated_at

2. Security
   - RLS enabled on all tables
   - anon + authenticated policies (no sign-in required)
*/

CREATE TABLE IF NOT EXISTS linnea_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  image_name text,
  mode text DEFAULT 'A',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE linnea_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_linnea_images" ON linnea_images;
CREATE POLICY "anon_select_linnea_images" ON linnea_images FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_linnea_images" ON linnea_images;
CREATE POLICY "anon_insert_linnea_images" ON linnea_images FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_linnea_images" ON linnea_images;
CREATE POLICY "anon_update_linnea_images" ON linnea_images FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_linnea_images" ON linnea_images;
CREATE POLICY "anon_delete_linnea_images" ON linnea_images FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS linnea_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  key text NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(session_id, key)
);
ALTER TABLE linnea_memories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_linnea_memories" ON linnea_memories;
CREATE POLICY "anon_select_linnea_memories" ON linnea_memories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_linnea_memories" ON linnea_memories;
CREATE POLICY "anon_insert_linnea_memories" ON linnea_memories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_linnea_memories" ON linnea_memories;
CREATE POLICY "anon_update_linnea_memories" ON linnea_memories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_linnea_memories" ON linnea_memories;
CREATE POLICY "anon_delete_linnea_memories" ON linnea_memories FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  agent text NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_conversations" ON conversations;
CREATE POLICY "anon_select_conversations" ON conversations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_conversations" ON conversations;
CREATE POLICY "anon_insert_conversations" ON conversations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_conversations" ON conversations;
CREATE POLICY "anon_update_conversations" ON conversations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_conversations" ON conversations;
CREATE POLICY "anon_delete_conversations" ON conversations FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS user_prefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  theme text DEFAULT 'amber',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE user_prefs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_user_prefs" ON user_prefs;
CREATE POLICY "anon_select_user_prefs" ON user_prefs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_user_prefs" ON user_prefs;
CREATE POLICY "anon_insert_user_prefs" ON user_prefs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_user_prefs" ON user_prefs;
CREATE POLICY "anon_update_user_prefs" ON user_prefs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_user_prefs" ON user_prefs;
CREATE POLICY "anon_delete_user_prefs" ON user_prefs FOR DELETE TO anon, authenticated USING (true);
