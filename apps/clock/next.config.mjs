/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@lidxi/db', '@lidxi/shared', '@lidxi/tokens', '@lidxi/ui'],
};

export default nextConfig;
