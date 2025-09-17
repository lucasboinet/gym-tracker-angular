import { Router } from 'express';
import { login, logout, refreshToken, register, getProfile } from './auth.controller';

const router: Router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.post('/token/refresh', refreshToken);
router.get('/me', getProfile)

export default router;