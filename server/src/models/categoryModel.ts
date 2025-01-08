import { Pool } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import dbPool from '../db';

export interface CategoryInterface {
  id?: string;
  name: string;
  description: string;
}

export class Category {
  private pool: Pool;

  constructor() {
    this.pool = dbPool;
  }

  public async isNameExist(name: string): Promise<Boolean> {
    const [row] = await this.pool.query(
      'SELECT COUNT(*) as count FROM category WHERE name = ?',
      [name]
    );
    const count = (row as any[])[0].count;
    return count > 0;
  }
  public async isUpdateNameExist(id: string, name: string): Promise<boolean> {
    const [rows] = await this.pool.query(
      'SELECT COUNT(*) as count FROM category WHERE name = ? AND id != ?',
      [name, id]
    );
    const count = (rows as any[])[0].count;
    return count > 0;
  }

  public async create(category: CategoryInterface): Promise<void> {
    const id = uuidv4();
    const { name, description } = category;
    const q = 'INSERT INTO category (id, name, description) VALUES (?, ?, ?)';
    await this.pool.execute(q, [id, name, description]);
  }

  public async getAll(): Promise<CategoryInterface[]> {
    const [rows] = await this.pool.query('SELECT * FROM category');
    return rows as CategoryInterface[];
  }

  public async getById(id: string): Promise<CategoryInterface | null> {
    const [rows] = await this.pool.query(
      'SELECT * FROM category WHERE id = ?',
      [id]
    );
    const category = (rows as CategoryInterface[])[0];
    return category || null;
  }

  public async updateById(
    id: string,
    updates: Partial<CategoryInterface>
  ): Promise<void> {
    const fields = Object.keys(updates);
    if (fields.length === 0) {
      throw new Error('No fields update');
    }
    const q = `UPDATE category SET ${fields
      .map((field) => `${field} = ?`)
      .join(', ')} WHERE id = ?`;
    const values = [
      ...fields.map((field) => updates[field as keyof CategoryInterface]),
      id,
    ];
    await this.pool.execute(q, values);
  }

  public async deleteById(id: string): Promise<void> {
    await this.pool.query('DELETE FROM category WHERE id = ?', [id]);
  }
}
