import request from 'supertest';
import express from 'express';
import { register } from '../../src/controllers/authController';
import dbPool from '../../src/db';
import {
  checkUserExists,
  hashPassword,
  generateUserId,
  userValidate,
} from '../../src/utils/authUtils';
import bodyParser from 'body-parser';

jest.mock('../../src/db');
jest.mock('../../src/utils/authUtils');

const app = express();
app.use(bodyParser.json());
app.post('/register', register);

const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('POST /register', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock data before each test
  });

  it('should return 400 if validation fails', async () => {
    (userValidate.validate as jest.Mock).mockReturnValue({
      error: { details: [{ message: 'Invalid email format.' }] },
    });

    const response = await request(app)
      .post('/register')
      .send({ email: 'invalidemail', password: '123' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid email format.');
  });

  it('should return 400 if email already exists', async () => {
    (userValidate.validate as jest.Mock).mockReturnValue({ error: null });
    (checkUserExists as jest.Mock).mockResolvedValue(true);

    const response = await request(app)
      .post('/register')
      .send({ email: 'test@example.com', password: 'Password123' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email is already in use.');
  });

  it('should return 201 if user is registered successfully', async () => {
    (userValidate.validate as jest.Mock).mockReturnValue({ error: null });
    (checkUserExists as jest.Mock).mockResolvedValue(false);
    (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
    (generateUserId as jest.Mock).mockReturnValue('newUserId');
    (dbPool.query as jest.Mock).mockResolvedValue([{}]);

    const response = await request(app)
      .post('/register')
      .send({ email: 'newuser@example.com', password: 'Password123' });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully.');
  });

  // Mock console.error
  const originalConsoleError = console.error;
  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('should return 500 if there is a server error', async () => {
    (userValidate.validate as jest.Mock).mockReturnValue({ error: null });
    (checkUserExists as jest.Mock).mockRejectedValue(
      new Error('Database error')
    );

    const response = await request(app)
      .post('/register')
      .send({ email: 'newuser@example.com', password: 'Password123' });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal server error.');

    // Check if console.error was called with the correct arguments
    expect(console.error).toHaveBeenCalledWith(
      'Error in register:',
      expect.any(Error)
    );
  });
});
