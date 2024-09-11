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
import { genOTPAndSave, isOTPExpired } from '../utils/otpUtils';
import { sendOtp } from '../utils/emailUtils';
import { deleteOTP, getOTPFromDatabase } from '../models/otpModel';

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
    console.error('Error in register:', error);
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
    return res.status(400).json({ message: error.details[0].message });
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
    return res.status(200).json({ message: 'User updated successfully.' });
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

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const otp = await genOTPAndSave(pool, email);

    await sendOtp(email, otp);

    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  // ตรวจสอบว่าค่า email และ otp ถูกส่งมาหรือไม่
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  try {
    const storedOTPData = await getOTPFromDatabase(pool, email);

    if (!storedOTPData) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    const { otp: storedOTP, expires_at: expiresAt } = storedOTPData;

    if (storedOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    if (isOTPExpired(expiresAt)) {
      return res.status(400).json({ message: 'OTP expired.' });
    }

    // ลบ OTP หลังจากที่ใช้งานเสร็จ
    await deleteOTP(pool, email);

    res
      .status(200)
      .json({ message: 'OTP verified. Proceed with password reset.' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
