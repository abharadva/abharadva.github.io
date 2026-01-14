-- db/schema.sql

-- 1. Helper Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Site Identity
CREATE TABLE IF NOT EXISTS site_identity (
  id INT PRIMARY KEY DEFAULT 1,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Nullable for initial seed
  profile_data JSONB,
  social_links JSONB,
  footer_data JSONB,
  portfolio_mode TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT single_row_enforcement CHECK (id = 1)
);
ALTER TABLE site_identity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site identity" ON site_identity FOR SELECT USING (true);
CREATE POLICY "Admin manage site identity" ON site_identity FOR ALL USING (auth.role() = 'authenticated');

-- 3. Navigation
CREATE TABLE IF NOT EXISTS navigation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  display_order INT4 DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE navigation_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read navigation" ON navigation_links FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin manage navigation" ON navigation_links FOR ALL USING (auth.role() = 'authenticated');

-- 4. Content Tables (Blog, Portfolio)
CREATE TABLE IF NOT EXISTS portfolio_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('markdown', 'list_items', 'gallery')),
  content TEXT,
  display_order INT4 DEFAULT 0,
  page_path TEXT NOT NULL DEFAULT '/',
  layout_style TEXT NOT NULL DEFAULT 'default',
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE portfolio_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read sections" ON portfolio_sections FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin manage sections" ON portfolio_sections FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES portfolio_sections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  date_from TEXT,
  date_to TEXT,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  tags TEXT[],
  internal_notes TEXT,
  display_order INT4 DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read items" ON portfolio_items FOR SELECT USING (true);
CREATE POLICY "Admin manage items" ON portfolio_items FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  show_toc BOOLEAN DEFAULT true,
  tags TEXT[],
  views BIGINT DEFAULT 0,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read posts" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admin manage posts" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');

-- 5. Admin Tools (Tasks, Notes, Finance, etc.)
CREATE TYPE task_status AS ENUM ('todo', 'inprogress', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status task_status DEFAULT 'todo',
  due_date DATE,
  priority task_priority DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage tasks" ON tasks FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS sub_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE sub_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage subtasks" ON sub_tasks FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  color TEXT,
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage notes" ON notes FOR ALL USING (auth.role() = 'authenticated');

-- Finance
CREATE TYPE transaction_type AS ENUM ('earning', 'expense');
CREATE TYPE transaction_frequency AS ENUM ('daily', 'weekly', 'bi-weekly', 'monthly', 'yearly');

CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  type transaction_type NOT NULL,
  category TEXT,
  frequency transaction_frequency NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  occurrence_day INT,
  last_processed_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage recurring" ON recurring_transactions FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  type transaction_type NOT NULL,
  category TEXT,
  recurring_transaction_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage transactions" ON transactions FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage goals" ON financial_goals FOR ALL USING (auth.role() = 'authenticated');

-- Storage Assets
CREATE TABLE IF NOT EXISTS storage_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  mime_type TEXT,
  size_kb NUMERIC,
  alt_text TEXT,
  used_in JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE storage_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage assets" ON storage_assets FOR ALL USING (auth.role() = 'authenticated');

-- Learning
CREATE TYPE learning_status AS ENUM ('To Learn', 'Learning', 'Practicing', 'Mastered');
CREATE TABLE IF NOT EXISTS learning_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE learning_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage subjects" ON learning_subjects FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS learning_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES learning_subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status learning_status DEFAULT 'To Learn',
  core_notes TEXT,
  resources JSONB,
  confidence_score INT2 CHECK (confidence_score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE learning_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage topics" ON learning_topics FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES learning_topics(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INT,
  journal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage sessions" ON learning_sessions FOR ALL USING (auth.role() = 'authenticated');

-- Habits
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  color TEXT DEFAULT '#0ea5e9',
  target_per_week INT DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage habits" ON habits FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(habit_id, completed_date)
);
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage habit logs" ON habit_logs FOR ALL USING (auth.role() = 'authenticated');

-- Inventory
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  serial_number TEXT,
  purchase_date DATE,
  warranty_expiry DATE,
  purchase_price NUMERIC(10, 2),
  current_value NUMERIC(10, 2),
  image_url TEXT,
  notes TEXT,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage inventory" ON inventory_items FOR ALL USING (auth.role() = 'authenticated');

-- Focus Logs
CREATE TABLE IF NOT EXISTS focus_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL,
  completed BOOLEAN DEFAULT false,
  mode TEXT CHECK (mode IN ('work', 'break')) DEFAULT 'work',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE focus_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage focus" ON focus_logs FOR ALL USING (auth.role() = 'authenticated');

-- Security Settings
CREATE TABLE IF NOT EXISTS security_settings (
  id INT PRIMARY KEY DEFAULT 1,
  lockdown_level INT DEFAULT 0 CHECK (lockdown_level BETWEEN 0 AND 3),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT single_row_check CHECK (id = 1)
);
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read security" ON security_settings FOR SELECT USING (true);
CREATE POLICY "Admin manage security" ON security_settings FOR ALL USING (auth.role() = 'authenticated');
INSERT INTO security_settings (id, lockdown_level) VALUES (1, 0) ON CONFLICT DO NOTHING;

-- RPC: View Counter
CREATE OR REPLACE FUNCTION increment_blog_post_view (post_id_to_increment UUID)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE blog_posts
  SET views = views + 1
  WHERE id = post_id_to_increment;
END;
$$;

-- RPC: Update Section Order
CREATE OR REPLACE FUNCTION update_section_order(section_ids UUID[]) RETURNS void AS $$ BEGIN FOR i IN 1..array_length(section_ids, 1) LOOP UPDATE portfolio_sections SET display_order = i WHERE id = section_ids[i]; END LOOP; END; $$ LANGUAGE plpgsql;

-- RPC: Total Blog Views
CREATE OR REPLACE FUNCTION get_total_blog_views() RETURNS BIGINT AS $$ DECLARE total_views BIGINT; BEGIN SELECT SUM(views) INTO total_views FROM blog_posts WHERE published = true; RETURN COALESCE(total_views, 0); END; $$ LANGUAGE plpgsql;

-- RPC: Analytics
CREATE OR REPLACE FUNCTION get_analytics_overview()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  analytics_data JSONB;
BEGIN
  WITH
  task_stats AS (
    SELECT status, count(*) AS count FROM tasks GROUP BY status
  ),
  tasks_completed_weekly AS (
    SELECT
      date_trunc('week', updated_at)::date AS week_start,
      count(*) AS completed_count
    FROM tasks
    WHERE status = 'done' AND updated_at > now() - interval '8 weeks'
    GROUP BY week_start
    ORDER BY week_start
  ),
  productivity_heatmap AS (
     SELECT (updated_at AT TIME ZONE 'UTC')::date AS day, count(*)::INT AS count
    FROM tasks WHERE status = 'done' GROUP BY day
  ),
  blog_stats AS (
    SELECT id, title, slug, views FROM blog_posts WHERE published = true ORDER BY views DESC LIMIT 5
  ),
  learning_stats AS (
    SELECT ls.name as subject_name, SUM(lse.duration_minutes)::INT AS total_minutes
    FROM learning_sessions lse
    JOIN learning_topics lt ON lse.topic_id = lt.id
    JOIN learning_subjects ls ON lt.subject_id = ls.id
    GROUP BY ls.name
  )
  SELECT jsonb_build_object(
    'task_status_distribution', (SELECT jsonb_agg(jsonb_build_object('name', status, 'value', count)) FROM task_stats),
    'tasks_completed_weekly', (SELECT jsonb_agg(jsonb_build_object('week', to_char(week_start, 'Mon DD'), 'completed', completed_count)) FROM tasks_completed_weekly),
    'productivity_heatmap', (SELECT jsonb_agg(jsonb_build_object('date', day, 'count', count)) FROM productivity_heatmap),
    'top_blog_posts', (SELECT jsonb_agg(jsonb_build_object('id', id, 'title', title, 'slug', slug, 'views', views)) FROM blog_stats),
    'learning_time_by_subject', (SELECT jsonb_agg(jsonb_build_object('name', subject_name, 'value', total_minutes)) FROM learning_stats)
  ) INTO analytics_data;

  RETURN analytics_data;
END;
$$;

-- 1. Create the missing Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  is_all_day BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 3. Create Policy (Admin only)
DROP POLICY IF EXISTS "Admin can manage events" ON events;
CREATE POLICY "Admin can manage events" ON events 
  FOR ALL USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- 4. Add Trigger for updated_at
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RPC: Calendar Data (Aggregated)
CREATE OR REPLACE FUNCTION get_calendar_data(start_date_param date, end_date_param date)
RETURNS TABLE(item_id UUID, title TEXT, start_time TIMESTAMPTZ, end_time TIMESTAMPTZ, item_type TEXT, data JSONB) AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.title, e.start_time, e.end_time, 'event' AS item_type, jsonb_build_object('description', e.description, 'is_all_day', e.is_all_day) FROM events e WHERE e.start_time :: date BETWEEN start_date_param AND end_date_param
  UNION ALL
  SELECT t.id, t.title, (t.due_date + interval '9 hour'):: timestamptz, NULL :: timestamptz, 'task' AS item_type, jsonb_build_object('status', t.status, 'priority', t.priority) FROM tasks t WHERE t.due_date BETWEEN start_date_param AND end_date_param
  UNION ALL
  SELECT (SELECT gen_random_uuid()), 'Habits Completed', (hl.completed_date + interval '7 hour')::timestamptz, NULL::timestamptz, 'habit_summary' AS item_type,
    jsonb_build_object('count', COUNT(*), 'completed_habits', jsonb_agg(jsonb_build_object('title', h.title, 'color', h.color)))
  FROM habit_logs hl JOIN habits h ON hl.habit_id = h.id WHERE hl.completed_date BETWEEN start_date_param AND end_date_param GROUP BY hl.completed_date
  UNION ALL
  SELECT (SELECT gen_random_uuid()), 'Daily Finance', (tr.date + interval '12 hour')::timestamptz, NULL::timestamptz, 'transaction_summary' AS item_type,
    jsonb_build_object('count', COUNT(*), 'total_earning', COALESCE(SUM(CASE WHEN tr.type = 'earning' THEN tr.amount ELSE 0 END), 0), 'total_expense', COALESCE(SUM(CASE WHEN tr.type = 'expense' THEN tr.amount ELSE 0 END), 0), 'transactions', jsonb_agg(jsonb_build_object('description', tr.description, 'amount', tr.amount, 'type', tr.type)))
  FROM transactions tr WHERE tr.date BETWEEN start_date_param AND end_date_param GROUP BY tr.date;
END; $$ LANGUAGE plpgsql;

-- RPC: Asset Usage
CREATE OR REPLACE FUNCTION update_asset_usage() RETURNS void AS $$ DECLARE asset RECORD; usage JSONB; BEGIN FOR asset IN SELECT id, file_path FROM storage_assets LOOP usage := '[]' :: jsonb; IF EXISTS (SELECT 1 FROM blog_posts WHERE cover_image_url LIKE '%' || asset.file_path || '%') THEN usage := usage || jsonb_build_object('type', 'Blog Cover', 'id', (SELECT id FROM blog_posts WHERE cover_image_url LIKE '%' || asset.file_path || '%' LIMIT 1)); END IF; IF EXISTS (SELECT 1 FROM blog_posts WHERE content LIKE '%' || asset.file_path || '%') THEN usage := usage || jsonb_build_object('type', 'Blog Content', 'id', (SELECT id FROM blog_posts WHERE content LIKE '%' || asset.file_path || '%' LIMIT 1)); END IF; IF EXISTS (SELECT 1 FROM portfolio_items WHERE image_url LIKE '%' || asset.file_path || '%') THEN usage := usage || jsonb_build_object('type', 'Portfolio Item', 'id', (SELECT id FROM portfolio_items WHERE image_url LIKE '%' || asset.file_path || '%' LIMIT 1)); END IF; UPDATE storage_assets SET used_in = usage WHERE id = asset.id; END LOOP; END; $$ LANGUAGE plpgsql;

-- Create a function to check if any user exists
CREATE OR REPLACE FUNCTION check_admin_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Allows this function to bypass RLS and read auth.users
SET search_path = public, auth -- Secure search path
AS $$
DECLARE
  user_count int;
BEGIN
  -- Count users in the auth schema
  SELECT count(*) INTO user_count FROM auth.users;
  RETURN user_count > 0;
END;
$$;

-- Grant execute permission to the public anon key
GRANT EXECUTE ON FUNCTION check_admin_exists() TO anon;
GRANT EXECUTE ON FUNCTION check_admin_exists() TO authenticated;

-- 1. Ensure the 'assets' bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop old specific policies to prevent confusion
-- (We will create generic policies that work for EITHER 'assets' or 'blog-assets')
DROP POLICY IF EXISTS "Public read access for blog-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload to blog-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update files in blog-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete files in blog-assets" ON storage.objects;

-- 3. Create NEW policies that cover the 'assets' bucket

-- Allow public read access to the assets bucket
CREATE POLICY "Public read access assets" ON storage.objects 
  FOR SELECT USING (bucket_id = 'assets');

-- Allow Admin (authenticated) to INSERT (Upload)
CREATE POLICY "Admin upload access assets" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');

-- Allow Admin to UPDATE
CREATE POLICY "Admin update access assets" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'assets' AND auth.role() = 'authenticated');

-- Allow Admin to DELETE
CREATE POLICY "Admin delete access assets" ON storage.objects 
  FOR DELETE USING (bucket_id = 'assets' AND auth.role() = 'authenticated');