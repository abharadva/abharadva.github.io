/** @type {import('next').NextConfig} */

// This line dynamically gets the repository name from the GitHub Actions environment.
// It will be an empty string during local development, which is correct.
const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  
  // START: CRITICAL GITHUB PAGES CONFIGURATION
  // basePath tells Next.js's router that all pages are under this path.
  // E.g., '/admin/login' becomes '/<repo-name>/admin/login'.
  basePath: repoName ? `/${repoName}` : '',

  // assetPrefix tells Next.js where to load its assets (JS, CSS) from.
  assetPrefix: repoName ? `/${repoName}/` : '/',
  // END: CRITICAL GITHUB PAGES CONFIGURATION
};

module.exports = nextConfig;