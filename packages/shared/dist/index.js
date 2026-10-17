"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = exports.paginationQuerySchema = exports.updatePatientSchema = exports.createPatientSchema = exports.updateDoctorSchema = exports.createDoctorSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// --- Auth Schemas & Types ---
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').toLowerCase().trim(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
// --- Doctor Schemas & Types ---
exports.createDoctorSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Doctor name is required').trim(),
    specialization: zod_1.z.string().min(2, 'Specialization is required').trim(),
    hospital: zod_1.z.string().min(2, 'Hospital name is required').trim(),
    phone: zod_1.z.string().min(7, 'Valid phone number is required').trim(),
    email: zod_1.z.string().email('Invalid email address').toLowerCase().trim(),
});
exports.updateDoctorSchema = exports.createDoctorSchema.partial();
// --- Patient Schemas & Types ---
exports.createPatientSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Patient name is required').trim(),
    age: zod_1.z.number().int().min(0, 'Age must be 0 or greater').max(150, 'Invalid age'),
    gender: zod_1.z.enum(['Male', 'Female', 'Other']).optional(),
    condition: zod_1.z.string().min(2, 'Condition is required').trim(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email('Invalid email address').optional().or(zod_1.z.literal('')),
    doctorId: zod_1.z.string().min(1, 'Doctor ID is required'),
});
exports.updatePatientSchema = exports.createPatientSchema.partial();
// --- Query & Pagination Schemas ---
exports.paginationQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    search: zod_1.z.string().optional().default(''),
    sortBy: zod_1.z.string().optional().default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    from: zod_1.z.string().optional(),
    to: zod_1.z.string().optional(),
    specialization: zod_1.z.string().optional(),
    hospital: zod_1.z.string().optional(),
    condition: zod_1.z.string().optional(),
    doctorId: zod_1.z.string().optional(),
});
// --- User & RBAC Schemas & Types ---
exports.createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name is required').trim(),
    email: zod_1.z.string().email('Invalid email address').toLowerCase().trim(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    role: zod_1.z.enum(['admin', 'staff', 'viewer']).default('staff'),
    isActive: zod_1.z.boolean().optional().default(true),
});
exports.updateUserSchema = exports.createUserSchema.partial().omit({ password: true });
