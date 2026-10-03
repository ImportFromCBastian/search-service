import fs from 'node:fs'
import path from 'node:path'
import type { NextConfig } from 'next'

// Cargar variables de entorno centralizadas desde el .env de la raíz del monorepo
const rootEnvPath = fs.existsSync(path.resolve(process.cwd(), '.env'))
  ? path.resolve(process.cwd(), '.env')
  : path.resolve(process.cwd(), '../.env')

if (fs.existsSync(rootEnvPath) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(rootEnvPath)
}

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  transpilePackages: ['@search-service/shared'],
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_BACKEND_URL:
      process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000',
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:4000',
  },
}

export default nextConfig
