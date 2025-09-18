import { Router } from 'express';
import { login, logout, refreshToken, register, getProfile } from './auth.controller';
import authenticated from '../../middleware/authenticated';

const router: Router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/token/refresh', refreshToken);
router.post('/logout', authenticated, logout);
router.get('/me', authenticated, getProfile)

export default router;