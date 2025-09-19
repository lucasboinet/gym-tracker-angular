import { Router } from 'express';
import workoutsRoutes from '../modules/workouts/workouts.routes';
import authRoutes from '../modules/auth/auth.routes';
import sessionsRoutes from '../modules/sessions/sessions.routes';

const router: Router = Router();

router.use('/workouts', workoutsRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/auth', authRoutes);

export default router;