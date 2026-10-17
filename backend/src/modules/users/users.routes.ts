import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from './users.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createUserSchema, updateUserSchema } from '@doctor-tracker/shared';

const router = Router();

router.use(requireAuth);
router.use(requireRole(['admin']));

router.get('/', getUsers);
router.post('/', validate({ body: createUserSchema }), createUser);
router.patch('/:id', validate({ body: updateUserSchema }), updateUser);
router.delete('/:id', deleteUser);

export default router;
