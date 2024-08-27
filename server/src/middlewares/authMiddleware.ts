import { NextFunction, Request, Response } from 'express';
import { UserInterface, verifyToken } from '../utils/authUtils';

export interface CustomUserRequest extends Request {
  user?: UserInterface;
}

export const authenticateToken = (
  req: CustomUserRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }

  req.user = payload as UserInterface;

  next();
};
