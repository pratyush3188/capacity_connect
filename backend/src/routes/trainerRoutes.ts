import { Router } from 'express';
import { getTrainers, getTrainerDashboard, getTrainerTrainees, updateTrainerProfile } from '../controllers/trainerController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getTrainers);
router.get('/me/dashboard', authenticateToken, requireRole('trainer'), getTrainerDashboard);
router.get('/me/trainees', authenticateToken, requireRole('trainer'), getTrainerTrainees);
router.put('/me/profile', authenticateToken, requireRole('trainer'), updateTrainerProfile);

export default router;
