import bcrypt from 'bcrypt';
import { Admin } from '../models/Admin.js';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';

export async function seedDemoData(): Promise<void> {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123!', 12);
      await Admin.create({
        name: process.env.SEED_ADMIN_NAME || 'System Administrator',
        email: process.env.SEED_ADMIN_EMAIL || 'admin@doctortracker.com',
        passwordHash,
        role: 'admin',
        isActive: true,
      });

      await Admin.create({
        name: 'Hospital Manager',
        email: 'manager@doctortracker.com',
        passwordHash,
        role: 'manager',
        isActive: true,
      });
      console.log('[Seed] Default administrators created.');
    }

    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      const doctorsData = [
        { name: 'Dr. Jane Smith', specialization: 'Cardiology', hospital: 'City General Hospital', phone: '+1-555-0191', email: 'jane.smith@hospital.com' },
        { name: 'Dr. Robert Chen', specialization: 'Neurology', hospital: 'St. Jude Medical Center', phone: '+1-555-0192', email: 'robert.chen@hospital.com' },
        { name: 'Dr. Emily Davis', specialization: 'Pediatrics', hospital: 'Childrens Hospital', phone: '+1-555-0193', email: 'emily.davis@hospital.com' },
        { name: 'Dr. Michael Johnson', specialization: 'Orthopedics', hospital: 'Metro Health Institute', phone: '+1-555-0194', email: 'michael.johnson@hospital.com' },
        { name: 'Dr. Sarah Wilson', specialization: 'Dermatology', hospital: 'Valley Medical Plaza', phone: '+1-555-0195', email: 'sarah.wilson@hospital.com' },
      ];

      const createdDoctors = await Doctor.insertMany(doctorsData);
      console.log(`[Seed] Created ${createdDoctors.length} demo doctors.`);

      const conditions = ['Hypertension', 'Type 2 Diabetes', 'Asthma', 'Migraine', 'Arthritis', 'Eczema', 'Bronchitis', 'Anxiety'];
      const genders = ['Male', 'Female', 'Other'];
      const firstNames = ['John', 'Mary', 'James', 'Patricia', 'Robert', 'Jennifer', 'William', 'Linda', 'David', 'Elizabeth', 'Richard', 'Barbara', 'Joseph', 'Susan', 'Thomas'];
      const lastNames = ['Doe', 'Smith', 'Johnson', 'Brown', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Lee', 'Perez', 'Thompson', 'Clark'];

      const patientsData = [];
      for (let i = 0; i < 20; i++) {
        const randomDoctor = createdDoctors[Math.floor(Math.random() * createdDoctors.length)];
        const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
        const randomGender = genders[Math.floor(Math.random() * genders.length)];
        const randomAge = Math.floor(Math.random() * 70) + 18;

        patientsData.push({
          name: `${randomFirstName} ${randomLastName}`,
          age: randomAge,
          gender: randomGender,
          condition: randomCondition,
          phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          email: `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}@example.com`,
          doctorId: randomDoctor._id,
        });
      }

      await Patient.insertMany(patientsData);
      console.log(`[Seed] Created ${patientsData.length} demo patients.`);
    }
  } catch (error) {
    console.error('[Seed] Error seeding demo data:', error);
  }
}
