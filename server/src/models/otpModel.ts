import { Pool, RowDataPacket } from 'mysql2/promise';

export const saveOTPToDatabase = async (
  pool: Pool,
  email: string,
  otp: string,
  expiresAt: string
) => {
  await pool.query(
    'INSERT INTO otp_codes (email, otp, expires_at) VALUES (?, ?, ?)',
    [email, otp, expiresAt]
  );
};

export const getOTPFromDatabase = async (pool: Pool, email: string) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT otp, expires_at FROM otp_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1',
    [email]
  );

  // ตรวจสอบผลลัพธ์ว่ามีข้อมูลหรือไม่
  return rows.length ? rows[0] : null;
};

export const deleteOTP = async (pool: Pool, email: string) => {
  await pool.query('DELETE FROM otp_codes WHERE email = ?', [email]);
};
