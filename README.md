# Personal Portfolio & CMS

This repository contains the source code for my personal portfolio and blog, completely redesigned with a minimalist dark theme. It's a full-stack application built with Next.js and Supabase, featuring a comprehensive, secure admin panel for content management.

---

## 🚀 Key Features

### Public-Facing Site

-   **Minimalist Dark Theme:** A sleek, modern design built with Tailwind CSS and shadcn/ui.
-   **Kinetic Typography:** Engaging animated headings on the homepage for a dynamic first impression.
-   **Fully Responsive:** Optimized for all devices, from mobile phones to desktops.
-   **Interactive Project Showcase:** An elegant project list with hover-to-preview image effects.
-   **Dynamic Content Sections:** "Work Experience," "Tech Stack," and "Tools" sections are all dynamically populated from the CMS.
-   **Full-Featured Blog:**
    -   Clean, readable article layout using Tailwind Prose.
    -   Server-side rendering (SSR) for fast loads and SEO.
    -   View counter for posts.

### 🔐 Admin Panel

-   **Secure Authentication:**
    -   Email/Password login powered by Supabase Auth.
    -   **Mandatory Two-Factor Authentication (MFA/TOTP)** for admin access, ensuring high security.
-   **Command Calendar:**
    -   A unified, interactive calendar view serving as the primary operational dashboard.
    -   Visualizes task deadlines, personal events, and past financial transactions.
    -   **30-Day Cash Flow Forecasting:** Automatically projects future income and expenses from recurring rules onto the calendar.
-   **Comprehensive Dashboard:**
    -   At-a-glance statistics: Monthly earnings/expenses, task progress, total notes, and blog views.
    -   Quick access to recently updated blog posts and pinned notes.
-   **Content Management System (CMS):**
    -   Manage all public-facing portfolio sections ("Experience," "Projects," "Services," etc.).
    -   Drag-and-drop reordering for sections.
    -   CRUD (Create, Read, Update, Delete) functionality for all portfolio items.
-   **Blog Manager:**
    -   Full CRUD for blog posts.
    -   Advanced Markdown editor with live preview and image upload support.
    -   Image compression and conversion to WEBP on upload.
    -   Manage tags, slugs, excerpts, and publish status.
-   **Personal Management Tools:**
    -   **Task Manager:** A Kanban-style board to track tasks with sub-task support, priorities, and due dates.
    -   **Notes Manager:** A simple, effective tool for personal notes with pinning functionality.
    -   **Finance Tracker:** Log earnings/expenses, manage recurring transactions, and view monthly/yearly summaries.
    -   **Knowledge Hub:** A dedicated system to track learning progress on various subjects and topics, complete with session tracking and a GitHub-style activity heatmap.
-   **Security Settings:**
    -   Manage MFA authenticators.
    -   Securely change the admin account password.

---

## 🛠️ Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (React)
-   **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Edge Functions)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI)
-   **Animation:** [Framer Motion](https://www.framer.com/motion/)
-   **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
-   **Charts & Calendar:** [Recharts](https://recharts.org/) & [FullCalendar](https://fullcalendar.io/)
-   **Markdown:** [ReactMarkdown](https://github.com/remarkjs/react-markdown)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Deployment:** GitHub Pages (for static export) / Vercel

---

## 📂 Project Structure

```
.
├── src/
│   ├── components/
│   │   ├── admin/      # Admin panel components (managers, editors, auth)
│   │   ├── ui/         # Reusable shadcn/ui components
│   │   └── ...         # Public-facing components (header, footer, hero, etc.)
│   ├── hooks/          # Custom React hooks (use-toast, use-mobile)
│   ├── lib/            # Utility functions, API helpers, config
│   ├── pages/
│   │   ├── admin/      # Admin panel pages (login, dashboard, etc.)
│   │   ├── blog/       # Blog index and [slug] pages
│   │   └── ...         # Public-facing pages (home, about, work)
│   ├── styles/         # Global CSS and Tailwind setup
│   ├── supabase/       # Supabase client configuration
│   └── types/          # TypeScript type definitions
├── public/             # Static assets (images, fonts, favicons)
└── ...                 # Config files (next.config.js, tailwind.config.js, etc.)
```

---

## ⚙️ Local Setup & Installation

Follow these steps to get the project running on your local machine.

### 1. Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or later)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 2. Clone the Repository

```bash
git clone https://github.com/akshay-bharadva/portfolio.git
cd portfolio
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Supabase Setup

This project is tightly integrated with Supabase. You'll need a free Supabase account.

#### 1. Create a Supabase Project

-   Go to [supabase.com](https://supabase.com) and create a new project.
-   Once created, navigate to **Project Settings** > **API**.
-   Find your **Project URL** and **`anon`, `public` key**.

#### 2. Create Environment File

-   In the root of the project, create a new file named `.env.local`.
-   Copy the contents of `.env.example` and add your Supabase credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
    NEXT_PUBLIC_BUCKET_NAME=blog-assets
    NEXT_PUBLIC_SITE_URL=http://localhost:8889
    ```

#### 3. Run SQL Setup Scripts

-   Navigate to the **SQL Editor** in your Supabase dashboard and click **+ New query**.
-   Copy the entire SQL script below and paste it into the editor.
-   Click **Run**. This will create all necessary tables, policies, and functions.

<details>
<summary>Click to expand the full Supabase SQL setup script</summary>

```sql
-- Creates a function that updates the 'updated_at' timestamp to the current time.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

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

-- Table to hold individual items within a portfolio section (e.g., a specific job).
CREATE TABLE portfolio_items (
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


-- Table for calendar events
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

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage their own events"
ON events FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RPC FUNCTION: Increment Blog Views
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

-- RPC FUNCTION: Update Section Order
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

-- RPC FUNCTION: Get Total Blog Views
CREATE OR REPLACE FUNCTION get_total_blog_views()
RETURNS BIGINT AS $$
DECLARE
  total_views BIGINT;
BEGIN
  SELECT SUM(views) INTO total_views FROM blog_posts WHERE published = true;
  RETURN COALESCE(total_views, 0);
END;
$$ LANGUAGE plpgsql;

-- RPC FUNCTION: Get Calendar Data
CREATE OR REPLACE FUNCTION get_calendar_data(start_date_param date, end_date_param date)
RETURNS TABLE(
  item_id UUID,
  title TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  item_type TEXT,
  data JSONB
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
      (t.due_date + interval '9 hour')::timestamptz AS start_time,
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
      (tr.date + interval '12 hour')::timestamptz AS start_time,
      NULL::timestamptz AS end_time,
      'transaction' AS item_type,
      jsonb_build_object('amount', tr.amount, 'type', tr.type, 'category', tr.category) AS data
    FROM transactions tr
    WHERE tr.user_id = auth.uid() AND tr.date BETWEEN start_date_param AND end_date_param;

END;
$$ LANGUAGE plpgsql;

-- FINANCE V2 & V3 SCHEMA
CREATE TYPE transaction_frequency AS ENUM ('daily', 'weekly', 'bi-weekly', 'monthly', 'yearly');

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

ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage their own recurring transactions" ON recurring_transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage their own financial goals" ON financial_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON financial_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurring_transaction_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL;

-- KNOWLEDGE HUB SCHEMA
CREATE TYPE learning_status AS ENUM ('To Learn', 'Learning', 'Practicing', 'Mastered');

CREATE TABLE learning_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE learning_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage their own subjects" ON learning_subjects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_learning_subjects_updated_at BEFORE UPDATE ON learning_subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE learning_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
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
CREATE POLICY "Admin can manage their own topics" ON learning_topics FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_learning_topics_updated_at BEFORE UPDATE ON learning_topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  topic_id UUID NOT NULL REFERENCES learning_topics(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INT,
  journal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage their own sessions" ON learning_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RPC FUNCTION: Get Learning Heatmap
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

-- CATEGORY MANAGEMENT RPC FUNCTIONS
CREATE OR REPLACE FUNCTION rename_transaction_category(old_name TEXT, new_name TEXT) RETURNS void AS $$ BEGIN UPDATE transactions SET category = new_name WHERE user_id = auth.uid() AND category = old_name; END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION merge_transaction_categories(source_name TEXT, target_name TEXT) RETURNS void AS $$ BEGIN UPDATE transactions SET category = target_name WHERE user_id = auth.uid() AND category = source_name; END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION delete_transaction_category(category_name TEXT) RETURNS void AS $$ BEGIN UPDATE transactions SET category = NULL WHERE user_id = auth.uid() AND category = category_name; END; $$ LANGUAGE plpgsql;

-- STORAGE POLICIES
CREATE POLICY "Public read access for blog-assets" ON storage.objects FOR SELECT USING ( bucket_id = 'blog-assets' );
CREATE POLICY "Admin can upload to blog-assets" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'blog-assets' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin can update files in blog-assets" ON storage.objects FOR UPDATE USING ( bucket_id = 'blog-assets' AND auth.role() = 'authenticated' );
CREATE POLICY "Admin can delete files in blog-assets" ON storage.objects FOR DELETE USING ( bucket_id = 'blog-assets' AND auth.role() = 'authenticated' );
```

</details>

#### 4. Create Storage Bucket

-   Navigate to **Storage** in your Supabase dashboard.
-   Click **Create a new bucket**.
-   Enter the bucket name you defined in your `.env.local` file (e.g., `blog-assets`).
-   Toggle **Public bucket** to ON.
-   Click **Create bucket**. The RLS policies from the SQL script will automatically apply.

#### 5. Enable MFA

-   Navigate to **Authentication** > **Settings** > **MFA**.
-   Enable **TOTP**.

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8889`.

---

## 🔑 Accessing the Admin Panel

1.  **Navigate to the Login Page:** Go to `http://localhost:8889/admin/login`.
2.  **Create Your Admin Account:** Since this is a new setup, you don't have a user yet. **There is no sign-up form.** You must create your first user manually in the Supabase Dashboard:
    -   Go to **Authentication** > **Users**.
    -   Click **Add user** and create your admin account via email.
3.  **Confirm Your Email:** Click the link in the confirmation email sent by Supabase.
4.  **First Login & MFA Setup:**
    -   Log in with your new credentials on the login page.
    -   You will be automatically redirected to the MFA setup page (`/admin/setup-mfa`).
    -   Scan the QR code with your authenticator app (e.g., Google Authenticator, Authy).
    -   Enter the 6-digit code to verify and complete the setup.
    -   You will be redirected to the admin dashboard.
5.  **Subsequent Logins:** For all future logins, you will be prompted to enter an MFA code after your password.

---

## 🚀 Deployment to GitHub Pages

This portfolio is configured for static export and deployment to GitHub Pages using GitHub Actions.

### 1. Configure `next.config.js`

```javascript
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com'],
  },
  basePath: '',
  assetPrefix: '',
};
```

### 2. Add Environment Variables to GitHub

To allow GitHub Actions to build your site, you must add your Supabase credentials as repository secrets.

1.  Go to your forked GitHub repository.
2.  Click on **Settings** > **Secrets and variables** > **Actions**.
3.  Click **New repository secret** for each of the following:
    -   `NEXT_PUBLIC_SUPABASE_URL`
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    -   `NEXT_PUBLIC_BUCKET_NAME`
    -   `NEXT_PUBLIC_SITE_URL` (Set this to your public GitHub Pages URL, e.g., `https://your-username.github.io/your-repo-name`)

### 3. Create the GitHub Actions Workflow

This repository already includes the necessary workflow file at `.github/workflows/next-deploy.yml`. You don't need to create it, but for reference, it performs these steps:
1. Checks out the code.
2. Sets up Node.js.
3. Installs dependencies.
4. Builds the Next.js static site (`next build` is sufficient because of `output: 'export'`).
5. Uploads the build artifact (`./out` directory).
6. Deploys the artifact to GitHub Pages.

### 4. Enable GitHub Pages

After you push changes to your `main` branch, the deployment action will run.

1.  Wait for the `Deploy Next.js site to Pages` action to complete successfully.
2.  In your GitHub repository, go to **Settings** > **Pages**.
3.  Under **Build and deployment**, set the **Source** to **GitHub Actions**.
4.  GitHub will automatically detect the artifact and deploy it.

Your site will be deployed and available at the URL shown on the Pages settings page.

---

## ✨ Bonus: Keeping Supabase Active

Free-tier Supabase projects can be paused after a week of inactivity. This repository includes a GitHub Action (`.github/workflows/keep-supabase-active.yml`) that runs daily to ping a Supabase function, keeping the project active.

To enable notifications for this job, add another repository secret:

-   `DISCORD_WEBHOOK_URL`: (Optional) A Discord webhook URL to receive success/failure notifications.

---

## 📜 Available Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Creates a production-ready static build of the application in the `./out` directory.
-   `npm run start`: Starts the production server (not used for static export).
-   `npm run lint`: Runs the ESLint linter to check for code quality issues.
-   `npm run export`: An alias for `next build` with static output enabled.
-   `npm run format`: Formats all code using Prettier.
