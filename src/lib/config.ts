interface AppConfig {
  admin: {};
  mfa: {
    appName: string;
    issuer: string;
  };
  site: {
    title: string;
    description: string;
    url: string;
    defaultOgImage: string;
    author: string;
    twitterHandle?: string;
  };
  supabase: {
    url: string;
    anonKey: string;
    bucketName: string;
  };
  session: {
    maxAge: number;
  };
}

export const config: AppConfig = {
  admin: {},
  mfa: {
    appName: process.env.NEXT_PUBLIC_APP_NAME || "MyPortfolioAdmin",
    issuer: process.env.NEXT_PUBLIC_MFA_ISSUER || "MyPortfolio",
  },
  site: {
    title: process.env.NEXT_PUBLIC_SITE_TITLE || "Akshay Bharadva - Portfolio",
    description:
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
      "A modern portfolio website with blog functionality, built by Akshay Bharadva.",
    url:
      process.env.NEXT_PUBLIC_SITE_URL || "https://akshay-bharadva.github.io",
    defaultOgImage: `${process.env.NEXT_PUBLIC_SITE_URL || "https://akshay-bharadva.github.io"}/default-og-image.png`,
    author: "Akshay Bharadva",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    bucketName: process.env.NEXT_PUBLIC_BUCKET_NAME || "blog-assets",
  },
  session: {
    maxAge: 24 * 60 * 60 * 1000,
  },
};

if (!config.supabase.url) {
  console.warn(
    "Supabase URL is not configured. Please set NEXT_PUBLIC_SUPABASE_URL.",
  );
}
if (!config.supabase.anonKey) {
  console.warn(
    "Supabase Anon Key is not configured. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}