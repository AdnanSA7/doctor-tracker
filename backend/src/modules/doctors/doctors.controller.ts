import { Request, Response } from 'express';
import { Doctor } from '../../models/Doctor.js';
import { Patient } from '../../models/Patient.js';
import { CreateDoctorInput, UpdateDoctorInput, PaginationQueryInput } from '@doctor-tracker/shared';

export async function getDoctors(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as PaginationQueryInput;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const search = query.search || '';
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  const filter: any = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { specialization: { $regex: search, $options: 'i' } },
      { hospital: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (query.specialization) {
    filter.specialization = { $regex: new RegExp(`^${query.specialization}$`, 'i') };
  }
  if (query.hospital) {
    filter.hospital = { $regex: new RegExp(`^${query.hospital}$`, 'i') };
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

  const allowedSortFields = ['name', 'specialization', 'hospital', 'createdAt', 'email'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortOptions: any = { [sortField]: sortOrder, _id: 1 };

  const total = await Doctor.countDocuments(filter);
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;

  const doctors = await Doctor.find(filter).sort(sortOptions).skip(skip).limit(limit).lean();

  // Compute patient count for each doctor
  const doctorsWithCount = await Promise.all(
    doctors.map(async (doc) => {
      const patientCount = await Patient.countDocuments({ doctorId: doc._id });
      return {
        id: doc._id.toString(),
        name: doc.name,
        specialization: doc.specialization,
        hospital: doc.hospital,
        phone: doc.phone,
        email: doc.email,
        patientCount,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      };
    })
  );

  res.json({
    success: true,
    data: doctorsWithCount,
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

export async function createDoctor(req: Request, res: Response): Promise<void> {
  const data = req.body as CreateDoctorInput;
  const doctor = await Doctor.create(data);

  res.status(201).json({
    success: true,
    data: {
      id: doctor._id.toString(),
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
      phone: doctor.phone,
      email: doctor.email,
      patientCount: 0,
      createdAt: doctor.createdAt.toISOString(),
      updatedAt: doctor.updatedAt.toISOString(),
    },
  });
}

export async function getDoctorById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const doctor = await Doctor.findById(id).lean();
  if (!doctor) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Doctor not found' },
    });
    return;
  }

  const patientCount = await Patient.countDocuments({ doctorId: doctor._id });

  res.json({
    success: true,
    data: {
      id: doctor._id.toString(),
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
      phone: doctor.phone,
      email: doctor.email,
      patientCount,
      createdAt: doctor.createdAt.toISOString(),
      updatedAt: doctor.updatedAt.toISOString(),
    },
  });
}

export async function updateDoctor(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const data = req.body as UpdateDoctorInput;

  const doctor = await Doctor.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!doctor) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Doctor not found' },
    });
    return;
  }

  const patientCount = await Patient.countDocuments({ doctorId: doctor._id });

  res.json({
    success: true,
    data: {
      id: doctor._id.toString(),
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
      phone: doctor.phone,
      email: doctor.email,
      patientCount,
      createdAt: doctor.createdAt.toISOString(),
      updatedAt: doctor.updatedAt.toISOString(),
    },
  });
}

export async function deleteDoctor(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const force = req.query.force === 'true';

  const doctor = await Doctor.findById(id);
  if (!doctor) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Doctor not found' },
    });
    return;
  }

  const patientCount = await Patient.countDocuments({ doctorId: doctor._id });
  if (patientCount > 0 && !force) {
    res.status(400).json({
      success: false,
      error: {
        code: 'DOCTOR_HAS_PATIENTS',
        message: `Cannot delete doctor while ${patientCount} patients are assigned. Reassign or delete patients first, or pass force=true.`,
      },
    });
    return;
  }

  if (force && patientCount > 0) {
    await Patient.deleteMany({ doctorId: doctor._id });
  }

  await Doctor.findByIdAndDelete(id);

  res.json({
    success: true,
    data: { message: 'Doctor deleted successfully' },
  });
}

// Doctor-associated patients
export async function getDoctorPatients(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const doctor = await Doctor.findById(id);
  if (!doctor) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Doctor not found' },
    });
    return;
  }

  const query = req.query as unknown as PaginationQueryInput;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const search = query.search || '';
  const condition = query.condition || '';

  const filter: any = { doctorId: doctor._id };
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

  const total = await Patient.countDocuments(filter);
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;

  const patients = await Patient.find(filter).sort({ createdAt: -1, _id: 1 }).skip(skip).limit(limit).lean();

  const patientsDto = patients.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    age: p.age,
    gender: p.gender,
    condition: p.condition,
    phone: p.phone,
    email: p.email,
    doctorId: p.doctorId.toString(),
    doctor: {
      id: doctor._id.toString(),
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
    },
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

export async function createDoctorPatient(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const doctor = await Doctor.findById(id);
  if (!doctor) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Doctor not found' },
    });
    return;
  }

  const data = req.body;
  const patient = await Patient.create({
    ...data,
    doctorId: doctor._id,
  });

  res.status(201).json({
    success: true,
    data: {
      id: patient._id.toString(),
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      condition: patient.condition,
      phone: patient.phone,
      email: patient.email,
      doctorId: doctor._id.toString(),
      doctor: {
        id: doctor._id.toString(),
        name: doctor.name,
        specialization: doctor.specialization,
        hospital: doctor.hospital,
      },
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
    },
  });
}
