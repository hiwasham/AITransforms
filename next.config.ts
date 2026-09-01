import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Without this Next infers /root as the workspace root (it finds /root/package-lock.json)
  // and scans the whole home directory, which makes dev compiles hang.
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ['89.167.19.64', '100.93.250.79'],
};

export default nextConfig;
