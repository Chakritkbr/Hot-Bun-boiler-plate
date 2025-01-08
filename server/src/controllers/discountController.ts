import { Request, Response } from 'express';
import { Discount, DiscountInterface } from '../models/discountModel';
import { discountValidate } from '../utils/validateUtils';

export class DiscountController {
  private discountService: Discount;

  constructor() {
    this.discountService = new Discount();
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const { error } = discountValidate.validate(req.body);
      if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
      }
      const discount: DiscountInterface = req.body;
      await this.discountService.create(discount);
      res.status(201).json({ message: 'Discount created successfully.' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error creating discount.' });
    }
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const discounts = await this.discountService.getAll();
      res.status(200).json(discounts);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error retrieving discounts.' });
    }
  }

  public async getAllExpiredDiscount(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const expiredDiscounts =
        await this.discountService.getAllExpiredDiscount();
      res.status(200).json(expiredDiscounts);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error retrieving expired discounts.' });
    }
  }

  public async getAllActiveDiscount(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const activeDiscounts = await this.discountService.getAllActiveDiscount();
      console.log(activeDiscounts);
      res.status(200).json(activeDiscounts);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error retrieving active discounts.' });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const discount = await this.discountService.getById(id);
      if (discount) {
        res.status(200).json(discount);
      } else {
        res.status(404).json({ message: 'Discount not found.' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving discount.' });
    }
  }

  public async updateById(req: Request, res: Response): Promise<void> {
    try {
      const { error } = discountValidate.validate(req.body);
      if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
      }
      const { id } = req.params;
      const updates: Partial<DiscountInterface> = req.body;
      await this.discountService.updateById(id, updates);
      res.status(200).json({ message: 'Discount updated successfully.' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error updating discount.' });
    }
  }

  public async deleteById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.discountService.deleteById(id);
      res.status(204).send();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error deleting discount.' });
    }
  }
}
