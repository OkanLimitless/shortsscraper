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
};

module.exports = nextConfig; 