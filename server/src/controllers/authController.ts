import { Request, RequestHandler, Response } from 'express';
import { Pool } from 'mysql2/promise';
import dbPool from '../db';
import {
  checkUserExists,
  generateUserId,
  hashPassword,
  userValidate,
  UserInterface,
  checkPassword,
  genToken,
} from '../utils/authUtils';
import { CustomUserRequest } from '../middlewares/authMiddleware';

export const register: RequestHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const pool: Pool = dbPool;
  const { error } = userValidate.validate({ email, password });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    if (await checkUserExists(pool, email)) {
      return res.status(400).json({ message: 'Email is already in use.' });
    }

    const hashedPassword = await hashPassword(password);
    const userId = generateUserId();

    await pool.query(
      'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
      [userId, email, hashedPassword]
    );
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const login: RequestHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const pool: Pool = dbPool;

  // Validate request data
  const { error } = userValidate.validate({ email, password });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Find user by email
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);

    // If no user is found
    if ((rows as UserInterface[]).length === 0) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const user = (rows as UserInterface[])[0];

    // Check if the provided password matches the stored hashed password
    const isPasswordValid = await checkPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }
    //gen jwt token

    const token = genToken({ id: user.id, email: user.email });
    // Respond with success message
    res.status(200).json({ message: 'Login successful.', token });
  } catch (error) {
    // Handle unexpected errors
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const protectedAdmin = (req: CustomUserRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized access.' });
  }

  // Route ที่เข้าถึงได้หลังจากพิสูจน์ตัวตน
  res
    .status(200)
    .json({ message: 'This is a protected route.', user: req.user });
};
