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
  const rawUri = uri || process.env.MONGODB_URI || 'mongodb+srv://saiyedadnansa_db_user:G9jUsmC12re2Ii8b@cluster0.knracxb.mongodb.net/doctor-tracker';
  const mongoUri = ensureMongoUri(rawUri);
  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected successfully to ${mongoUri}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
