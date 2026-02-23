/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "amberdrive.aytips.com",
      },
    ],
  },
};

export default nextConfig;
