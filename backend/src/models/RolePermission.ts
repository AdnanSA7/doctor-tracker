import mongoose, { Schema, Document } from 'mongoose';

export interface IRolePermission extends Document {
  role: string;
  canViewDashboard: boolean;
  canManageDoctors: boolean;
  canManagePatients: boolean;
  canManageUsers: boolean;
  canDeleteRecords: boolean;
  updatedAt: Date;
}

const RolePermissionSchema = new Schema<IRolePermission>({
  role: { type: String, required: true, unique: true, enum: ['admin', 'manager', 'staff', 'viewer'] },
  canViewDashboard: { type: Boolean, default: true },
  canManageDoctors: { type: Boolean, default: true },
  canManagePatients: { type: Boolean, default: true },
  canManageUsers: { type: Boolean, default: false },
  canDeleteRecords: { type: Boolean, default: true },
}, { timestamps: true });

export const RolePermission = mongoose.model<IRolePermission>('RolePermission', RolePermissionSchema);
