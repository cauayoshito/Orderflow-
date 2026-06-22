/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone output keeps the Docker runtime image small. On Vercel we let
  // the platform handle the output (Vercel sets the VERCEL env var at build).
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
