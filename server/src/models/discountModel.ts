import { Pool } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import dbPool from '../db';

export interface DiscountInterface {
  id?: string;
  code: string;
  percentage: number;
  start_date: Date;
  end_date: Date;
}

export class Discount {
  private pool: Pool;

  constructor() {
    this.pool = dbPool;
  }

  public async create(discount: DiscountInterface): Promise<void> {
    const id = uuidv4();
    const { code, percentage, start_date, end_date } = discount;
    const q =
      'INSERT INTO discount (id, code, percentage, start_date, end_date) VALUES (?, ?, ?, ?, ?)';
    await this.pool.execute(q, [id, code, percentage, start_date, end_date]);
  }

  public async getAll(): Promise<DiscountInterface[]> {
    const [rows] = await this.pool.query('SELECT * FROM discount');
    return rows as DiscountInterface[];
  }

  public async getAllExpiredDiscount(): Promise<DiscountInterface[]> {
    const q = 'SELECT * FROM discount WHERE end_date < CURDATE()';
    const [rows] = await this.pool.query(q);
    return rows as DiscountInterface[];
  }

  public async getAllActiveDiscount(): Promise<DiscountInterface[]> {
    const q =
      'SELECT * FROM discount WHERE start_date <= NOW() AND end_date >= NOW()';
    const [rows] = await this.pool.query(q);
    return rows as DiscountInterface[];
  }
  public async getById(id: string): Promise<DiscountInterface | null> {
    const [rows] = await this.pool.query(
      'SELECT * FROM discount WHERE id = ?',
      [id]
    );
    const discount = (rows as DiscountInterface[])[0];
    return discount || null;
  }

  public async updateById(
    id: string,
    updates: Partial<DiscountInterface>
  ): Promise<void> {
    const fields = Object.keys(updates);
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    const q = `UPDATE discount SET ${fields
      .map((field) => `${field} = ?`)
      .join(', ')} WHERE id = ?`;
    const values = [
      ...fields.map((field) => updates[field as keyof DiscountInterface]),
      id,
    ];
    await this.pool.execute(q, values);
  }

  public async deleteById(id: string): Promise<void> {
    await this.pool.query('DELETE FROM discount WHERE id = ?', [id]);
  }
}
