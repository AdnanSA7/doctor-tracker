import { Request, Response } from 'express';
import { RolePermission } from '../../models/RolePermission.js';

export async function getRolePermissions(req: Request, res: Response): Promise<void> {
  let permissions = await RolePermission.find().lean();
  if (permissions.length === 0) {
    const defaults = [
      { role: 'admin', canViewDashboard: true, canManageDoctors: true, canManagePatients: true, canManageUsers: true, canDeleteRecords: true },
      { role: 'manager', canViewDashboard: true, canManageDoctors: true, canManagePatients: true, canManageUsers: false, canDeleteRecords: true },
      { role: 'staff', canViewDashboard: true, canManageDoctors: true, canManagePatients: true, canManageUsers: false, canDeleteRecords: false },
      { role: 'viewer', canViewDashboard: true, canManageDoctors: false, canManagePatients: false, canManageUsers: false, canDeleteRecords: false },
    ];
    await RolePermission.insertMany(defaults);
    permissions = await RolePermission.find().lean();
  }

  res.json({
    success: true,
    data: permissions.map(p => ({
      role: p.role,
      canViewDashboard: p.canViewDashboard,
      canManageDoctors: p.canManageDoctors,
      canManagePatients: p.canManagePatients,
      canManageUsers: p.canManageUsers,
      canDeleteRecords: p.canDeleteRecords,
    })),
  });
}

export async function updateRolePermissions(req: Request, res: Response): Promise<void> {
  const { role } = req.params;
  const data = req.body;

  const updated = await RolePermission.findOneAndUpdate(
    { role },
    { $set: data },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({
    success: true,
    data: {
      role: updated.role,
      canViewDashboard: updated.canViewDashboard,
      canManageDoctors: updated.canManageDoctors,
      canManagePatients: updated.canManagePatients,
      canManageUsers: updated.canManageUsers,
      canDeleteRecords: updated.canDeleteRecords,
    },
  });
}
