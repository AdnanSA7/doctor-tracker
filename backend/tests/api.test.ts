import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import http from 'http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { Admin } from '../src/models/Admin.js';
import bcrypt from 'bcrypt';

let mongoServer: MongoMemoryServer;
let server: http.Server;
let baseUrl: string;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await connectDB(uri);

  // Create test admin
  const hash = await bcrypt.hash('TestPassword123!', 10);
  await Admin.create({
    name: 'Test Admin',
    email: 'admin@test.com',
    passwordHash: hash,
  });

  const app = createApp();
  server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  baseUrl = `http://localhost:${address.port}`;
}, 30000);

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
  await disconnectDB();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Doctor Tracker API Integration Tests', () => {
  let agent: request.SuperAgentTest;
  let createdDoctorId: string;
  let createdPatientId: string;

  it('GET /health should return healthy status', async () => {
    const res = await request(baseUrl).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  it('POST /api/v1/auth/login should authenticate valid admin credentials', async () => {
    agent = request.agent(baseUrl);
    const res = await agent.post('/api/v1/auth/login').send({
      email: 'admin@test.com',
      password: 'TestPassword123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('admin@test.com');
  });

  it('GET /api/v1/auth/me should return current authenticated admin', async () => {
    const res = await agent.get('/api/v1/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Admin');
  });

  it('POST /api/v1/doctors should create a new doctor', async () => {
    const res = await agent.post('/api/v1/doctors').send({
      name: 'Dr. Jane Smith',
      specialization: 'Cardiology',
      hospital: 'City General Hospital',
      phone: '+1-555-0199',
      email: 'jane.smith@hospital.com',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Dr. Jane Smith');
    createdDoctorId = res.body.data.id;
  });

  it('GET /api/v1/doctors should list doctors with pagination', async () => {
    const res = await agent.get('/api/v1/doctors?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta.total).toBe(1);
  });

  it('POST /api/v1/doctors/:id/patients should assign a patient to doctor', async () => {
    const res = await agent.post(`/api/v1/doctors/${createdDoctorId}/patients`).send({
      name: 'John Doe',
      age: 45,
      gender: 'Male',
      condition: 'Hypertension',
      phone: '+1-555-9988',
      email: 'john.doe@example.com',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('John Doe');
    expect(res.body.data.doctorId).toBe(createdDoctorId);
    createdPatientId = res.body.data.id;
  });

  it('GET /api/v1/patients should list all patients globally', async () => {
    const res = await agent.get('/api/v1/patients');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('John Doe');
  });

  it('GET /api/v1/dashboard/summary should return dashboard summary metrics', async () => {
    const res = await agent.get('/api/v1/dashboard/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalDoctors).toBe(1);
    expect(res.body.data.totalPatients).toBe(1);
  });

  it('GET /api/v1/dashboard/analytics should return aggregation metrics', async () => {
    const res = await agent.get('/api/v1/dashboard/analytics');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.conditionDistribution.length).toBeGreaterThan(0);
  });

  it('DELETE /api/v1/doctors/:id should fail if doctor has assigned patients unless forced', async () => {
    const res = await agent.delete(`/api/v1/doctors/${createdDoctorId}`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('DOCTOR_HAS_PATIENTS');
  });

  it('DELETE /api/v1/patients/:id should delete patient successfully', async () => {
    const res = await agent.delete(`/api/v1/patients/${createdPatientId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/v1/auth/logout should logout successfully', async () => {
    const res = await agent.post('/api/v1/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Production Configuration Validation', () => {
  it('should throw an error when NODE_ENV is production and SESSION_SECRET is missing', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalSessionSecret = process.env.SESSION_SECRET;

    process.env.NODE_ENV = 'production';
    delete process.env.SESSION_SECRET;

    expect(() => createApp()).toThrow(/SESSION_SECRET/);

    process.env.NODE_ENV = originalNodeEnv;
    if (originalSessionSecret !== undefined) {
      process.env.SESSION_SECRET = originalSessionSecret;
    }
  });
});

describe('Access Revocation & Account Deactivation', () => {
  it('should invalidate active session when admin is deactivated (isActive: false)', async () => {
    const revocationAgent = request.agent(baseUrl);
    await revocationAgent.post('/api/v1/auth/login').send({
      email: 'admin@test.com',
      password: 'TestPassword123!',
    });

    const resBefore = await revocationAgent.get('/api/v1/auth/me');
    expect(resBefore.status).toBe(200);

    await Admin.findOneAndUpdate({ email: 'admin@test.com' }, { isActive: false });

    const resAfter = await revocationAgent.get('/api/v1/doctors');
    expect(resAfter.status).toBe(401);
    expect(resAfter.body.success).toBe(false);

    await Admin.findOneAndUpdate({ email: 'admin@test.com' }, { isActive: true });
  });

  it('should invalidate active session when admin is deleted', async () => {
    const deletionAgent = request.agent(baseUrl);
    await deletionAgent.post('/api/v1/auth/login').send({
      email: 'admin@test.com',
      password: 'TestPassword123!',
    });

    const resBefore = await deletionAgent.get('/api/v1/auth/me');
    expect(resBefore.status).toBe(200);

    await Admin.findOneAndDelete({ email: 'admin@test.com' });

    const resAfter = await deletionAgent.get('/api/v1/doctors');
    expect(resAfter.status).toBe(401);
    expect(resAfter.body.success).toBe(false);

    const hash = await bcrypt.hash('TestPassword123!', 10);
    await Admin.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      passwordHash: hash,
      isActive: true,
    });
  });
});

describe('Role-Based Access Control (RBAC)', () => {
  it('should forbid viewer role from creating doctors or patients (403)', async () => {
    const hash = await bcrypt.hash('ViewerPassword123!', 10);
    await Admin.create({
      name: 'Test Viewer',
      email: 'viewer@test.com',
      passwordHash: hash,
      role: 'viewer',
      isActive: true,
    });

    const viewerAgent = request.agent(baseUrl);
    await viewerAgent.post('/api/v1/auth/login').send({
      email: 'viewer@test.com',
      password: 'ViewerPassword123!',
    });

    const getRes = await viewerAgent.get('/api/v1/doctors');
    expect(getRes.status).toBe(200);

    const postRes = await viewerAgent.post('/api/v1/doctors').send({
      name: 'Dr. Unauthorized',
      specialization: 'Cardiology',
      hospital: 'General Hospital',
      phone: '+1-555-0000',
      email: 'unauthorized@hospital.com',
    });
    expect(postRes.status).toBe(403);
    expect(postRes.body.success).toBe(false);
  });
});
