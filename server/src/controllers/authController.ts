import { Request, RequestHandler, Response } from 'express';
import { Pool, ResultSetHeader } from 'mysql2/promise';
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

//DB connect
const pool: Pool = dbPool;

export const register: RequestHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;

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
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate request data
  const { error } = userValidate.validate({ email, password });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Find user by email
    const [rows] = await pool.query<UserInterface[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    // If no user is found
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Check if the provided password matches the stored hashed password
    const user = rows[0];
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

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, password } = req.body;
  const { error } = userValidate.validate({ email, password });

  if (error) {
    res.status(400).json({ message: error.details[0].message });
  }
  try {
    const [rows] = await pool.query<UserInterface[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (await checkUserExists(pool, email)) {
      return res.status(400).json({ message: 'Email is already use' });
    }

    const hashedPassword = await hashPassword(password);
    await pool.query('UPDATE users SET email = ?, password = ? WHERE id = ? ', [
      email,
      hashedPassword,
      id,
    ]);
    res.status(200).json({ message: 'User updated successfully.' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    // ตรวจสอบว่ามีการลบแถวหรือไม่
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.log('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
