import { Pool } from 'mysql2/promise';
import otpGenerator from 'otp-generator';
import { saveOTPToDatabase } from '../models/otpModel';

const formatDateForMySQL = (date: Date): string => {
  // แปลงเวลาให้เป็น UTC ก่อนส่งไปยัง MySQL
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const formatDateForLocal = (date: Date): string => {
  // แปลงเวลาให้เป็นเวลาในโซน Asia/Bangkok
  const offset = 7 * 60; // UTC+7
  const localTime = new Date(date.getTime() + offset * 60 * 1000);
  return localTime.toISOString().slice(0, 19).replace('T', ' ');
};

export const genOTPAndSave = async (pool: Pool, email: string) => {
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const expiresAt = formatDateForMySQL(new Date(Date.now() + 10 * 60000)); // 10 นาทีในอนาคต

  await saveOTPToDatabase(pool, email, otp, expiresAt);

  return otp;
};

export const isOTPExpired = (expiresAt: string) => {
  // แปลงค่า expiresAt จากฐานข้อมูลเป็น Date ใน UTC
  const expirationTimeInUTC = new Date(expiresAt + 'Z'); // เพิ่ม 'Z' เพื่อระบุว่าเป็น UTC

  // เวลาปัจจุบันใน UTC
  const currentTime = new Date();

  console.log('Expiration Time in UTC:', expirationTimeInUTC.toISOString());
  console.log('Current Time (UTC):', currentTime.toISOString());

  return currentTime > expirationTimeInUTC;
};

console.log('Current Time (Node.js):', new Date().toISOString());
