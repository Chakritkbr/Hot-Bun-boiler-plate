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

  try {
    // Verify the token
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }

    // Attach user information to the request
    req.user = payload as UserInterface;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle unexpected errors
    console.error('Error verifying token:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const authorizeUser = (
  req: CustomUserRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
  if (userId !== id) {
    return res
      .status(403)
      .json({ message: 'You are not authorized to acces this resource' });
  }
  next();
};
