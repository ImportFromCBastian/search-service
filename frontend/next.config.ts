import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  transpilePackages: ['@search-service/shared'],
  reactCompiler: true,
}

export default nextConfig
