
# Personal Portfolio

This repository contains the source code for my personal portfolio and blog, completely redesigned with a neo-brutalist theme. It's a full-stack application built with Next.js and Supabase, featuring a comprehensive, secure admin panel for content management.

---

## 🚀 Key Features

### Public-Facing Site

- **Neo-Brutalist Theme:** A high-contrast, raw design with thick borders, hard shadows, and a monospaced font, built with Tailwind CSS and shadcn/ui.
- **Kinetic Typography:** Engaging animated headings on the homepage for a dynamic first impression.
- **Fully Responsive:** Optimized for all devices, from mobile phones to desktops.
- **Dynamic Content Sections:** All content sections like "Work Experience," "Tech Stack," and "Tools" are dynamically populated from the CMS.
- **Full-Featured Blog:**
  - Utilitarian, readable article layout with styled code blocks.
  - Server-side rendering (SSR) for fast loads and SEO.
  - View counter for posts.

### 🔐 Admin Panel

- **Secure Authentication:**
  - Email/Password login powered by Supabase Auth.
  - **Mandatory Two-Factor Authentication (MFA/TOTP)** for admin access, ensuring high security.
- **Comprehensive Dashboard:**
  - At-a-glance statistics: Monthly earnings/expenses, task progress, total notes, and blog views.
  - Quick access to recently updated blog posts and pinned notes.
- **Content Management System (CMS):**
  - Manage all public-facing portfolio sections.
  - Drag-and-drop reordering for sections.
  - CRUD (Create, Read, Update, Delete) functionality for all portfolio items.
- **Blog Manager:**
  - Full CRUD for blog posts.
  - Advanced Markdown editor with live preview and image upload support.
  - Image compression and conversion to WEBP on upload.
  - Manage tags, slugs, excerpts, and publish status.
- **Personal Management Tools:**
  - **Task Manager:** A Kanban-style board to track tasks with sub-task support, priorities, and due dates.
  - **Notes Manager:** A simple, effective tool for personal notes with pinning functionality.
  - **Finance Tracker:** Log earnings and expenses and view monthly/yearly summaries.
- **Security Settings:**
  - Manage MFA authenticators.
  - Securely change the admin account password.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI), heavily customized for neo-brutalism.
- **Animation:** [Framer Motion](https://www.framer.com/motion/)
- **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
- **Markdown:** [ReactMarkdown](https://github.com/remarkjs/react-markdown)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Deployment:** Vercel, Netlify, or any static host (GitHub Pages for static export)

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
│   │   ├── api/        # API routes (not used for static export)
│   │   ├── blog/       # Blog index and [slug] pages
│   │   └── ...         # Public-facing pages (home, about, etc.)
│   ├── styles/         # Global CSS and Tailwind setup
│   ├── supabase/       # Supabase client configuration
│   └── types/          # TypeScript type definitions
├── public/             # Static assets (images, fonts, favicons)
├── supabase.md         # SQL scripts for database setup
└── ...                 # Config files (next.config.js, tailwind.config.js, etc.)
```

---

## ⚙️ Local Setup & Installation

Follow these steps to get the project running on your local machine.

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

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

1.  **Create a Supabase Project:**
    - Go to [supabase.com](https://supabase.com) and create a new project.
    - Once created, navigate to **Project Settings** > **API**.
    - Find your **Project URL** and **`anon`, `public` key**.

2.  **Create Environment File:**
    - In the root of the project, create a new file named `.env.local`.
    - Add the following, replacing the values with your Supabase credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
    NEXT_PUBLIC_BUCKET_NAME=blog-assets
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ```

3.  **Run SQL Setup Scripts:**
    - Navigate to the **SQL Editor** in your Supabase dashboard.
    - Click **+ New query**.
    - Copy the entire SQL script from the `supabase.md` file in this repository and paste it into the SQL editor.
    - Click **Run**. This will create all the necessary tables, policies (RLS), triggers, and functions.

4.  **Create Storage Bucket:**
    - Navigate to **Storage** in your Supabase dashboard.
    - Click **Create a new bucket**.
    - Enter the bucket name you defined in your `.env.local` file (e.g., `blog-assets`).
    - Toggle **Public bucket** to ON.
    - Click **Create bucket**. The RLS policies from the SQL script will automatically apply.

5.  **Enable MFA:**
    - Navigate to **Authentication** > **Settings** > **MFA**.
    - Enable **TOTP**.

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 🔑 Accessing the Admin Panel

1.  **Navigate to the Login Page:** Go to `http://localhost:3000/admin/login`.
2.  **Create Your Admin Account:** Since Supabase Auth doesn't have a sign-up form by default, you need to add your user manually.
    - In your Supabase dashboard, go to **Authentication** > **Users**.
    - Click **Create user**.
    - Enter your email and a strong password. The user will be created and confirmed automatically.
3.  **First Login & MFA Setup:**
    - Log in with your new credentials.
    - You will be automatically redirected to the MFA setup page (`/admin/setup-mfa`).
    - Scan the QR code with your authenticator app (e.g., Google Authenticator, Authy).
    - Enter the 6-digit code to verify and complete the setup.
    - You will be redirected to the admin dashboard.
4.  **Subsequent Logins:** For all future logins, you will be prompted to enter an MFA code after your password.