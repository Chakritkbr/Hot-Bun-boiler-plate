import { Pool } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import dbPool from '../db';

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

//DB connect
const pool: Pool = dbPool;

export const createProduct = async (product: Product): Promise<void> => {
  const id = uuidv4();
  const { name, description, price, stock } = product;

  const db =
    'INSERT INTO products (id, name, description, price, stock) VALUES (?,?,?,?,?)';

  await pool.execute(db, [id, name, description, price, stock]);
};

export const getAllproducts = async (): Promise<Product[]> => {
  const [rows] = await pool.query('SELECT * FROM products');
  return rows as Product[];
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  const product = (rows as Product[])[0];
  return product || null;
};

export const updateProductById = async (
  id: string,
  updates: Partial<Product>
): Promise<void> => {
  const fields = Object.keys(updates);
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  const sql = `UPDATE products SET ${fields
    .map((field) => `${field} = ?`)
    .join(', ')} WHERE id = ?`;
  const values = [
    ...fields.map((field) => updates[field as keyof Product]),
    id,
  ];
  await pool.execute(sql, values);
};

export const deleteProductById = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM products WHERE id = ?', [id]);
};
