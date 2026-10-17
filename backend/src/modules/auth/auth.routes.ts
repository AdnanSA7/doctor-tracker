import { Router } from 'express';
import { login, logout, getCurrentAdmin, streamAuthEvents } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { loginSchema } from '@doctor-tracker/shared';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.post('/login', validate({ body: loginSchema }), login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getCurrentAdmin);
router.get('/events', requireAuth, streamAuthEvents);

export default router;
