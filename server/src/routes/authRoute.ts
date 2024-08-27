import express, { Router } from 'express';
import * as authControllers from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router: Router = express.Router();

router.post('/register', authControllers.register);
router.post('/login', authControllers.login);
router.get('/protected', authenticateToken, authControllers.protectedAdmin);
export default router;
