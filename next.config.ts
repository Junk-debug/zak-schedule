import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.BASE_PATH || "",
  serverExternalPackages: ["pdfjs-dist"],
};

export default nextConfig;
