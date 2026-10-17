import bcrypt from 'bcrypt';
import { Admin } from '../models/Admin.js';
import { seedDemoData } from './seed.js';

export async function bootstrapAdmin(): Promise<void> {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const name = process.env.SEED_ADMIN_NAME || 'System Administrator';
      const email = process.env.SEED_ADMIN_EMAIL || 'admin@doctortracker.com';
      const password = process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123!';

      const passwordHash = await bcrypt.hash(password, 12);
      await Admin.create({
        name,
        email,
        passwordHash,
        role: 'admin',
        isActive: true,
      });
      console.log(`[Bootstrap] Initial admin created successfully: ${email}`);
    }

    await seedDemoData();
  } catch (error) {
    console.error('[Bootstrap] Error creating initial admin:', error);
  }
}
