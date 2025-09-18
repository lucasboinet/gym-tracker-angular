import { Router } from 'express';
import { clearCurrentWorkout, getCurrentWorkout, saveWorkout, getWorkouts, updateCurrentWorkout, deleteWorkout, createWorkout } from './workouts.controller';
import authenticated from '../../middleware/authenticated';

const router: Router = Router();

router.get('/', authenticated, getWorkouts);
router.put('/', authenticated, saveWorkout);
router.post('/', authenticated, createWorkout);
router.delete('/:id', authenticated, deleteWorkout);
router.get('/active', authenticated, getCurrentWorkout);
router.post('/active', authenticated, updateCurrentWorkout);
router.delete('/active', authenticated, clearCurrentWorkout);

export default router;