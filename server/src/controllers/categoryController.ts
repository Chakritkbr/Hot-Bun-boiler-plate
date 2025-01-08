import { Request, Response } from 'express';
import { Category, CategoryInterface } from '../models/categoryModel';
import { categoryValidate } from '../utils/validateUtils';

export class CategoryController {
  private categoryService: Category;

  constructor() {
    this.categoryService = new Category();
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const { error } = categoryValidate.validate(req.body);
      if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
      }
      const category: CategoryInterface = req.body;
      const isExist = await this.categoryService.isNameExist(category.name);
      if (isExist) {
        res.status(409).json({ message: 'Category name already exists.' });
        return;
      }
      await this.categoryService.create(category);
      res.status(201).json({ message: 'Category created successfully.' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error creating category.' });
    }
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.categoryService.getAll();
      res.status(200).json(categories);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error retrieving categories' });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await this.categoryService.getById(id);
      if (category) {
        res.status(200).json(category);
      } else {
        res.status(404).json({ message: 'Category not found.' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving category.' });
    }
  }

  public async updateById(req: Request, res: Response): Promise<void> {
    try {
      const { error } = categoryValidate.validate(req.body);
      if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
      }
      const { id } = req.params;
      const updates: Partial<CategoryInterface> = req.body;
      if (updates.name) {
        const isExist = await this.categoryService.isUpdateNameExist(
          id,
          updates.name
        );
        if (isExist) {
          res.status(409).json({ message: 'Category name already exists.' });
          return;
        }
      }
      await this.categoryService.updateById(id, updates);
      res.status(200).json({ message: 'Category updated successfully.' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error updating category.' });
    }
  }

  public async deleteById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.categoryService.deleteById(id);
      res.status(204).send();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error deleting category.' });
    }
  }
}
