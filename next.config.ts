import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  typedRoutes: true,
  turbopack: {
    root: path.join(__dirname),
  },
};

export default withNextIntl(nextConfig);
