/** @type {import('next').NextConfig} */
const removeImports = require("next-remove-imports")();

const nextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ["images.unsplash.com", "avatars.githubusercontent.com"],
  },
  basePath: "",
  assetPrefix: "",
};

module.exports = removeImports(nextConfig);