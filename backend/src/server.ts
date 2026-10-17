import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { bootstrapAdmin } from './utils/bootstrap.js';
import serverless from 'serverless-http';

const PORT = process.env.PORT || 5000;

let cachedHandler: any;

async function initServer() {
  await connectDB();
  await bootstrapAdmin();
  const app = createApp();
  return serverless(app);
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
    });
}

// Export default handler for Vercel Serverless
export default async function handler(req: any, res: any) {
  if (!cachedHandler) {
    cachedHandler = await initServer();
  }
  return cachedHandler(req, res);
}
