# Supabase Database & Auth Setup Guide

This document contains all the necessary SQL scripts to initialize the database schema for the portfolio project. Run these scripts in your Supabase project's **SQL Editor**.

**Recommendation:** Run the entire script in one go. The statements are ordered to ensure dependencies are met.

---

### Step 1: Helper Function for Timestamps

This function automatically updates the `updated_at` column on any table it's attached to. We define it once and reuse it across multiple tables.

```sql
-- Creates a function that updates the 'updated_at' timestamp to the current time.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';
```

---

### Step 2: Core Content Tables

These tables store the main content for the public-facing portfolio and blog.

#### `portfolio_sections` Table

Stores the main sections of the website, like "Work Experience", "Projects", "Services", etc.

```sql
-- Table to hold the main sections of the portfolio website.
CREATE TABLE portfolio_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('markdown', 'list_items', 'gallery')),
  content TEXT, -- For markdown-type sections
  display_order INT4 DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE portfolio_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated admin user can perform all actions on their own sections.
CREATE POLICY "Admin full access on portfolio_sections"
ON portfolio_sections FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: The public can read all sections.
CREATE POLICY "Public can read portfolio_sections"
ON portfolio_sections FOR SELECT
USING (true);

-- Trigger to automatically update 'updated_at' timestamp on any row update.
CREATE TRIGGER update_portfolio_sections_updated_at
BEFORE UPDATE ON portfolio_sections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### `portfolio_items` Table

Stores individual items within a `list_items` section (e.g., a specific job in "Experience", or a specific project in "Projects").

```sql
-- Table to hold individual items within a portfolio section (e.g., a specific job).
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES portfolio_sections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  tags TEXT[],
  internal_notes TEXT,
  display_order INT4 DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admin can manage their own portfolio items.
CREATE POLICY "Admin full access on portfolio_items"
ON portfolio_items FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: The public can read all portfolio items.
CREATE POLICY "Public can read portfolio_items"
ON portfolio_items FOR SELECT
USING (true);

-- Trigger for 'updated_at' timestamp.
CREATE TRIGGER update_portfolio_items_updated_at
BEFORE UPDATE ON portfolio_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### `blog_posts` Table

Stores all blog articles and their content.

```sql
-- Table for blog posts.
CREATE TABLE blog_posts (
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

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admin can manage their own blog posts.
CREATE POLICY "Admin full access on blog_posts"
ON blog_posts FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: The public can read posts that are marked as 'published'.
CREATE POLICY "Public can read published blog_posts"
ON blog_posts FOR SELECT
USING (published = true);

-- Trigger for 'updated_at' timestamp.
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### Step 3: Admin Panel Feature Tables

These tables power the management tools within the admin dashboard.

#### `notes` Table

```sql
-- Table for personal notes in the admin dashboard.
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT,
  content TEXT,
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admin can only access their own notes.
CREATE POLICY "Admin can manage their own notes"
ON notes FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger for 'updated_at' timestamp.
CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### `tasks` & `sub_tasks` Tables

```sql
-- Custom ENUM types for task properties.
CREATE TYPE task_status AS ENUM ('todo', 'inprogress', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

-- Table for main tasks in the Kanban board.
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  status task_status DEFAULT 'todo',
  due_date DATE,
  priority task_priority DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admin can only access their own tasks.
CREATE POLICY "Admin can manage their own tasks"
ON tasks FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger for 'updated_at' timestamp.
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Table for sub-tasks associated with a main task.
CREATE TABLE sub_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE sub_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admin can only access their own sub-tasks.
CREATE POLICY "Admin can manage sub_tasks for their own tasks"
ON sub_tasks FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

#### Finance Tables

```sql
-- Custom ENUM type for transaction type.
CREATE TYPE transaction_type AS ENUM ('earning', 'expense');
CREATE TYPE transaction_frequency AS ENUM ('daily', 'weekly', 'bi-weekly', 'monthly', 'yearly');

-- Table for financial transactions.
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  type transaction_type NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  recurring_transaction_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL
);

-- Table for recurring transactions rules.
CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
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

-- Table for financial goals.
CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and setup triggers for all finance tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage their own transactions" ON transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage their own recurring transactions" ON recurring_transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage their own financial goals" ON financial_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON financial_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### Step 4: RPC Functions (Server-Side Logic)

These functions are called from the client to perform specific, safe operations on the database.

```sql
-- Safely increments the view count for a given blog post.
CREATE OR REPLACE FUNCTION increment_blog_post_view (post_id_to_increment UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE blog_posts
  SET views = views + 1
  WHERE id = post_id_to_increment;
END;
$$;

-- Updates the display order of portfolio sections in a single transaction.
CREATE OR REPLACE FUNCTION update_section_order(section_ids UUID[])
RETURNS void AS $$
BEGIN
  FOR i IN 1..array_length(section_ids, 1) LOOP
    UPDATE portfolio_sections
    SET display_order = i
    WHERE id = section_ids[i];
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Efficiently calculates the total views for all published blog posts for the dashboard.
CREATE OR REPLACE FUNCTION get_total_blog_views()
RETURNS BIGINT AS $$
DECLARE
  total_views BIGINT;
BEGIN
  SELECT SUM(views) INTO total_views FROM blog_posts WHERE published = true;
  RETURN COALESCE(total_views, 0);
END;
$$ LANGUAGE plpgsql;
```

---

### Step 5: Storage Setup & Policies

Create a bucket named `blog-assets` in the Supabase UI and make it public. Then, run the following SQL to set up security policies for file uploads.

```sql
-- Public users can read/download any file from the 'blog-assets' bucket.
CREATE POLICY "Public read access for blog-assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'blog-assets' );

-- Any authenticated user (i.e., the admin) can upload files to the bucket.
CREATE POLICY "Admin can upload to blog-assets"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'blog-assets' AND auth.role() = 'authenticated' );

-- Admin can update their own files.
CREATE POLICY "Admin can update files in blog-assets"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'blog-assets' AND auth.uid() = owner );

-- Admin can delete their own files.
CREATE POLICY "Admin can delete files in blog-assets"
ON storage.objects FOR DELETE
USING ( bucket_id = 'blog-assets' AND auth.uid() = owner );
```