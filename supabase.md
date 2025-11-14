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

#### `events` Table (NEW)

Stores personal calendar events for the Command Calendar.
```sql
-- In your Supabase SQL Editor
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  is_all_day BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and add policies (similar to your other tables)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage their own events"
ON events FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add the update trigger
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

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

#### `transactions` Table

```sql
-- Custom ENUM type for transaction type.
CREATE TYPE transaction_type AS ENUM ('earning', 'expense');

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
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admin can only access their own transactions.
CREATE POLICY "Admin can manage their own transactions"
ON transactions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger for 'updated_at' timestamp.
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### Step 4: RPC Functions (Server-Side Logic)

These functions are called from the client to perform specific, safe operations on the database.

#### `get_calendar_data` RPC Function (UPDATED)
```sql
-- Creates a function to fetch all items for the calendar view
CREATE OR REPLACE FUNCTION get_calendar_data(start_date_param date, end_date_param date)
RETURNS TABLE(
  item_id UUID,
  title TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  item_type TEXT,
  data JSONB -- To hold extra info like amount, status, etc.
) AS $$
BEGIN
  RETURN QUERY
    -- 1. Custom Events
    SELECT
      e.id AS item_id,
      e.title,
      e.start_time,
      e.end_time,
      'event' AS item_type,
      jsonb_build_object('description', e.description, 'is_all_day', e.is_all_day) AS data
    FROM events e
    WHERE e.user_id = auth.uid() AND e.start_time::date BETWEEN start_date_param AND end_date_param

    UNION ALL

    -- 2. Tasks with due dates
    SELECT
      t.id AS item_id,
      t.title,
      (t.due_date + interval '9 hour')::timestamptz AS start_time, -- Assume tasks are due at 9 AM
      NULL::timestamptz AS end_time,
      'task' AS item_type,
      jsonb_build_object('status', t.status, 'priority', t.priority) AS data
    FROM tasks t
    WHERE t.user_id = auth.uid() AND t.due_date BETWEEN start_date_param AND end_date_param

    UNION ALL

    -- 3. Past Transactions
    SELECT
      tr.id AS item_id,
      tr.description AS title,
      (tr.date + interval '12 hour')::timestamptz AS start_time, -- Assume logged at noon
      NULL::timestamptz AS end_time,
      'transaction' AS item_type,
      -- CORRECTED PAYLOAD WITH FINANCIAL DETAILS
      jsonb_build_object('amount', tr.amount, 'type', tr.type, 'category', tr.category) AS data
    FROM transactions tr
    WHERE tr.user_id = auth.uid() AND tr.date BETWEEN start_date_param AND end_date_param;

END;
$$ LANGUAGE plpgsql;
```

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
USING ( bucket_id = 'blog-assets' AND auth.role() = 'authenticated' );

-- Admin can delete their own files.
CREATE POLICY "Admin can delete files in blog-assets"
ON storage.objects FOR DELETE
USING ( bucket_id = 'blog-assets' AND auth.role() = 'authenticated' );
```
---
### Step 6: Backend Automation (Edge Function) - TODO

To automate recurring transactions, you will need to create a **Supabase Edge Function**.

1.  **Create the Function:** Using the Supabase CLI, run `supabase functions new process-recurring-transactions`.
2.  **Function Logic:** The function (written in Deno/TypeScript) will query for due recurring transactions, create new entries in the `transactions` table, and then update the `last_processed_date` on the processed rules.
3.  **Schedule the Function:** In your project's `supabase/config.toml` file, add a cron schedule to run the function daily.

    ```toml
    # supabase/config.toml
    [functions.process-recurring-transactions]
    cron = "0 0 * * *" # Runs every day at midnight UTC
    ```

---

-- ========= FINANCE V2 SCHEMA UPGRADE =========

-- Drop types if they exist, to ensure a clean run
DROP TYPE IF EXISTS transaction_frequency;

-- Step 1: Create new ENUM types for recurring transactions
CREATE TYPE transaction_frequency AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

-- Step 2: Create the 'recurring_transactions' table
CREATE TABLE IF NOT EXISTS recurring_transactions (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
description TEXT NOT NULL,
amount NUMERIC(10, 2) NOT NULL,
type transaction_type NOT NULL, -- Reuses the type from the transactions table
category TEXT,
frequency transaction_frequency NOT NULL,
start_date DATE NOT NULL,
end_date DATE, -- Optional: for subscriptions that have an end date
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 3: Set up RLS and Triggers for 'recurring_transactions'
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists to avoid errors on re-run
DROP POLICY IF EXISTS "Admin can manage their own recurring transactions" ON recurring_transactions;

CREATE POLICY "Admin can manage their own recurring transactions"
ON recurring_transactions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS update_recurring_transactions_updated_at ON recurring_transactions;

CREATE TRIGGER update_recurring_transactions_updated_at
BEFORE UPDATE ON recurring_transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Create the 'financial_goals' table
CREATE TABLE IF NOT EXISTS financial_goals (
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

-- Step 5: Set up RLS and Triggers for 'financial_goals'
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage their own financial goals" ON financial_goals;

CREATE POLICY "Admin can manage their own financial goals"
ON financial_goals FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_financial_goals_updated_at ON financial_goals;

CREATE TRIGGER update_financial_goals_updated_at
BEFORE UPDATE ON financial_goals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Add the foreign key column to the EXISTING 'transactions' table
-- This links a transaction to a recurring rule, if it was generated from one.
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS recurring_transaction_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL;

-- ========= END OF SCRIPT =========

-- Adds a column to track the last time a recurring rule was processed for automation.
ALTER TABLE recurring_transactions
ADD COLUMN IF NOT EXISTS last_processed_date DATE;

-- ========= FINANCE V3 SCHEMA UPGRADE (Precise Scheduling) =========

-- Step 1: We must drop the existing frequency type to add a new value.
-- This is a standard procedure in PostgreSQL for altering ENUM types.
ALTER TYPE transaction_frequency RENAME TO transaction_frequency_old;

-- Step 2: Create the NEW frequency type with 'bi-weekly' included.
CREATE TYPE transaction_frequency AS ENUM ('daily', 'weekly', 'bi-weekly', 'monthly', 'yearly');

-- Step 3: Update the recurring_transactions table to use the new type.
ALTER TABLE recurring_transactions 
ALTER COLUMN frequency TYPE transaction_frequency 
USING frequency::text::transaction_frequency;

-- Step 4: Drop the old type now that it's no longer in use.
DROP TYPE transaction_frequency_old;

-- Step 5: Add the new column to store the specific day/date of the occurrence.
-- For weekly/bi-weekly, this is day of week (0=Sun, 1=Mon, ..., 6=Sat).
-- For monthly, this is date of month (1-31).
-- For daily/yearly, this is NULL as it's not needed.
ALTER TABLE recurring_transactions
ADD COLUMN IF NOT EXISTS occurrence_day INT;

-- ========= END OF SCRIPT =========

-- ========= KNOWLEDGE HUB SCHEMA =========

-- Step 1: Create the Subject table (high-level categories)
CREATE TABLE learning_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE learning_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage their own subjects" ON learning_subjects FOR ALL
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_learning_subjects_updated_at BEFORE UPDATE ON learning_subjects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Step 2: Create the Topic table (specific items to learn)
CREATE TYPE learning_status AS ENUM ('To Learn', 'Learning', 'Practicing', 'Mastered');

CREATE TABLE learning_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  subject_id UUID REFERENCES learning_subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status learning_status DEFAULT 'To Learn',
  core_notes TEXT, -- The main, persistent notes for the topic
  resources JSONB, -- To store an array of {name: string, url: string}
  confidence_score INT2 CHECK (confidence_score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE learning_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage their own topics" ON learning_topics FOR ALL
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_learning_topics_updated_at BEFORE UPDATE ON learning_topics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Step 3: Create the Learning Sessions table (timed entries)
CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  topic_id UUID NOT NULL REFERENCES learning_topics(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INT, -- Calculated on stop
  journal_notes TEXT, -- Ephemeral notes for this specific session
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage their own sessions" ON learning_sessions FOR ALL
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- Step 4: Create RPC function for the heatmap
CREATE OR REPLACE FUNCTION get_learning_heatmap_data(start_date DATE, end_date DATE)
RETURNS TABLE(day DATE, total_minutes INT) AS $$
BEGIN
  RETURN QUERY
    SELECT
      DATE(s.start_time AT TIME ZONE 'UTC') AS day,
      COALESCE(SUM(s.duration_minutes), 0)::INT AS total_minutes
    FROM learning_sessions s
    WHERE s.user_id = auth.uid()
      AND s.start_time AT TIME ZONE 'UTC' >= start_date
      AND s.start_time AT TIME ZONE 'UTC' <= end_date
    GROUP BY day
    ORDER BY day;
END;
$$ LANGUAGE plpgsql;

-- ========= END KNOWLEDGE HUB SCHEMA =========


ALTER TABLE learning_topics
ADD COLUMN IF NOT EXISTS review_interval INT;


-- ========= REVERT KNOWLEDGE HUB V2 (SPACED REPETITION) =========

-- Step 1: Remove the review_interval column from the learning_topics table.
ALTER TABLE learning_topics
DROP COLUMN IF EXISTS review_interval;

-- NOTE: This does NOT delete any tasks that were already created.
-- You can manually delete them from the Task Manager or run the following SQL:
-- DELETE FROM tasks WHERE title LIKE 'Review:%';

-- ========= END OF SCRIPT =========

-- ========= CATEGORY MANAGEMENT RPC FUNCTIONS =========

-- RPC function to rename a category across all transactions for the user.
CREATE OR REPLACE FUNCTION rename_transaction_category(
    old_name TEXT,
    new_name TEXT
)
RETURNS void AS $$
BEGIN
    UPDATE transactions
    SET category = new_name
    WHERE user_id = auth.uid() AND category = old_name;
END;
$$ LANGUAGE plpgsql;

-- RPC function to merge a source category into a target category.
CREATE OR REPLACE FUNCTION merge_transaction_categories(
    source_name TEXT,
    target_name TEXT
)
RETURNS void AS $$
BEGIN
    UPDATE transactions
    SET category = target_name
    WHERE user_id = auth.uid() AND category = source_name;
END;
$$ LANGUAGE plpgsql;

-- RPC function to remove a category tag from all transactions (set to null).
CREATE OR REPLACE FUNCTION delete_transaction_category(
    category_name TEXT
)
RETURNS void AS $$
BEGIN
    UPDATE transactions
    SET category = NULL
    WHERE user_id = auth.uid() AND category = category_name;
END;
$$ LANGUAGE plpgsql;