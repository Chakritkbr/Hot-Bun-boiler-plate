import express, { Router } from 'express';
import * as authControllers from '../controllers/authController';
import {
  authenticateToken,
  authorizeUser,
} from '../middlewares/authMiddleware';

const router: Router = express.Router();

router.post('/register', authControllers.register);
router.post('/login', authControllers.login);
router.get('/protected', authenticateToken, authControllers.protectedAdmin);
router.put(
  '/edit/:id',
  authenticateToken,
  authorizeUser,
  authControllers.updateUser
);
router.delete(
  '/del/user/:id',
  authenticateToken,
  authorizeUser,
  authControllers.deleteUser
);
export default router;
