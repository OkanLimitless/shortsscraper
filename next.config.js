/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Removing swcMinify as it's causing issues
  trailingSlash: false,
  // Make sure PDF files in public directory are accessible
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },
  // Explicitly set webpack config to resolve aliases
  webpack: (config) => {
    return config;
  },
  // Ensure we can use the PDF template in public directory
  experimental: {
    // Remove appDir option as it's now default in Next.js 15+
  },
  // External packages that should be handled by the server
  serverExternalPackages: ["pdf-lib"]
};

module.exports = nextConfig; 