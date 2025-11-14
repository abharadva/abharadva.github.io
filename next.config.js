/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com'],
  },
  
  // For a user/organization GitHub Pages site like <username>.github.io,
  // the basePath and assetPrefix must be empty strings.
  basePath: '',
  assetPrefix: '',
};

module.exports = nextConfig;