# Personal Portfolio

This repository contains the source code for my personal portfolio and blog, completely redesigned with a minimalist dark theme. It's a full-stack application built with Next.js and Supabase, featuring a comprehensive, secure admin panel for content management.

---

## 🚀 Key Features

### Public-Facing Site

- **Minimalist Dark Theme:** A sleek, modern design built with Tailwind CSS and shadcn/ui.
- **Kinetic Typography:** Engaging animated headings on the homepage for a dynamic first impression.
- **Fully Responsive:** Optimized for all devices, from mobile phones to desktops.
- **Interactive Project Showcase:** An elegant project list with hover-to-preview image effects.
- **Dynamic Content Sections:** "Work Experience," "Tech Stack," and "Tools" sections are all dynamically populated from the CMS.
- **Full-Featured Blog:**
  - Clean, readable article layout using Tailwind Prose.
  - Reading progress bar for long articles.
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
  - Manage all public-facing portfolio sections ("Experience," "Projects," "Services," etc.).
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
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Edge Functions)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI)
- **Animation:** [Framer Motion](https://www.framer.com/motion/)
- **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
- **Markdown:** [ReactMarkdown](https://github.com/remarkjs/react-markdown)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Deployment:** GitHub Pages (for static export) / Vercel

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
│   │   └── ...         # Public-facing pages (home, about, work)
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

    - In the root of the project, create a new file named `.env`.
    - Copy the contents of `.env.example` (if provided) or add the following, replacing the values with your Supabase credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
    NEXT_PUBLIC_BUCKET_NAME=blog-assets
    NEXT_PUBLIC_SITE_URL=http://localhost:8888
    ```

3.  **Run SQL Setup Scripts:**

    - Navigate to the **SQL Editor** in your Supabase dashboard.
    - Click **+ New query**.
    - Copy the entire SQL script from the `supabase.md` file in this repository and paste it into the SQL editor.
    - Click **Run**. This will create all the necessary tables, policies (RLS), triggers, and functions.

4.  **Create Storage Bucket:**

    - Navigate to **Storage** in your Supabase dashboard.
    - Click **Create a new bucket**.
    - Enter the bucket name you defined in your `.env` file (e.g., `blog-assets`).
    - Toggle **Public bucket** to ON.
    - Click **Create bucket**. The RLS policies from the SQL script will automatically apply.

5.  **Enable MFA:**
    - Navigate to **Authentication** > **Settings** > **MFA**.
    - Enable **TOTP**.

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8888`.

---

## 🔑 Accessing the Admin Panel

1.  **Navigate to the Login Page:** Go to `http://localhost:8888/admin/login`.
2.  **Create Your Admin Account:** Since this is a new setup, you don't have a user yet. **Use the sign-up form on the login page** to create your admin account. Supabase will send a confirmation email.
3.  **Confirm Your Email:** Click the link in the confirmation email.
4.  **First Login & MFA Setup:**
    - Log in again with your new credentials.
    - You will be automatically redirected to the MFA setup page (`/admin/setup-mfa`).
    - Scan the QR code with your authenticator app (e.g., Google Authenticator, Authy).
    - Enter the 6-digit code to verify and complete the setup.
    - You will be redirected to the admin dashboard.
5.  **Subsequent Logins:** For all future logins, you will be prompted to enter an MFA code after your password.

---

## 🚀 Deployment to GitHub Pages

This guide explains how to deploy the portfolio as a static site to GitHub Pages using GitHub Actions.

### 1. Configure `next.config.js`

Ensure your `next.config.js` is set up for static export. The following settings are required:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true, // Important for GitHub Pages routing
  images: {
    unoptimized: true, // Required for next/export
  },
};

module.exports = nextConfig;
```

### 2. Add Environment Variables to GitHub

To allow GitHub Actions to build your site, you must add your Supabase credentials as repository secrets.

1.  Go to your GitHub repository.
2.  Click on **Settings** > **Secrets and variables** > **Actions**.
3.  Click **New repository secret** for each of the following variables from your `.env` file:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `NEXT_PUBLIC_BUCKET_NAME`
    - `NEXT_PUBLIC_SITE_URL` (Set this to your public GitHub Pages URL, e.g., `https://your-username.github.io/your-repo-name`)

### 3. Create the GitHub Actions Workflow

1.  In your repository, create a directory path: `.github/workflows/`.
2.  Inside `workflows`, create a new file named `deploy.yml`.
3.  Paste the following code into `deploy.yml`:

```yaml
name: Deploy Next.js site to Pages

on:
  # Runs on pushes targeting the default branch
  push:
    branches: ["main"]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Detect package manager
        id: detect-package-manager
        run: |
          if [ -f "${{ github.workspace }}/yarn.lock" ]; then
            echo "manager=yarn" >> $GITHUB_OUTPUT
            echo "command=install" >> $GITHUB_OUTPUT
            echo "runner=yarn" >> $GITHUB_OUTPUT
            exit 0
          elif [ -f "${{ github.workspace }}/package.json" ]; then
            echo "manager=npm" >> $GITHUB_OUTPUT
            echo "command=ci" >> $GITHUB_OUTPUT
            echo "runner=npx --no-install" >> $GITHUB_OUTPUT
            exit 0
          else
            echo "Unable to determine package manager"
            exit 1
          fi
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: ${{ steps.detect-package-manager.outputs.manager }}
      - name: Setup Pages
        uses: actions/configure-pages@v4
        with:
          static_site_generator: next
      - name: Restore cache
        uses: actions/cache@v4
        with:
          path: |
            .next/cache
          key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json', '**/yarn.lock') }}-${{ hashFiles('**.[jt]s', '**.[jt]sx') }}
          restore-keys: |
            ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json', '**/yarn.lock') }}-
      - name: Install dependencies
        run: ${{ steps.detect-package-manager.outputs.manager }} ${{ steps.detect-package-manager.outputs.command }}

      - name: Create .env file
        run: |
          echo "NEXT_PUBLIC_SUPABASE_URL=${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}" >> .env
          echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}" >> .env
          echo "NEXT_PUBLIC_BUCKET_NAME=${{ secrets.NEXT_PUBLIC_BUCKET_NAME }}" >> .env
          echo "NEXT_PUBLIC_SITE_URL=${{ secrets.NEXT_PUBLIC_SITE_URL }}" >> .env

      - name: Build with Next.js
        run: ${{ steps.detect-package-manager.outputs.runner }} next build
      - name: Static HTML export with Next.js
        run: ${{ steps.detect-package-manager.outputs.runner }} next export
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 4. Enable GitHub Pages

After you push these changes to your `main` branch, the deployment action will run for the first time.

1.  Wait for the `Deploy Next.js site to Pages` action to complete successfully.
2.  In your GitHub repository, go to **Settings** > **Pages**.
3.  Under **Build and deployment**, set the **Source** to **GitHub Actions**.
4.  GitHub will automatically detect the artifact and deploy it.

Your site will be deployed and available at the URL shown on the Pages settings page.

---

## 📜 Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Creates a production build of the application.
- `npm run start`: Starts the production server (after building).
- `npm run lint`: Runs the ESLint linter.
- `npm run export`: Exports the application to static HTML, which can be deployed anywhere.
- `npm run format`: Formats all code using Prettier.
