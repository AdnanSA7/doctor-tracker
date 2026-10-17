import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { bootstrapAdmin } from './utils/bootstrap.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  await bootstrapAdmin();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`[API Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
