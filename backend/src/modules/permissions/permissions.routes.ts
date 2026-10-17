import { Router } from 'express';
import { getRolePermissions, updateRolePermissions } from './permissions.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getRolePermissions);
router.put('/:role', requireRole(['admin']), updateRolePermissions);

export default router;
