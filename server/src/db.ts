import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const dbPool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'adminhotbun',
  password: process.env.DB_PASSWORD || 'hotbun2024',
  database: process.env.DB_NAME || 'hotbunDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default dbPool;
