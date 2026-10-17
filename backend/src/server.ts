import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { bootstrapAdmin } from './utils/bootstrap.js';
import serverlessHttp from 'serverless-http';

const PORT = process.env.PORT || 5000;

let cachedHandler: ReturnType<typeof serverlessHttp> | null = null;

async function initServer() {
  await connectDB();
  await bootstrapAdmin();
  const app = createApp();
  return serverlessHttp(app);
}

// If running locally, start HTTP listener
if (!process.env.VERCEL) {
  initServer()
    .then(() => {
      const app = createApp();
      app.listen(PORT, () => {
        console.log(`[API Server] Running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
}

// Export default handler for Vercel Serverless Functions
export default async function handler(req: any, res: any) {
  if (!cachedHandler) {
    cachedHandler = await initServer();
  }
  return cachedHandler(req, res);
}
