import { Router } from 'express';
import { getAllPatients, getPatientById, updatePatient, deletePatient } from './patients.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { updatePatientSchema } from '@doctor-tracker/shared';

const router = Router();

router.use(requireAuth);

router.get('/', getAllPatients);
router.get('/:id', getPatientById);

router.patch('/:id', requireRole(['admin', 'manager', 'staff']), validate({ body: updatePatientSchema }), updatePatient);
router.delete('/:id', requireRole(['admin', 'manager', 'staff']), deletePatient);

export default router;
