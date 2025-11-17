import { Router } from 'express';
import { ScoreController } from '../controllers/scoreController.js';
import { validateScore, validateLimit } from '../middleware/validation.js';

const router = Router();

router.post('/scores', validateScore, ScoreController.submitScore);
router.get('/scores', validateLimit, ScoreController.getLeaderboard);
router.get('/health', ScoreController.healthCheck);

export default router;