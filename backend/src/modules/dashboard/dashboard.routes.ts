import { Router } from 'express';
import { getDashboardSummary, getDashboardAnalytics } from './dashboard.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/summary', getDashboardSummary);
router.get('/analytics', getDashboardAnalytics);

export default router;
