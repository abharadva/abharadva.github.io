# Supabase Setup Guide

This guide provides all the necessary steps to configure your own Supabase project to act as the backend for this portfolio application.

### Prerequisites

-   A free [Supabase](https://supabase.com) account.

---

### Step 1: Create a Supabase Project

1.  Log in to your Supabase account and click **New project**.
2.  Choose an organization and give your project a **Name** (e.g., `my-portfolio`).
3.  Generate a secure **Database Password** and save it somewhere safe.
4.  Choose the **Region** closest to your users.
5.  Click **Create project**.

---

### Step 2: Configure Environment Variables

1.  In your Supabase project dashboard, navigate to **Project Settings** (the gear icon) > **API**.
2.  In your local project folder, create a new file named `.env.local`.
3.  Copy the contents of `.env.example` into your new `.env.local` file.
4.  Find the **Project URL** and the **Project API Keys** (`anon`, `public` key).
5.  Update your `.env.local` file with these values:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
    NEXT_PUBLIC_BUCKET_NAME=blog-assets
    NEXT_PUBLIC_SITE_URL=http://localhost:8889
    ```

---

### Step 3: Run the Database Setup Script

This single SQL script will create all necessary tables, types, security policies, functions, and default settings.

1.  In your Supabase project dashboard, navigate to the **SQL Editor** (the terminal icon).
2.  Click **+ New query**.
3.  Copy the entire SQL script below and paste it into the editor.
4.  Click **Run**.

<details>
<summary><strong>Click to expand the full Supabase SQL setup script</strong></summary>

```sql
-- ========= HELPER FUNCTION =========
-- Creates a function that updates the 'updated_at' timestamp to the current time.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';


-- ========= SITE CONFIGURATION & IDENTITY =========

-- Table for global site settings (will only ever have one row)
CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  portfolio_mode TEXT NOT NULL DEFAULT 'multi-page' CHECK (portfolio_mode IN ('multi-page', 'single-page')),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT single_row_check CHECK (id = 1)
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin can manage site settings" ON site_settings;
CREATE POLICY "Admin can manage site settings" ON site_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Public can read site settings" ON site_settings;
CREATE POLICY "Public can read site settings" ON site_settings FOR SELECT USING (true);
INSERT INTO site_settings (id, portfolio_mode) VALUES (1, 'multi-page') ON CONFLICT (id) DO NOTHING;

-- Table for global site identity and configuration.
CREATE TABLE IF NOT EXISTS site_identity (
  id INT PRIMARY KEY DEFAULT 1,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  profile_data JSONB,
  social_links JSONB,
  footer_data JSONB,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT single_row_enforcement CHECK (id = 1)
);
ALTER TABLE site_identity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin can manage site identity" ON site_identity;
CREATE POLICY "Admin can manage site identity" ON site_identity FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Public can read site identity" ON site_identity;
CREATE POLICY "Public can read site identity" ON site_identity FOR SELECT USING (true);
DROP TRIGGER IF EXISTS update_site_identity_updated_at ON site_identity;
CREATE TRIGGER update_site_identity_updated_at BEFORE UPDATE ON site_identity FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
INSERT INTO site_identity (id, profile_data, social_links, footer_data)
VALUES (1,
  '{
    "name": "Alex Doe",
    "title": "Creative Web Developer.",
    "description": "I craft beautiful and intuitive digital experiences. With a focus on modern web standards and user-centric design, I build web applications that are both functional and delightful.",
    "profile_picture_url": "https://i.pravatar.cc/150?u=alexdoe",
    "show_profile_picture": true,
    "logo": { "main": "ALEX", "highlight": ".DEV" },
    "status_panel": {
      "availability": "Open to new projects & collaborations",
      "currently_exploring": { "items": ["Edge Computing", "Web3 Integration"] },
      "latestProject": { "name": "This Portfolio CMS", "linkText": "View all projects", "href": "/projects" }
    },
    "bio": [
      "As a developer with a keen eye for design, my passion lies in creating seamless user journeys from concept to deployment. I believe that the best products are built at the intersection of powerful technology and thoughtful design.",
      "I''m always learning and experimenting with new tools to stay at the forefront of web development. When I''m not coding, I enjoy contributing to open-source projects and exploring digital art."
    ]
  }',
  '[
    {"id": "github", "label": "GitHub", "url": "https://github.com/", "is_visible": true},
    {"id": "linkedin", "label": "LinkedIn", "url": "https://www.linkedin.com/", "is_visible": true},
    {"id": "email", "label": "Email", "url": "mailto:hello@example.com", "is_visible": true}
  ]',
  '{ "copyright_text": "Crafted with Next.js & Supabase. Deployed on GitHub Pages." }'
) ON CONFLICT (id) DO UPDATE SET
  profile_data = EXCLUDED.profile_data,
  social_links = EXCLUDED.social_links,
  footer_data = EXCLUDED.footer_data;


-- Navigation Links Table
CREATE TABLE IF NOT EXISTS navigation_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  display_order INT4 DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE navigation_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin can manage navigation" ON navigation_links;
CREATE POLICY "Admin can manage navigation" ON navigation_links FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Public can read visible navigation" ON navigation_links;
CREATE POLICY "Public can read visible navigation" ON navigation_links FOR SELECT USING (is_visible = true);


-- ========= CORE CONTENT TABLES =========

-- Portfolio Sections Table (with final schema)
CREATE TABLE IF NOT EXISTS portfolio_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
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
DROP POLICY IF EXISTS "Admin full access on portfolio_sections" ON portfolio_sections;
CREATE POLICY "Admin full access on portfolio_sections" ON portfolio_sections FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Public can read portfolio_sections" ON portfolio_sections;
CREATE POLICY "Public can read portfolio_sections" ON portfolio_sections FOR SELECT USING (is_visible = true);
DROP TRIGGER IF EXISTS update_portfolio_sections_updated_at ON portfolio_sections;
CREATE TRIGGER update_portfolio_sections_updated_at BEFORE UPDATE ON portfolio_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Portfolio Items Table
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES portfolio_sections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
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
DROP POLICY IF EXISTS "Admin full access on portfolio_items" ON portfolio_items;
CREATE POLICY "Admin full access on portfolio_items" ON portfolio_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Public can read portfolio_items" ON portfolio_items;
CREATE POLICY "Public can read portfolio_items" ON portfolio_items FOR SELECT USING (true);
DROP TRIGGER IF EXISTS update_portfolio_items_updated_at ON portfolio_items;
CREATE TRIGGER update_portfolio_items_updated_at BEFORE UPDATE ON portfolio_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  tags TEXT[],
  views BIGINT DEFAULT 0,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access on blog_posts" ON blog_posts;
CREATE POLICY "Admin full access on blog_posts" ON blog_posts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Public can read published blog_posts" ON blog_posts;
CREATE POLICY "Public can read published blog_posts" ON blog_posts FOR SELECT USING (published = true);
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ========= ADMIN PANEL PERSONAL TABLES =========

-- (Events, Notes, Tasks, Finance, Learning Hub tables)
-- Custom Types (run only if they don't exist)
DO $$ BEGIN CREATE TYPE task_status AS ENUM ('todo', 'inprogress', 'done'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE transaction_type AS ENUM ('earning', 'expense'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE transaction_frequency AS ENUM ('daily', 'weekly', 'bi-weekly', 'monthly', 'yearly'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE learning_status AS ENUM ('To Learn', 'Learning', 'Practicing', 'Mastered'); EXCEPTION WHEN duplicate_object THEN null; END $$;


CREATE TABLE IF NOT EXISTS events ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(), title TEXT NOT NULL, description TEXT, start_time TIMESTAMPTZ NOT NULL, end_time TIMESTAMPTZ, is_all_day BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now() );
ALTER TABLE events ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Admin can manage their own events" ON events; CREATE POLICY "Admin can manage their own events" ON events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); DROP TRIGGER IF EXISTS update_events_updated_at ON events; CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS notes ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(), title TEXT, content TEXT, tags TEXT[], is_pinned BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now() );
ALTER TABLE notes ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Admin can manage their own notes" ON notes; CREATE POLICY "Admin can manage their own notes" ON notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); DROP TRIGGER IF EXISTS update_notes_updated_at ON notes; CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS tasks ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(), title TEXT NOT NULL, status task_status DEFAULT 'todo', due_date DATE, priority task_priority DEFAULT 'medium', created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now() );
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Admin can manage their own tasks" ON tasks; CREATE POLICY "Admin can manage their own tasks" ON tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks; CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS sub_tasks ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE, user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(), title TEXT NOT NULL, is_completed BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now() );
ALTER TABLE sub_tasks ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Admin can manage sub_tasks" ON sub_tasks; CREATE POLICY "Admin can manage sub_tasks" ON sub_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS transactions ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(), date DATE NOT NULL, description TEXT NOT NULL, amount NUMERIC(10, 2) NOT NULL, type transaction_type NOT NULL, category TEXT, recurring_transaction_id UUID, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now() );
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Admin can manage their own transactions" ON transactions; CREATE POLICY "Admin can manage their own transactions" ON transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions; CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS recurring_transactions ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(), description TEXT NOT NULL, amount NUMERIC(10, 2) NOT NULL, type transaction_type NOT NULL, category TEXT, frequency transaction_frequency NOT NULL, start_date DATE NOT NULL, end_date DATE, occurrence_day INT, last_processed_date DATE, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now() );
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Admin can manage recurring transactions" ON recurring_transactions; CREATE POLICY "Admin can manage recurring transactions" ON recurring_transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); DROP TRIGGER IF EXISTS update_recurring_transactions_updated_at ON recurring_transactions; CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE transactions ADD CONSTRAINT transactions_recurring_transaction_id_fkey FOREIGN KEY (recurring_transaction_id) REFERENCES recurring_transactions(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS financial_goals ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(), name TEXT NOT NULL, description TEXT, target_amount NUMERIC(12, 2) NOT NULL, current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0, target_date DATE, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now() );
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Admin can manage financial goals" ON financial_goals; CREATE POLICY "Admin can manage financial goals" ON financial_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); DROP TRIGGER IF EXISTS update_financial_goals_updated_at ON financial_goals; CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON financial_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS learning_subjects ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(), name TEXT NOT NULL UNIQUE, description TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now() );
ALTER TABLE learning_subjects ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Admin can manage subjects" ON learning_subjects; CREATE POLICY "Admin can manage subjects" ON learning_subjects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); DROP TRIGGER IF EXISTS update_learning_subjects_updated_at ON learning_subjects; CREATE TRIGGER update_learning_subjects_updated_at BEFORE UPDATE ON learning_subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS learning_topics ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(), subject_id UUID REFERENCES learning_subjects(id) ON DELETE CASCADE, title TEXT NOT NULL, status learning_status DEFAULT 'To Learn', core_notes TEXT, resources JSONB, confidence_score INT2 CHECK (confidence_score BETWEEN 1 AND 5), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now() );
ALTER TABLE learning_topics ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Admin can manage topics" ON learning_topics; CREATE POLICY "Admin can manage topics" ON learning_topics FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); DROP TRIGGER IF EXISTS update_learning_topics_updated_at ON learning_topics; CREATE TRIGGER update_learning_topics_updated_at BEFORE UPDATE ON learning_topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS learning_sessions ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(), topic_id UUID NOT NULL REFERENCES learning_topics(id) ON DELETE CASCADE, start_time TIMESTAMPTZ NOT NULL, end_time TIMESTAMPTZ, duration_minutes INT, journal_notes TEXT, created_at TIMESTAMPTZ DEFAULT now() );
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Admin can manage sessions" ON learning_sessions; CREATE POLICY "Admin can manage sessions" ON learning_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS storage_assets ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(), file_name TEXT NOT NULL, file_path TEXT NOT NULL UNIQUE, mime_type TEXT, size_kb NUMERIC, alt_text TEXT, used_in JSONB, created_at TIMESTAMPTZ DEFAULT now() );
ALTER TABLE storage_assets ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Admin can manage their own assets" ON storage_assets; CREATE POLICY "Admin can manage their own assets" ON storage_assets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ========= RPC FUNCTIONS =========
CREATE OR REPLACE FUNCTION get_calendar_data(start_date_param date, end_date_param date) RETURNS TABLE(item_id UUID, title TEXT, start_time TIMESTAMPTZ, end_time TIMESTAMPTZ, item_type TEXT, data JSONB) AS $$ BEGIN RETURN QUERY SELECT e.id, e.title, e.start_time, e.end_time, 'event' AS item_type, jsonb_build_object('description', e.description, 'is_all_day', e.is_all_day) FROM events e WHERE e.user_id = auth.uid() AND e.start_time :: date BETWEEN start_date_param AND end_date_param UNION ALL SELECT t.id, t.title, (t.due_date + interval '9 hour'):: timestamptz, NULL :: timestamptz, 'task' AS item_type, jsonb_build_object('status', t.status, 'priority', t.priority) FROM tasks t WHERE t.user_id = auth.uid() AND t.due_date BETWEEN start_date_param AND end_date_param UNION ALL SELECT tr.id, tr.description, (tr.date + interval '12 hour'):: timestamptz, NULL :: timestamptz, 'transaction' AS item_type, jsonb_build_object('amount', tr.amount, 'type', tr.type, 'category', tr.category) FROM transactions tr WHERE tr.user_id = auth.uid() AND tr.date BETWEEN start_date_param AND end_date_param; END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION increment_blog_post_view (post_id_to_increment UUID) RETURNS void LANGUAGE plpgsql AS $$ BEGIN UPDATE blog_posts SET views = views + 1 WHERE id = post_id_to_increment; END; $$;
CREATE OR REPLACE FUNCTION update_section_order(section_ids UUID[]) RETURNS void AS $$ BEGIN FOR i IN 1..array_length(section_ids, 1) LOOP UPDATE portfolio_sections SET display_order = i WHERE id = section_ids[i]; END LOOP; END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION get_total_blog_views() RETURNS BIGINT AS $$ DECLARE total_views BIGINT; BEGIN SELECT SUM(views) INTO total_views FROM blog_posts WHERE published = true; RETURN COALESCE(total_views, 0); END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION get_learning_heatmap_data(start_date DATE, end_date DATE) RETURNS TABLE(day DATE, total_minutes INT) AS $$ BEGIN RETURN QUERY SELECT DATE(s.start_time AT TIME ZONE 'UTC') AS day, COALESCE(SUM(s.duration_minutes), 0):: INT AS total_minutes FROM learning_sessions s WHERE s.user_id = auth.uid() AND s.start_time AT TIME ZONE 'UTC' >= start_date AND s.start_time AT TIME ZONE 'UTC' <= end_date GROUP BY day ORDER BY day; END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION rename_transaction_category(old_name TEXT, new_name TEXT) RETURNS void AS $$ BEGIN UPDATE transactions SET category = new_name WHERE user_id = auth.uid() AND category = old_name; END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION merge_transaction_categories(source_name TEXT, target_name TEXT) RETURNS void AS $$ BEGIN UPDATE transactions SET category = target_name WHERE user_id = auth.uid() AND category = source_name; END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION delete_transaction_category(category_name TEXT) RETURNS void AS $$ BEGIN UPDATE transactions SET category = NULL WHERE user_id = auth.uid() AND category = category_name; END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION ping() RETURNS text AS $$ BEGIN RETURN 'pong'; END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION update_asset_usage() RETURNS void AS $$ DECLARE asset RECORD; usage JSONB; BEGIN FOR asset IN SELECT id, file_path FROM storage_assets LOOP usage := '[]' :: jsonb; IF EXISTS (SELECT 1 FROM blog_posts WHERE cover_image_url LIKE '%' || asset.file_path || '%') THEN usage := usage || jsonb_build_object('type', 'Blog Cover', 'id', (SELECT id FROM blog_posts WHERE cover_image_url LIKE '%' || asset.file_path || '%' LIMIT 1)); END IF; IF EXISTS (SELECT 1 FROM blog_posts WHERE content LIKE '%' || asset.file_path || '%') THEN usage := usage || jsonb_build_object('type', 'Blog Content', 'id', (SELECT id FROM blog_posts WHERE content LIKE '%' || asset.file_path || '%' LIMIT 1)); END IF; IF EXISTS (SELECT 1 FROM portfolio_items WHERE image_url LIKE '%' || asset.file_path || '%') THEN usage := usage || jsonb_build_object('type', 'Portfolio Item', 'id', (SELECT id FROM portfolio_items WHERE image_url LIKE '%' || asset.file_path || '%' LIMIT 1)); END IF; UPDATE storage_assets SET used_in = usage WHERE id = asset.id; END LOOP; END; $$ LANGUAGE plpgsql;


-- ========= STORAGE POLICIES =========
DROP POLICY IF EXISTS "Public read access for blog-assets" ON storage.objects;
CREATE POLICY "Public read access for blog-assets" ON storage.objects FOR SELECT USING (bucket_id = 'blog-assets');

DROP POLICY IF EXISTS "Admin can upload to blog-assets" ON storage.objects;
CREATE POLICY "Admin can upload to blog-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-assets' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can update files in blog-assets" ON storage.objects;
CREATE POLICY "Admin can update files in blog-assets" ON storage.objects FOR UPDATE USING (bucket_id = 'blog-assets' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can delete files in blog-assets" ON storage.objects;
CREATE POLICY "Admin can delete files in blog-assets" ON storage.objects FOR DELETE USING (bucket_id = 'blog-assets' AND auth.role() = 'authenticated');
```
</details>

---

### Step 4: Create Storage Bucket

The application uses Supabase Storage to handle image uploads for blog posts and portfolio items.

1.  Navigate to **Storage** in your Supabase dashboard.
2.  Click **Create a new bucket**.
3.  Enter the bucket name you defined in your `.env.local` file (e.g., `blog-assets`).
4.  Toggle **Public bucket** to **ON**.
5.  Click **Create bucket**. The RLS policies from the SQL script will secure the bucket appropriately.

---

### Step 5: Enable Two-Factor Authentication (MFA)

The admin panel requires Two-Factor Authentication (MFA/TOTP) for security.

1.  Navigate to **Authentication** > **Settings** > **MFA**.
2.  Enable **TOTP**.

---

### Step 6: Create Your Admin User

The admin panel does not have a public sign-up page. You must create your first user manually.

1.  Go to **Authentication** > **Users** in your Supabase dashboard.
2.  Click **Add user** and create your admin account using an email and a secure password.
3.  Check your inbox for a confirmation email from Supabase and click the link to verify your account.
4.  You can now proceed to your local application at `http://localhost:3000/admin/login` to log in for the first time and set up MFA.