/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.souseihaku.com',
        port: '',
        pathname: '/characters-large/**',
      },
      {
        protocol: 'https',
        hostname: 'www.souseihaku.com',
        port: '',
        pathname: '/characters/**',
      },
      {
        protocol: 'https',
        hostname: 'cdnimg-v2.gamekee.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
}
