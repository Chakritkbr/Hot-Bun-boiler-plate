import {
  createProduct,
  deleteProductById,
  getAllproducts,
  getProductById,
  Product,
  updateProductById,
} from './../models/productModel';
import { Request, Response } from 'express';

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, stock } = req.body;
    await createProduct({ name, description, price, stock });
    res.status(201).json({ message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};
export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await getAllproducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

export const getDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<Product> = req.body;

    const product = await getProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    await updateProductById(id, updates);

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await deleteProductById(id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};
