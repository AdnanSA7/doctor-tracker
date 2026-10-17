import { Router } from 'express';
import {
  getDoctors,
  createDoctor,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
  createDoctorPatient,
} from './doctors.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createDoctorSchema, updateDoctorSchema, createPatientSchema } from '@doctor-tracker/shared';

const router = Router();

router.use(requireAuth);

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/patients', getDoctorPatients);

router.post('/', requireRole(['admin', 'manager', 'staff']), validate({ body: createDoctorSchema }), createDoctor);
router.patch('/:id', requireRole(['admin', 'manager', 'staff']), validate({ body: updateDoctorSchema }), updateDoctor);
router.delete('/:id', requireRole(['admin', 'manager', 'staff']), deleteDoctor);
router.post('/:id/patients', requireRole(['admin', 'manager', 'staff']), validate({ body: createPatientSchema.omit({ doctorId: true }) }), createDoctorPatient);

export default router;
