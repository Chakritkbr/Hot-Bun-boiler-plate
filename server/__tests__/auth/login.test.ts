import request from 'supertest';
import express from 'express';
import { login } from '../../src/controllers/authController';
import dbPool from '../../src/db';
import {
  checkUserExists,
  hashPassword,
  generateUserId,
  userValidate,
  checkPassword,
  genToken,
} from '../../src/utils/authUtils';
import bodyParser from 'body-parser';

jest.mock('../../src/db');
jest.mock('../../src/utils/authUtils');

const app = express();
app.use(bodyParser.json());
app.post('/login', login);

// Mock console.error
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('POST /login', () => {
  it('should return 400 if validation fails', async () => {
    // Mock validation to simulate an error
    (userValidate.validate as jest.Mock).mockReturnValue({
      error: { details: [{ message: 'Invalid email format' }] },
    });

    const response = await request(app)
      .post('/login')
      .send({ email: '', password: '' }); // Send invalid data

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid email format');
  });

  it('should return 400 if the email is not found', async () => {
    // Mock dbPool.query to return empty result
    (dbPool.query as jest.Mock).mockResolvedValue([[], undefined]);

    // Mock checkPassword to also throw an error
    (checkPassword as jest.Mock).mockRejectedValue(
      new Error('Password check error')
    );

    // Mock validation to simulate valid input
    (userValidate.validate as jest.Mock).mockReturnValue({
      error: null,
    });

    const response = await request(app)
      .post('/login')
      .send({ email: 'nonexistent@example.com', password: 'Password123' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid email or password.');
  });

  it('should return 400 if the password is incorrect', async () => {
    // Mock dbPool.query to return a user
    const mockUser = {
      id: 'user-id',
      email: 'user@example.com',
      password: 'hashed-password',
    };
    (dbPool.query as jest.Mock).mockResolvedValue([[mockUser], undefined]);

    // Mock checkPassword to return false
    (checkPassword as jest.Mock).mockResolvedValue(false);

    // Mock validation to simulate valid input
    (userValidate.validate as jest.Mock).mockReturnValue({
      error: null,
    });
    const response = await request(app)
      .post('/login')
      .send({ email: 'user@example.com', password: 'WrongPassword' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid email or password.');
  });

  it('should return 200 and token if login is successful', async () => {
    // Mock dbPool.query to return a user
    const mockUser = {
      id: 'user-id',
      email: 'user@example.com',
      password: 'hashed-password',
    };
    (dbPool.query as jest.Mock).mockResolvedValue([[mockUser], undefined]);

    // Mock checkPassword to return true
    (checkPassword as jest.Mock).mockResolvedValue(true);

    // Mock genToken to return a token
    (genToken as jest.Mock).mockReturnValue('mock-token');

    // Mock validation to simulate valid input
    (userValidate.validate as jest.Mock).mockReturnValue({
      error: null,
    });

    const response = await request(app)
      .post('/login')
      .send({ email: 'user@example.com', password: 'Password123' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful.');
    expect(response.body.token).toBe('mock-token');
  });

  it('should return 500 if there is a server error', async () => {
    // Mock dbPool.query to simulate an error
    (dbPool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

    // Mock checkPassword to also throw an error
    (checkPassword as jest.Mock).mockRejectedValue(
      new Error('Password check error')
    );

    // Mock validation to simulate valid input
    (userValidate.validate as jest.Mock).mockReturnValue({
      error: null,
    });

    const response = await request(app)
      .post('/login')
      .send({ email: 'user@example.com', password: 'Password123' });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal server error.');
  });
});
