import request from 'supertest';
import express, { NextFunction } from 'express';
import { updateUser } from '../../src/controllers/authController';
import dbPool from '../../src/db';
import {
  hashPassword,
  checkUserExists,
  userValidate,
  UserInterface,
} from '../../src/utils/authUtils';
import {
  authenticateToken,
  authorizeUser,
  CustomUserRequest,
} from '../../src/middlewares/authMiddleware';
import bodyParser from 'body-parser';

jest.mock('../../src/db');
jest.mock('../../src/utils/authUtils', () => ({
  hashPassword: jest.fn(),
  checkUserExists: jest.fn(),
  userValidate: {
    validate: jest.fn().mockReturnValue({ error: null }), // Mock validation
  },
}));

// Mock middleware functions
jest.mock('../../src/middlewares/authMiddleware', () => ({
  authenticateToken: jest.fn(
    (req: CustomUserRequest, res: Response, next: NextFunction) => {
      req.user = {
        id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
      } as UserInterface; // Mock user data
      next();
    }
  ),
  authorizeUser: jest.fn((req: Request, res: Response, next: NextFunction) => {
    next();
  }),
}));

const app = express();
app.use(bodyParser.json());
app.put('/edit/:id', authenticateToken, authorizeUser, updateUser);

describe('PUT /edit/:id', () => {
  const mockUserId = '123';
  const mockEmail = 'test@example.com';
  const mockPassword = 'Password1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update user successfully', async () => {
    (dbPool.query as jest.Mock).mockResolvedValueOnce([
      [{ id: mockUserId }],
      [],
    ]); // Mock user retrieval
    (checkUserExists as jest.Mock).mockResolvedValueOnce(false); // Mock email check
    (hashPassword as jest.Mock).mockResolvedValueOnce('hashedPassword'); // Mock password hashing

    const response = await request(app)
      .put(`/edit/${mockUserId}`)
      .send({ email: mockEmail, password: mockPassword });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User updated successfully.');
  });

  it('it should return 400 if validation fails', async () => {
    // Mock validation failure
    (userValidate.validate as jest.Mock).mockReturnValueOnce({
      error: { details: [{ message: 'Invalid email format' }] },
    });

    const response = await request(app)
      .put(`/edit/${mockUserId}`)
      .send({ email: 'invalid-email', password: 'short' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid email format');
  });

  it('it should return 404 if user is not found', async () => {
    (dbPool.query as jest.Mock).mockResolvedValueOnce([[]]);
    const response = await request(app)
      .put(`/edit/${mockUserId}`)
      .send({ email: mockEmail, password: mockPassword });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('it should return 400 if email is already in use', async () => {
    (dbPool.query as jest.Mock).mockResolvedValueOnce([[{ id: mockUserId }]]);
    (checkUserExists as jest.Mock).mockResolvedValueOnce(true);

    const response = await request(app)
      .put(`/edit/${mockUserId}`)
      .send({ email: mockEmail, password: mockPassword });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email is already use');
  });

  it('it should return 500 if there is a server error', async () => {
    (dbPool.query as jest.Mock).mockRejectedValueOnce(new Error('DB Error'));

    const response = await request(app)
      .put(`/edit/${mockUserId}`)
      .send({ email: mockEmail, password: mockPassword });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal server error.');
  });
});
