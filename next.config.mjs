import "dotenv/config";

const nextConfig = {
  reactStrictMode: true,
  env: {
    COLLECTION_ADDRESS: process.env.COLLECTION_ADDRESS,
  },
};

export default nextConfig;
