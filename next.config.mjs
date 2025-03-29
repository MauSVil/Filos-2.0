/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "filos-imagenes.s3.us-west-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "filos-develop.s3.us-west-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;