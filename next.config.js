/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.apimo.pro" },
      { protocol: "https", hostname: "**.apimo.com" },
      { protocol: "https", hostname: "ebimmo.com" },
    ],
  },
};

module.exports = nextConfig;
