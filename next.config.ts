import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cove uses Turbopack for dev (default in Next 16). The deposit-prep flow
  // runs the Cloak SDK inside a Node API route, not in the browser, so no
  // Buffer/process polyfills are needed in the client bundle.
  turbopack: {},
};

export default nextConfig;
