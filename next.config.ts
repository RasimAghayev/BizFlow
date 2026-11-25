import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Standalone output: the runtime image copies only .next/standalone
  // instead of the full node_modules tree (Docker standard: slim runtime,
  // no dev tooling). See docs/BASELINE.md for the measured size delta.
  output: 'standalone',
};

export default nextConfig;
