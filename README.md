# Personal Portfolio & Headless CMS

This repository contains the source code for a comprehensive personal portfolio and blog, architected as a full-stack application using Next.js for the frontend and Supabase as a headless backend. It features a minimalist, responsive public-facing site and a secure, feature-rich admin panel for complete content and personal management.

 <!-- It's highly recommended to add a preview image of your site -->

---

## 🚀 Key Features

### Public-Facing Website

- **Modern & Responsive:** A sleek, minimalist dark theme built with Tailwind CSS and shadcn/ui, optimized for all screen sizes.
- **Dynamic Content:** All sections—including Work Experience, Tech Stack, Projects, and custom pages—are dynamically populated from the CMS.
- **Full-Featured Blog:** Clean, readable articles with server-side rendering for SEO, view counters, and tag-based organization.
- **Engaging UI/UX:** Features kinetic typography on the homepage and elegant hover effects for a polished user experience.
- **GitHub Integration:** An "Open Source" section automatically fetches and displays public repositories from a specified GitHub account.

### 🔐 Admin Panel & CMS

- **Secure Authentication:** Powered by Supabase Auth with mandatory Two-Factor Authentication (MFA/TOTP) for robust admin access.
- **Central Dashboard:** An at-a-glance overview of key metrics: monthly finances, task progress, total notes, and blog views.
- **Comprehensive CMS:**
  - Manage all public-facing content sections across multiple pages (`/`, `/about`, `/contact`, etc.).
  - Create, update, and reorder sections (Markdown, List Items, Galleries) with drag-and-drop.
  - Full CRUD functionality for all portfolio items within sections.
- **Blog Manager:**
  - Advanced Markdown editor with live preview, syntax highlighting, and integrated image uploads.
  - On-the-fly image compression (to WEBP) and cloud storage via Supabase Storage.
  - Manage post metadata: slugs, tags, excerpts, and publish status.
- **Personal Management Suite:**
  - **Task Manager:** Kanban-style board with sub-tasks, priorities, and due dates.
  - **Finance Tracker:** Log earnings/expenses, manage recurring transactions, and view monthly/yearly analytics with charts. Includes a 30-day cash flow forecast.
  - **Knowledge Hub:** A system to track learning progress on subjects and topics, complete with session tracking and a GitHub-style activity heatmap.
  - **Notes Manager:** A simple, effective tool for personal notes with pinning functionality.

---

## 🛠️ Tech Stack & Architecture

This project is built with a modern, scalable tech stack focused on developer experience and performance.

- **Framework:** [Next.js](https://nextjs.org/) (React) with TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) for components.
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) with **RTK Query** for centralized state and efficient, cached data fetching.
- **Animation:** [Framer Motion](https://www.framer.com/motion/)
- **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation
- **Charts & Calendar:** [Recharts](https://recharts.org/) & [FullCalendar](https://fullcalendar.io/)
- **Deployment:** Configured for static export to [GitHub Pages](https://pages.github.com/) via GitHub Actions.

### Architectural Overview

The application utilizes a sophisticated state management architecture with **RTK Query** at its core.

- **Centralized API Logic:** All interactions with the Supabase backend are defined declaratively in API "slices" (`publicApi.ts` for the public site, `adminApi.ts` for the admin panel). This removes data-fetching logic from components.
- **Automated Caching:** RTK Query provides intelligent, automatic caching of fetched data. This reduces redundant API calls, improves performance, and minimizes backend load.
- **Tag-Based Re-validation:** The system uses a tagging mechanism to automatically re-fetch data when related information is mutated. For example, adding a new blog post automatically invalidates the "posts" tag, causing any component displaying the post list to update without manual intervention.
- **Client State Management:** For non-API state, such as the learning session timer, standard Redux slices are used to manage state predictably.

---

## ⚙️ Local Setup & Installation

Follow these steps to get the project running on your local machine.

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A free [Supabase](https://supabase.com/) account.

### 2. Clone and Install

```bash
git clone https://github.com/abharadva/abharadva.github.io.git
cd abharadva.github.io
npm install
```

### 3. Supabase Configuration

This project requires a Supabase backend. For a complete, step-by-step guide on setting up your project, tables, and authentication, please refer to the detailed **[Supabase Setup Guide](./supabase.md)**.

### 4. Environment Variables

After setting up your Supabase project, create a new file named `.env.local` in the root directory. Copy the contents of `.env.example` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
NEXT_PUBLIC_BUCKET_NAME=blog-assets
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 🔑 Accessing the Admin Panel

The admin panel is secure and does not have a public sign-up page.

1.  **Create Your User:** In your Supabase Dashboard, go to **Authentication** > **Users** and click **Add user**. Enter your email and a secure password.
2.  **Confirm Your Email:** Click the confirmation link sent to your email address.
3.  **Log In:** Navigate to `http://localhost:3000/admin/login` and sign in with your new credentials.
4.  **MFA Setup:** You will be automatically redirected to set up Two-Factor Authentication. Scan the QR code with an authenticator app (e.g., Google Authenticator, Authy) and verify the code to complete the setup. You will then be redirected to the admin dashboard.

---

## 🚀 Deployment

This project is configured for static export and deployment to **GitHub Pages** using GitHub Actions.

### 1. Repository Secrets

For GitHub Actions to build the site, you must add your Supabase credentials as repository secrets.

1.  In your GitHub repository, go to **Settings** > **Secrets and variables** > **Actions**.
2.  Click **New repository secret** for each of the following variables from your `.env.local` file:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `NEXT_PUBLIC_BUCKET_NAME`
    - `NEXT_PUBLIC_SITE_URL` (Set this to your public GitHub Pages URL, e.g., `https://your-username.github.io`)

### 2. Enable GitHub Pages

The workflow file at `.github/workflows/next-deploy.yml` is already configured.

1.  Push your code to the `main` branch. The deployment action will run automatically.
2.  In your GitHub repository, go to **Settings** > **Pages**.
3.  Under **Build and deployment**, set the **Source** to **GitHub Actions**.
4.  Once the action completes, your site will be live at the URL provided on this page.

---

## 📜 Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Creates a production-ready static build in the `./out` directory.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run format`: Formats all code using Prettier.
