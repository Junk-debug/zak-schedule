import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/zak-schedule",
  serverExternalPackages: ["pdfjs-dist"],
};

export default nextConfig;
