/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@lidxi/db',
    '@lidxi/integrations',
    '@lidxi/shared',
    '@lidxi/tokens',
    '@lidxi/ui',
  ],
  experimental: {
    typedRoutes: true,
  },
  async rewrites() {
    // Multi-tenant por dominio: miztli.mx (y su www) resuelven a /miztli/...
    // sin que el slug aparezca en la URL del usuario. Agrega aquí los dominios
    // adicionales conforme se onboarden nuevos clientes.
    return {
      beforeFiles: [
        {
          source: '/:path*',
          has: [{ type: 'host', value: '(www\\.)?miztli\\.mx' }],
          destination: '/miztli/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
