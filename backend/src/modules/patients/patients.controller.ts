import { Request, Response } from 'express';
import { Patient } from '../../models/Patient.js';
import { Doctor } from '../../models/Doctor.js';
import { UpdatePatientInput, PaginationQueryInput } from '@doctor-tracker/shared';

export async function getAllPatients(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as PaginationQueryInput;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const search = query.search || '';
  const condition = query.condition || '';
  const doctorId = query.doctorId || '';
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  const filter: any = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { condition: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (condition) {
    filter.condition = { $regex: new RegExp(`^${condition}$`, 'i') };
  }
  if (doctorId) {
    filter.doctorId = doctorId;
  }
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) {
      const fromDate = new Date(query.from);
      fromDate.setHours(0, 0, 0, 0);
      filter.createdAt.$gte = fromDate;
    }
    if (query.to) {
      const toDate = new Date(query.to);
      toDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = toDate;
    }
  }

  const allowedSortFields = ['name', 'age', 'condition', 'createdAt'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortOptions: any = { [sortField]: sortOrder, _id: 1 };

  const total = await Patient.countDocuments(filter);
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;

  const patients = await Patient.find(filter).populate('doctorId').sort(sortOptions).skip(skip).limit(limit).lean();

  const patientsDto = patients.map((p: any) => ({
    id: p._id.toString(),
    name: p.name,
    age: p.age,
    gender: p.gender,
    condition: p.condition,
    phone: p.phone,
    email: p.email,
    doctorId: p.doctorId?._id?.toString() || p.doctorId?.toString(),
    doctor: p.doctorId && typeof p.doctorId === 'object' ? {
      id: p.doctorId._id.toString(),
      name: p.doctorId.name,
      specialization: p.doctorId.specialization,
      hospital: p.doctorId.hospital,
    } : undefined,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  res.json({
    success: true,
    data: patientsDto,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
}

export async function getPatientById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const patient = await Patient.findById(id).populate('doctorId').lean();
  if (!patient) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Patient not found' },
    });
    return;
  }

  const p: any = patient;
  res.json({
    success: true,
    data: {
      id: p._id.toString(),
      name: p.name,
      age: p.age,
      gender: p.gender,
      condition: p.condition,
      phone: p.phone,
      email: p.email,
      doctorId: p.doctorId?._id?.toString() || p.doctorId?.toString(),
      doctor: p.doctorId && typeof p.doctorId === 'object' ? {
        id: p.doctorId._id.toString(),
        name: p.doctorId.name,
        specialization: p.doctorId.specialization,
        hospital: p.doctorId.hospital,
      } : undefined,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    },
  });
}

export async function updatePatient(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const data = req.body as UpdatePatientInput;

  if (data.doctorId) {
    const doctorExists = await Doctor.findById(data.doctorId);
    if (!doctorExists) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_DOCTOR', message: 'Assigned doctor does not exist' },
      });
      return;
    }
  }

  const patient = await Patient.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('doctorId');
  if (!patient) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Patient not found' },
    });
    return;
  }

  const p: any = patient;
  res.json({
    success: true,
    data: {
      id: p._id.toString(),
      name: p.name,
      age: p.age,
      gender: p.gender,
      condition: p.condition,
      phone: p.phone,
      email: p.email,
      doctorId: p.doctorId?._id?.toString() || p.doctorId?.toString(),
      doctor: p.doctorId && typeof p.doctorId === 'object' ? {
        id: p.doctorId._id.toString(),
        name: p.doctorId.name,
        specialization: p.doctorId.specialization,
        hospital: p.doctorId.hospital,
      } : undefined,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    },
  });
}

export async function deletePatient(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const patient = await Patient.findByIdAndDelete(id);
  if (!patient) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Patient not found' },
    });
    return;
  }

  res.json({
    success: true,
    data: { message: 'Patient deleted successfully' },
  });
}
