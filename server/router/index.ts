import { Router } from 'express';
import workoutsRoutes from '../modules/workouts/workouts.routes';
import authRoutes from '../modules/auth/auth.routes';

const router: Router = Router();

router.use('/workouts', workoutsRoutes);
router.use('/auth', authRoutes);

export default router;