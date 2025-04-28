/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "minio.mausvil.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;