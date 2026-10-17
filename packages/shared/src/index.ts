import { z } from 'zod';

// --- Auth Schemas & Types ---
export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface AdminUserDto {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// --- Doctor Schemas & Types ---
export const createDoctorSchema = z.object({
  name: z.string().min(2, 'Doctor name is required').trim(),
  specialization: z.string().min(2, 'Specialization is required').trim(),
  hospital: z.string().min(2, 'Hospital name is required').trim(),
  phone: z.string().min(7, 'Valid phone number is required').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});

export const updateDoctorSchema = createDoctorSchema.partial();

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;

export interface DoctorDto {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount?: number;
  createdAt: string;
  updatedAt: string;
}

// --- Patient Schemas & Types ---
export const createPatientSchema = z.object({
  name: z.string().min(2, 'Patient name is required').trim(),
  age: z.number().int().min(0, 'Age must be 0 or greater').max(150, 'Invalid age'),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  condition: z.string().min(2, 'Condition is required').trim(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  doctorId: z.string().min(1, 'Doctor ID is required'),
});

export const updatePatientSchema = createPatientSchema.partial();

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;

export interface PatientDto {
  id: string;
  name: string;
  age: number;
  gender?: string;
  condition: string;
  phone?: string;
  email?: string;
  doctorId: string;
  doctor?: {
    id: string;
    name: string;
    specialization: string;
    hospital: string;
  };
  createdAt: string;
  updatedAt: string;
}

// --- Query & Pagination Schemas ---
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional().default(''),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  from: z.string().optional(),
  to: z.string().optional(),
  specialization: z.string().optional(),
  hospital: z.string().optional(),
  condition: z.string().optional(),
  doctorId: z.string().optional(),
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: PaginationMeta;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  requestId?: string;
}

// --- User & RBAC Schemas & Types ---
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name is required').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'staff', 'viewer']).default('staff'),
  isActive: z.boolean().optional().default(true),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Dashboard Types ---
export interface DashboardSummaryDto {
  totalDoctors: number;
  totalPatients: number;
  patientsPerDoctorAvg: number;
  recentDoctors: DoctorDto[];
  recentPatients: PatientDto[];
}

export interface DashboardAnalyticsDto {
  patientsTimeline: Array<{ date: string; count: number }>;
  doctorsTimeline: Array<{ date: string; count: number }>;
  conditionDistribution: Array<{ condition: string; count: number }>;
  patientsPerDoctor: Array<{ doctorName: string; count: number }>;
}
