// src/lib/mock-data.ts

import type { SiteContent, PortfolioSection, BlogPost } from "@/types";

// --- 0. NAVIGATION (New) ---
export const MOCK_NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Showcase", href: "/showcase" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

// --- 1. GLOBAL IDENTITY (Header, Footer, Hero) ---
export const MOCK_SITE_IDENTITY: SiteContent = {
  portfolio_mode: "multi-page",
  profile_data: {
    name: "Demo User",
    title: "Full Stack Engineer",
    description:
      "I craft scalable, high-performance digital experiences with a focus on clean architecture and user empathy. (Running in Static Mode)",
    profile_picture_url: "https://github.com/shadcn.png",
    show_profile_picture: true,
    default_theme: "theme-blueprint",
    logo: {
      main: "DEMO",
      highlight: ".DEV",
    },
    status_panel: {
      show: true,
      title: "Current Status",
      availability: "Open for opportunities",
      currently_exploring: {
        title: "Learning",
        items: ["Rust", "WebAssembly", "Three.js"],
      },
      latestProject: {
        name: "Static Portfolio",
        linkText: "View Source",
        href: "https://github.com/abharadva/abharadva.github.io",
      },
    },
    bio: [
      "I'm a software engineer with a passion for building things that live on the internet. My journey began with a curiosity for how things work under the hood, which led me to dive deep into full-stack development.",
      "Today, I've had the privilege of working at a high-growth startup, a design agency, and huge corporation. My main focus these days is building accessible, inclusive products and digital experiences for a variety of clients.",
    ],
    github_projects_config: {
      username: "vercel",
      show: true,
      sort_by: "pushed",
      exclude_forks: true,
      exclude_archived: true,
      exclude_profile_repo: true,
      min_stars: 50,
      projects_per_page: 6,
    },
  },
  social_links: [
    {
      id: "github",
      label: "GitHub",
      url: "https://github.com",
      is_visible: true,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      url: "https://linkedin.com",
      is_visible: true,
    },
    {
      id: "email",
      label: "Email",
      url: "mailto:demo@example.com",
      is_visible: true,
    },
  ],
  footer_data: {
    copyright_text:
      "Designed & Built by [You](https://github.com). Running in **Static Mode**.",
  },
};

// --- 2. BLOG POSTS (For /blog) ---
export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "Architecture of a Static Portfolio",
    slug: "architecture-static-portfolio",
    excerpt:
      "How to build a robust portfolio that works without a database using Next.js and Static Site Generation.",
    content:
      "## The Power of Static\n\nIn an era of complex server-side rendering, sometimes simple is better. This portfolio uses a fallback mechanism to render content from a local JSON file when a database connection isn't available.\n\n### Key Benefits\n\n1.  **Zero Latency:** No DB roundtrips.\n2.  **Free Hosting:** Works on GitHub Pages.\n3.  **Security:** No attack surface for SQL injection.\n\n```typescript\n// Example Fallback Logic\nif (!supabase) return MOCK_DATA;\n```\n\nThis approach allows developers to fork the repo and have a working site immediately.",
    published: true,
    published_at: new Date().toISOString(),
    show_toc: true,
    tags: ["Next.js", "Architecture", "SSG"],
    views: 1250,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Mastering TypeScript Generics",
    slug: "mastering-typescript-generics",
    excerpt:
      "A practical guide to using Generics to create reusable and type-safe components in React.",
    content:
      "## Why Generics?\n\nGenerics allow you to write flexible, reusable code while maintaining strict type safety. Instead of using `any`, you can capture the type passed in.\n\n> \"Type safety is not just about preventing bugs, it's about documenting intent.\"\n\n### Use Case: A Generic List Component\n\nImagine you need a list that renders users, products, or todo items...",
    published: true,
    published_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    show_toc: false,
    tags: ["TypeScript", "Development"],
    views: 843,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "The Future of Web Styling",
    slug: "future-web-styling",
    excerpt:
      "Comparing Tailwind CSS, CSS-in-JS, and zero-runtime solutions like Panda CSS.",
    content: "CSS has evolved...",
    published: true,
    published_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    show_toc: false,
    tags: ["CSS", "Design"],
    views: 404,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// --- 3. SECTIONS (For Home, About, Showcase, Projects, Contact) ---
export const MOCK_SECTIONS: PortfolioSection[] = [
  // --- HOME PAGE (/) ---
  {
    id: "home-exp",
    title: "Experience",
    type: "list_items",
    page_path: "/",
    layout_style: "timeline",
    is_visible: true,
    display_order: 1,
    portfolio_items: [
      {
        id: "e1",
        section_id: "home-exp",
        title: "Senior Full Stack Engineer",
        subtitle: "TechGiant Corp",
        date_from: "2022",
        date_to: "Present",
        description:
          "Leading the migration of a legacy monolith to a microservices architecture. Improved CI/CD pipeline efficiency by 40%. Mentoring junior developers and defining coding standards.",
        tags: ["React", "Node.js", "AWS", "Docker"],
      },
      {
        id: "e2",
        section_id: "home-exp",
        title: "Software Developer",
        subtitle: "Creative Agency",
        date_from: "2019",
        date_to: "2022",
        description:
          "Developed high-fidelity frontend interfaces for Fortune 500 clients. Collaborated closely with designers to ensure pixel-perfect implementation of UI/UX designs.",
        tags: ["Vue.js", "GSAP", "Shopify"],
      },
      {
        id: "e3",
        section_id: "home-exp",
        title: "Junior Developer",
        subtitle: "StartUp Inc",
        date_from: "2018",
        date_to: "2019",
        description:
          "Assisted in backend API development and database optimization. Built internal tools to automate reporting processes.",
        tags: ["Python", "Django", "PostgreSQL"],
      },
    ],
  },
  {
    id: "home-tech",
    title: "Tech Stack",
    type: "list_items",
    page_path: "/",
    layout_style: "default",
    is_visible: true,
    display_order: 2,
    portfolio_items: [
      {
        id: "t1",
        section_id: "home-tech",
        title: "React / Next.js",
        description: "Component Architecture, SSR, Hooks",
        link_url: "https://nextjs.org",
      },
      {
        id: "t2",
        section_id: "home-tech",
        title: "TypeScript",
        description: "Static Typing, Interface Design",
        link_url: "https://typescriptlang.org",
      },
      {
        id: "t3",
        section_id: "home-tech",
        title: "Node.js",
        description: "REST APIs, GraphQL, Serverless",
      },
      {
        id: "t4",
        section_id: "home-tech",
        title: "PostgreSQL",
        description: "Database Design, SQL, Supabase",
      },
      {
        id: "t5",
        section_id: "home-tech",
        title: "Tailwind CSS",
        description: "Responsive Design, Design Systems",
      },
      {
        id: "t6",
        section_id: "home-tech",
        title: "Docker",
        description: "Containerization, Devops",
      },
    ],
  },
  {
    id: "home-tools",
    title: "Tools",
    type: "list_items",
    page_path: "/",
    layout_style: "default",
    is_visible: true,
    display_order: 3,
    portfolio_items: [
      {
        id: "tool1",
        section_id: "home-tools",
        title: "VS Code",
        description: "My daily driver. Heavily customized with Vim bindings.",
      },
      {
        id: "tool2",
        section_id: "home-tools",
        title: "Figma",
        description: "For UI prototyping and asset management.",
      },
      {
        id: "tool3",
        section_id: "home-tools",
        title: "Warp",
        description: "A blazingly fast, Rust-based terminal.",
      },
      {
        id: "tool4",
        section_id: "home-tools",
        title: "Obsidian",
        description: "Knowledge base and second brain.",
      },
    ],
  },

  // --- SHOWCASE PAGE (/showcase) ---
  {
    id: "showcase-deep",
    title: "Deep Dives",
    type: "list_items",
    page_path: "/showcase",
    layout_style: "grid-2-col",
    is_visible: true,
    display_order: 1,
    portfolio_items: [
      {
        id: "sc1",
        section_id: "showcase-deep",
        title: "System Design: Scalable Chat App",
        description:
          "A breakdown of how I architected a real-time chat application handling 10k concurrent connections using WebSockets and Redis Pub/Sub.",
        link_url: "#",
        tags: ["System Design", "Backend"],
      },
      {
        id: "sc2",
        section_id: "showcase-deep",
        title: "UI Engineering: The Data Grid",
        description:
          "Building a performant data grid component from scratch. Virtualization, sorting, filtering, and keyboard navigation.",
        link_url: "#",
        tags: ["Frontend", "Performance"],
      },
      {
        id: "sc3",
        section_id: "showcase-deep",
        title: "DevOps: Zero Downtime Deployments",
        description:
          "Implementing blue/green deployment strategies using Kubernetes and GitHub Actions.",
        link_url: "#",
        tags: ["DevOps", "K8s"],
      },
      {
        id: "sc4",
        section_id: "showcase-deep",
        title: "Accessibility Audit",
        description:
          "Case study on remediating a legacy application to meet WCAG 2.1 AA standards.",
        link_url: "#",
        tags: ["A11y", "Audit"],
      },
    ],
  },

  // --- ABOUT PAGE (/about) ---
  {
    id: "about-edu",
    title: "Education",
    type: "list_items",
    page_path: "/about",
    layout_style: "timeline",
    is_visible: true,
    display_order: 1,
    portfolio_items: [
      {
        id: "edu1",
        section_id: "about-edu",
        title: "B.S. Computer Science",
        subtitle: "University of Technology",
        date_from: "2014",
        date_to: "2018",
        description:
        "Graduated with Honors. Specialized in Distributed Systems and Artificial Intelligence. Capstone project focused on neural networks.",
      },
    ],
  },
  
  {
    id: "home-exp",
    title: "Experience",
    type: "list_items",
    page_path: "/about",
    layout_style: "timeline",
    is_visible: true,
    display_order: 1,
    portfolio_items: [
      {
        id: "e1",
        section_id: "home-exp",
        title: "Senior Full Stack Engineer",
        subtitle: "TechGiant Corp",
        date_from: "2022",
        date_to: "Present",
        description:
          "Leading the migration of a legacy monolith to a microservices architecture. Improved CI/CD pipeline efficiency by 40%. Mentoring junior developers and defining coding standards.",
        tags: ["React", "Node.js", "AWS", "Docker"],
      },
      {
        id: "e2",
        section_id: "home-exp",
        title: "Software Developer",
        subtitle: "Creative Agency",
        date_from: "2019",
        date_to: "2022",
        description:
          "Developed high-fidelity frontend interfaces for Fortune 500 clients. Collaborated closely with designers to ensure pixel-perfect implementation of UI/UX designs.",
        tags: ["Vue.js", "GSAP", "Shopify"],
      },
      {
        id: "e3",
        section_id: "home-exp",
        title: "Junior Developer",
        subtitle: "StartUp Inc",
        date_from: "2018",
        date_to: "2019",
        description:
          "Assisted in backend API development and database optimization. Built internal tools to automate reporting processes.",
        tags: ["Python", "Django", "PostgreSQL"],
      },
    ],
  },

  // --- PROJECTS PAGE (/projects) ---
  {
    id: "projects-featured",
    title: "Featured Projects",
    type: "list_items",
    page_path: "/projects",
    layout_style: "feature-alternating",
    is_visible: true,
    display_order: 1,
    portfolio_items: [
      {
        id: "p1",
        section_id: "projects-featured",
        title: "SaaS Analytics Dashboard",
        subtitle: "Full Stack Application",
        description:
          "A comprehensive analytics platform for e-commerce businesses. Features include real-time data visualization, automated reporting, and customer segmentation AI.\n\n[View Source on GitHub](https://github.com)",
        tags: ["Next.js", "Tremor", "Postgres", "Stripe"],
        link_url: "https://github.com",
        image_url:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
      },
      {
        id: "p2",
        section_id: "projects-featured",
        title: "AI Content Studio",
        subtitle: "GenAI Tool",
        description:
          "An experimental tool leveraging OpenAI's GPT-4 to assist copywriters. Includes a custom rich-text editor and prompt engineering templates.\n\n[View Source on GitHub](https://github.com)",
        tags: ["OpenAI API", "React", "Tailwind"],
        link_url: "https://github.com",
        image_url:
          "https://images.unsplash.com/photo-1675557009875-436f527c3b9b?q=80&w=2670&auto=format&fit=crop",
      },
    ],
  },

  // --- CONTACT PAGE (/contact) ---
  {
    id: "contact-services",
    title: "Services",
    type: "list_items",
    page_path: "/contact",
    layout_style: "default",
    is_visible: true,
    display_order: 1,
    portfolio_items: [
      {
        id: "s1",
        section_id: "contact-services",
        title: "Web Development",
        subtitle: "Frontend & Backend",
        description:
          "Building responsive, high-performance web applications from scratch or improving existing ones.",
        tags: ["React", "Node.js", "Performance"],
      },
      {
        id: "s2",
        section_id: "contact-services",
        title: "Technical Consulting",
        subtitle: "Architecture & Strategy",
        description:
          "Advising on tech stack selection, system architecture, and best practices for scalability.",
        tags: ["Architecture", "Cloud", "Security"],
      },
      {
        id: "s3",
        section_id: "contact-services",
        title: "Code Audits",
        subtitle: "Quality Assurance",
        description:
          "Reviewing codebases for security vulnerabilities, performance bottlenecks, and maintainability issues.",
        tags: ["Security", "Optimization"],
      },
    ],
  },
];