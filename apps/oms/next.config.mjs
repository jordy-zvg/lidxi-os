/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@lidxi/db',
    '@lidxi/integrations',
    '@lidxi/printing',
    '@lidxi/shared',
    '@lidxi/tokens',
    '@lidxi/ui',
  ],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
