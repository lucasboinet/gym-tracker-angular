import { Router } from 'express';
import workoutsRoutes from '../modules/workouts/workouts.routes'

const router: Router = Router();

router.use('/workouts', workoutsRoutes);

export default router;