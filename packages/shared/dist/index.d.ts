import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export interface AdminUserDto {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}
export declare const createDoctorSchema: z.ZodObject<{
    name: z.ZodString;
    specialization: z.ZodString;
    hospital: z.ZodString;
    phone: z.ZodString;
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    specialization: string;
    hospital: string;
    phone: string;
}, {
    email: string;
    name: string;
    specialization: string;
    hospital: string;
    phone: string;
}>;
export declare const updateDoctorSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    specialization: z.ZodOptional<z.ZodString>;
    hospital: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    name?: string | undefined;
    specialization?: string | undefined;
    hospital?: string | undefined;
    phone?: string | undefined;
}, {
    email?: string | undefined;
    name?: string | undefined;
    specialization?: string | undefined;
    hospital?: string | undefined;
    phone?: string | undefined;
}>;
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
export declare const createPatientSchema: z.ZodObject<{
    name: z.ZodString;
    age: z.ZodNumber;
    gender: z.ZodOptional<z.ZodEnum<["Male", "Female", "Other"]>>;
    condition: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    doctorId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    age: number;
    condition: string;
    doctorId: string;
    email?: string | undefined;
    phone?: string | undefined;
    gender?: "Male" | "Female" | "Other" | undefined;
}, {
    name: string;
    age: number;
    condition: string;
    doctorId: string;
    email?: string | undefined;
    phone?: string | undefined;
    gender?: "Male" | "Female" | "Other" | undefined;
}>;
export declare const updatePatientSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    age: z.ZodOptional<z.ZodNumber>;
    gender: z.ZodOptional<z.ZodOptional<z.ZodEnum<["Male", "Female", "Other"]>>>;
    condition: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    email: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    doctorId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    name?: string | undefined;
    phone?: string | undefined;
    age?: number | undefined;
    gender?: "Male" | "Female" | "Other" | undefined;
    condition?: string | undefined;
    doctorId?: string | undefined;
}, {
    email?: string | undefined;
    name?: string | undefined;
    phone?: string | undefined;
    age?: number | undefined;
    gender?: "Male" | "Female" | "Other" | undefined;
    condition?: string | undefined;
    doctorId?: string | undefined;
}>;
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
export declare const paginationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    specialization: z.ZodOptional<z.ZodString>;
    hospital: z.ZodOptional<z.ZodString>;
    condition: z.ZodOptional<z.ZodString>;
    doctorId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    specialization?: string | undefined;
    hospital?: string | undefined;
    condition?: string | undefined;
    doctorId?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
}, {
    specialization?: string | undefined;
    hospital?: string | undefined;
    condition?: string | undefined;
    doctorId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    from?: string | undefined;
    to?: string | undefined;
}>;
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
export declare const createUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["admin", "staff", "viewer"]>>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
    role: "admin" | "staff" | "viewer";
    isActive: boolean;
}, {
    email: string;
    password: string;
    name: string;
    role?: "admin" | "staff" | "viewer" | undefined;
    isActive?: boolean | undefined;
}>;
export declare const updateUserSchema: z.ZodObject<Omit<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodDefault<z.ZodEnum<["admin", "staff", "viewer"]>>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
}, "password">, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    name?: string | undefined;
    role?: "admin" | "staff" | "viewer" | undefined;
    isActive?: boolean | undefined;
}, {
    email?: string | undefined;
    name?: string | undefined;
    role?: "admin" | "staff" | "viewer" | undefined;
    isActive?: boolean | undefined;
}>;
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
export interface DashboardSummaryDto {
    totalDoctors: number;
    totalPatients: number;
    patientsPerDoctorAvg: number;
    recentDoctors: DoctorDto[];
    recentPatients: PatientDto[];
}
export interface DashboardAnalyticsDto {
    patientsTimeline: Array<{
        date: string;
        count: number;
    }>;
    doctorsTimeline: Array<{
        date: string;
        count: number;
    }>;
    conditionDistribution: Array<{
        condition: string;
        count: number;
    }>;
    patientsPerDoctor: Array<{
        doctorName: string;
        count: number;
    }>;
}
