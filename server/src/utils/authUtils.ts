import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Pool, RowDataPacket } from 'mysql2/promise';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

export interface UserInterface extends RowDataPacket {
  id: string;
  email: string;
  password: string;
  role?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'mamamiayoohoo';

export const genToken = (payload: object, expiresIn: string = '1h') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string): object | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as object;
  } catch {
    return null;
  }
};

export const checkUserExists = async (pool: Pool, email: string) => {
  const [rows] = await pool.query<UserInterface[]>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows.length > 0;
};

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

export const checkPassword = async (
  inputPassword: string,
  hashedPassword: string
) => {
  return bcrypt.compare(inputPassword, hashedPassword);
};

export const generateUserId = () => {
  return uuidv4();
};
