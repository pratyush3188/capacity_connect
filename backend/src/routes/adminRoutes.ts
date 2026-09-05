import { Router } from 'express';
import { 
  getDashboardKPIs, 
  getCompetencyHeatmap, 
  matchTrainers,
  getTrainees,
  createUser,
  deleteUser,
  getCertificates,
  getAssessments,
  getCompetencies,
  createCompetency,
  assignCompetencyToTrainee,
  deleteCompetency
} from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticateToken, requireRole('admin'), getDashboardKPIs);
router.get('/analytics/competency-heatmap', authenticateToken, requireRole('admin'), getCompetencyHeatmap);
router.post('/trainers/match', authenticateToken, requireRole('admin'), matchTrainers);
router.get('/trainees', authenticateToken, requireRole('admin'), getTrainees);
router.post('/users', authenticateToken, requireRole('admin'), createUser);
router.delete('/users/:id', authenticateToken, requireRole('admin'), deleteUser);
router.get('/certificates', authenticateToken, requireRole('admin'), getCertificates);
router.get('/assessments', authenticateToken, requireRole('admin'), getAssessments);
router.get('/competencies', authenticateToken, requireRole('admin'), getCompetencies);
router.post('/competencies', authenticateToken, requireRole('admin'), createCompetency);
router.post('/competencies/assign', authenticateToken, requireRole('admin'), assignCompetencyToTrainee);
router.delete('/competencies/:id', authenticateToken, requireRole('admin'), deleteCompetency);

export default router;
