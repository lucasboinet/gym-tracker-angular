import { Router } from 'express';
import { clearCurrentWorkout, getCurrentWorkout, saveWorkout, getWorkouts, updateCurrentWorkout, deleteWorkout, createWorkout } from './workouts.controller';

const router: Router = Router();

router.get('/', getWorkouts);
router.patch('/', saveWorkout);
router.post('/', createWorkout);
router.delete('/:id', deleteWorkout);
router.get('/active', getCurrentWorkout);
router.post('/active', updateCurrentWorkout);
router.delete('/active', clearCurrentWorkout);

export default router;