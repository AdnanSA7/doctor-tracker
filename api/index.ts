import dotenv from 'dotenv';
dotenv.config();

import { createApp } from '../backend/src/app.js';
import { connectDB } from '../backend/src/config/db.js';
import { bootstrapAdmin } from '../backend/src/utils/bootstrap.js';
import serverless from 'serverless-http';

let isConnected = false;

async function getHandler() {
  if (!isConnected) {
    await connectDB();
    await bootstrapAdmin();
    isConnected = true;
  }
  const app = createApp();
  return serverless(app);
}

export default async function handler(req: any, res: any) {
  const h = await getHandler();
  return h(req, res);
}
