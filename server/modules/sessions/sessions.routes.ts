import { Router } from 'express';
import { createSession, deleteSession, getSessions, updateSession } from './sessions.controller';
import authenticated from '../../middleware/authenticated';

const router: Router = Router();

router.get('/', authenticated, getSessions);
router.post('/', authenticated, createSession);
router.put('/:id', authenticated, updateSession);
router.delete('/:id', authenticated, deleteSession);

export default router;