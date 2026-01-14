# 🚀 Personal Portfolio & Headless CMS (Personal OS)

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=flat-square&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Redux Toolkit](https://img.shields.io/badge/Redux-State-purple?style=flat-square&logo=redux)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

A high-performance, kinetic typography-themed portfolio website integrated with a powerful **"Personal OS" Admin Panel**. 

This project solves the dilemma of having a static portfolio but needing dynamic features. It runs in two modes:
1.  **Static Mode:** Zero-config, data loaded from a file (Great for simple hosting).
2.  **Admin Mode:** Full-stack "Personal OS" connected to Supabase (Finance, Tasks, CMS, Habits).

---

## 🌟 Key Features

### 🎨 Public-Facing Portfolio
*   **Universal Template:** Works immediately upon cloning. Missing database credentials? It gracefully falls back to fallback data.
*   **Kinetic Design:** Bold aesthetic with smooth Framer Motion animations.
*   **Dynamic Content Engine:** Pages like `/about` or `/projects` are rendered based on your CMS data.
*   **Markdown Blog:** Full-featured blog with syntax highlighting, Table of Contents, and read-time estimation.

### 🔐 Admin Panel (Personal OS)
*   **Secure Auth:** Supabase Auth with mandatory **Multi-Factor Authentication (MFA/TOTP)**.
*   **Productivity Suite:**
    *   **Task Manager:** Kanban board and Tree view with subtasks.
    *   **Finance Tracker:** Income/Expense tracking, recurring subscriptions, and investment forecasting.
    *   **Habit Tracker:** GitHub-style contribution heatmaps.
    *   **Inventory:** Asset tracking for hardware/software with depreciation.
    *   **Learning Hub:** Curriculum builder with a built-in Pomodoro focus timer.
*   **CMS:** Drag-and-drop page builder and advanced Markdown editor with image uploads.

---

## 🛠️ Tech Stack

*   **Frontend:** Next.js 14 (Pages Router), React 18
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, Shadcn UI, Framer Motion
*   **Backend:** Supabase (PostgreSQL, Auth, Storage)
*   **State:** Redux Toolkit (RTK Query) for caching and optimistic updates
*   **Visualization:** Recharts (Analytics), FullCalendar

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/abharadva/abharadva.github.io.git
cd abharadva.github.io
npm install
```

### 2. Choose Your Mode

#### 🟢 Option A: Static Mode (Fastest)
Ideal if you just want the portfolio website without the admin features.
1.  Simply run `npm run dev`.
2.  The app detects missing database keys and switches to **Mock Mode**.
3.  Edit `src/lib/mock-data.ts` to change your content.

#### 🔴 Option B: Admin Mode (Full Power)
Connect a free Supabase database to unlock the Admin Panel, CMS, and Dashboard.

**Step 1: Create Supabase Project**
1.  Go to [Supabase.com](https://supabase.com) and create a new project.
2.  Go to **Project Settings > API**.
3.  Copy the **Project URL** and **anon / public** Key.

**Step 2: Environment Variables**
Create a `.env.local` file in your root directory:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_BUCKET_NAME=blog-assets

# Optional: Only needed for the 'npm run seed' script
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Step 3: Database Setup**
1.  Open the file `db/schema.sql` in this repository.
2.  Copy the contents.
3.  Go to the **Supabase SQL Editor**, paste the SQL, and click **Run**.
    *   *This creates all 18+ tables, RLS policies, and triggers.*

**Step 4: Storage Setup**
1.  Go to **Storage** in Supabase.
2.  Create a new bucket named `blog-assets`.
3.  **Important:** Toggle "Public Bucket" to **ON**.

**Step 5: Seed Data**
Populate the database with the default template data so your dashboard isn't empty.
```bash
npm run seed
```

**Step 6: Launch**
```bash
npm run dev
```

---

## 👤 First-Time Admin Setup

The admin panel is secure by default. There is no public registration page.

1.  Navigate to `http://localhost:3000/admin/signup`.
    *   *Note: This page only works if no admin user exists in the database.*
2.  Create your root account.
3.  **Check your email** to confirm the account.
4.  Log in at `/admin/login`.
5.  Follow the prompt to scan the QR Code and set up **2FA (MFA)**.

---

## 📦 Deployment

This project uses `output: 'export'` for compatibility with static hosts like **GitHub Pages**.

### 1. GitHub Secrets
Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**. Add these secrets:

| Secret Name | Value |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key |
| `NEXT_PUBLIC_BUCKET_NAME` | `blog-assets` |
| `NEXT_PUBLIC_SITE_URL` | Your production domain (e.g., `https://yourname.github.io`) |

### 2. Enable Pages
Go to **Settings** -> **Pages**. Set **Source** to **GitHub Actions**.

Push your code to the `main` branch. The included workflow `.github/workflows/next-deploy.yml` will automatically build and deploy your site.

---

## 🤖 Automations (Optional)

### Supabase Keep-Alive & Fun Facts
The Supabase Free Tier pauses projects after 7 days of inactivity. This repository includes a GitHub Action to prevent this.

**Features:**
1.  Pings your database twice daily.
2.  Fetches a random **Dev Joke** or **Fun Fact**.
3.  Sends a beautiful status report to Discord.

**Setup:**
1.  Create a **Discord Webhook** (Channel Settings -> Integrations -> Webhooks).
2.  Add a GitHub Secret named `DISCORD_WEBHOOK_URL` with the webhook link.
3.  The workflow is located at `.github/workflows/keep-alive.yml` and runs automatically.

---

## 📂 Project Structure

```
├── src/
│   ├── components/
│   │   ├── admin/       # Dashboard, Finance, Tasks, CMS components
│   │   ├── ui/          # Reusable Shadcn UI primitives
│   │   └── ...          # Public components (Hero, Projects)
│   ├── lib/
│   │   ├── mock-data.ts # Fallback content for Static Mode
│   │   └── utils.ts     # Helpers (Date parsing, formatting)
│   ├── pages/           # Next.js Routes
│   │   ├── admin/       # Secure admin routes
│   │   └── ...          # Public routes
│   ├── store/           # Redux Logic (RTK Query API definitions)
├── db/                  # SQL Schema for Supabase
├── public/              # Static assets
└── ...config files
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the [MIT License](LICENSE).