import request from 'supertest';
import express, { NextFunction, Request, Response } from 'express';
import { deleteUser } from '../../src/controllers/authController';
import dbPool from '../../src/db';
import {
  authenticateToken,
  authorizeUser,
  CustomUserRequest,
} from '../../src/middlewares/authMiddleware';
import bodyParser from 'body-parser';
import { UserInterface } from '../../src/utils/authUtils';
import { ResultSetHeader } from 'mysql2';

jest.mock('../../src/db');

jest.mock('../../src/middlewares/authMiddleware', () => ({
  authenticateToken: jest.fn(
    (req: CustomUserRequest, res: Response, next: NextFunction) => {
      req.user = {
        id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
      } as UserInterface;
      next();
    }
  ),
  authorizeUser: jest.fn((req: Request, res: Response, next: NextFunction) => {
    next();
  }),
}));

const app = express();
app.use(bodyParser.json());
app.delete('/del/user/:id', authenticateToken, authorizeUser, deleteUser);

// Mock console.error
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

describe('DELETE /del/user/:id', () => {
  const mockUserId = '123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete user successfully and return 200', async () => {
    (dbPool.query as jest.Mock).mockResolvedValueOnce([
      { affectedRows: 1 } as ResultSetHeader,
    ]);

    const response = await request(app).delete(`/del/user/${mockUserId}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User deleted successfully');
  }, 10000); // Increased timeout to 10 seconds

  it('should return 404 if user not found', async () => {
    (dbPool.query as jest.Mock).mockResolvedValueOnce([
      { affectedRows: 0 } as ResultSetHeader,
    ]);

    const response = await request(app).delete(`/del/user/${mockUserId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  }, 10000); // Increased timeout to 10 seconds

  it('should return 500 if there is a server error', async () => {
    (dbPool.query as jest.Mock).mockRejectedValueOnce(
      new Error('Database error')
    );

    const response = await request(app).delete(`/del/user/${mockUserId}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal server error');
  }, 10000); // Increased timeout to 10 seconds
});
