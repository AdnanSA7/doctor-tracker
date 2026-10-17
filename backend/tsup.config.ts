import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['cjs'],
  outDir: 'dist',
  target: 'node18',
  sourcemap: false,
  clean: true,
  // Bundle everything including workspace packages into a single file
  // so Vercel doesn't need to resolve workspace symlinks
  noExternal: ['@doctor-tracker/shared'],
  external: [
    // Keep these as external (available in Vercel's Node.js runtime)
    'mongoose',
    'express',
    'bcrypt',
    'jsonwebtoken',
    'cors',
    'helmet',
    'morgan',
    'dotenv',
    'express-session',
    'connect-mongo',
    'express-rate-limit',
    'cookie-parser',
    'serverless-http',
    'zod',
  ],
});
