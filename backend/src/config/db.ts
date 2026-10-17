import mongoose from 'mongoose';

export function ensureMongoUri(uri: string): string {
  if (!uri) return 'mongodb+srv://saiyedadnansa_db_user:G9jUsmC12re2Ii8b@cluster0.knracxb.mongodb.net/doctor-tracker';
  const urlWithoutQuery = uri.split('?')[0];
  const parts = urlWithoutQuery.split('/');
  if (parts.length <= 3 || (parts.length === 4 && parts[3] === '')) {
    return uri.replace(/\/?(\?|$)/, '/doctor-tracker$1');
  }
  return uri;
}

export async function connectDB(uri?: string): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const rawUri = uri || process.env.MONGODB_URI || 'mongodb+srv://saiyedadnansa_db_user:G9jUsmC12re2Ii8b@cluster0.knracxb.mongodb.net/doctor-tracker';
  const mongoUri = ensureMongoUri(rawUri);
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // Increased for Vercel serverless cold starts
      bufferCommands: false,           // Don't buffer commands in serverless
    });
    console.log(`MongoDB connected successfully to ${mongoUri.replace(/:([^@]+)@/, ':***@')}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
