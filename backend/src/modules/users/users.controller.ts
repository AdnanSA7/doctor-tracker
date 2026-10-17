import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Admin } from '../../models/Admin.js';
import { CreateUserInput, UpdateUserInput } from '@doctor-tracker/shared';

export async function getUsers(req: Request, res: Response): Promise<void> {
  const users = await Admin.find().sort({ createdAt: -1 }).lean();
  const usersDto = users.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive ?? true,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }));

  res.json({
    success: true,
    data: usersDto,
  });
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const data = req.body as CreateUserInput;
  const existing = await Admin.findOne({ email: data.email });
  if (existing) {
    res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_EMAIL', message: 'An account with this email already exists' },
    });
    return;
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await Admin.create({
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role || 'staff',
    isActive: data.isActive ?? true,
  });

  res.status(201).json({
    success: true,
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
  });
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const data = req.body as UpdateUserInput;

  const targetUser = await Admin.findById(id);
  if (!targetUser) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'User not found' },
    });
    return;
  }

  if ((data.isActive === false || (data.role && data.role !== 'admin')) && targetUser.role === 'admin') {
    const activeAdminCount = await Admin.countDocuments({ role: 'admin', isActive: true, _id: { $ne: id } });
    if (activeAdminCount === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'CANNOT_MODIFY_LAST_ADMIN', message: 'Cannot deactivate or demote the last active administrator.' },
      });
      return;
    }
  }

  const user = await Admin.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!user) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'User not found' },
    });
    return;
  }

  res.json({
    success: true,
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
  });
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const targetUser = await Admin.findById(id);
  if (!targetUser) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'User not found' },
    });
    return;
  }

  if (targetUser.role === 'admin') {
    const activeAdminCount = await Admin.countDocuments({ role: 'admin', isActive: true, _id: { $ne: id } });
    if (activeAdminCount === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'CANNOT_DELETE_LAST_ADMIN', message: 'Cannot delete the last active administrator.' },
      });
      return;
    }
  }

  await Admin.findByIdAndDelete(id);

  res.json({
    success: true,
    data: { message: 'User deleted successfully' },
  });
}
