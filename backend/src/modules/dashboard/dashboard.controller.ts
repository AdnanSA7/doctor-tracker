import { Request, Response } from 'express';
import { Doctor } from '../../models/Doctor.js';
import { Patient } from '../../models/Patient.js';

export async function getDashboardSummary(req: Request, res: Response): Promise<void> {
  const totalDoctors = await Doctor.countDocuments();
  const totalPatients = await Patient.countDocuments();
  const patientsPerDoctorAvg = totalDoctors > 0 ? Number((totalPatients / totalDoctors).toFixed(1)) : 0;

  const recentDoctorsRaw = await Doctor.find().sort({ createdAt: -1 }).limit(5).lean();
  const recentPatientsRaw = await Patient.find().populate('doctorId').sort({ createdAt: -1 }).limit(5).lean();

  const recentDoctors = recentDoctorsRaw.map((d) => ({
    id: d._id.toString(),
    name: d.name,
    specialization: d.specialization,
    hospital: d.hospital,
    phone: d.phone,
    email: d.email,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));

  const recentPatients = recentPatientsRaw.map((p: any) => ({
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
    data: {
      totalDoctors,
      totalPatients,
      patientsPerDoctorAvg,
      recentDoctors,
      recentPatients,
    },
  });
}

export async function getDashboardAnalytics(req: Request, res: Response): Promise<void> {
  // Condition distribution aggregation
  const conditionDistributionRaw = await Patient.aggregate([
    { $group: { _id: '$condition', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const conditionDistribution = conditionDistributionRaw.map((item) => ({
    condition: item._id || 'Unknown',
    count: item.count,
  }));

  // Patients per doctor aggregation
  const patientsPerDoctorRaw = await Patient.aggregate([
    { $group: { _id: '$doctorId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
    {
      $lookup: {
        from: 'doctors',
        localField: '_id',
        foreignField: '_id',
        as: 'doctor',
      },
    },
    { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        doctorName: { $ifNull: ['$doctor.name', 'Unassigned'] },
        count: 1,
      },
    },
  ]);

  const patientsPerDoctor = patientsPerDoctorRaw.map((item) => ({
    doctorName: item.doctorName,
    count: item.count,
  }));

  // Patients created over time (grouped by YYYY-MM-DD)
  const patientsTimelineRaw = await Patient.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);

  const patientsTimeline = patientsTimelineRaw.map((item) => ({
    date: item._id,
    count: item.count,
  }));

  // Doctors created over time
  const doctorsTimelineRaw = await Doctor.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);

  const doctorsTimeline = doctorsTimelineRaw.map((item) => ({
    date: item._id,
    count: item.count,
  }));

  res.json({
    success: true,
    data: {
      patientsTimeline,
      doctorsTimeline,
      conditionDistribution,
      patientsPerDoctor,
    },
  });
}
