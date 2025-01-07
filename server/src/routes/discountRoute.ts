import express, { Router } from 'express';
import { DiscountController } from '../controllers/discountController';

const router: Router = express.Router();

const discountController = new DiscountController();

router.post('/discount', discountController.create.bind(discountController));
router.get('/discount', discountController.getAll.bind(discountController));
router.get(
  '/discount/expired',
  discountController.getAllExpiredDiscount.bind(discountController)
);
router.get(
  '/discount/active',
  discountController.getAllActiveDiscount.bind(discountController)
);
router.get(
  '/discount/:id',
  discountController.getById.bind(discountController)
);
router.patch(
  '/discount/:id',
  discountController.updateById.bind(discountController)
);
router.delete(
  '/discount/:id',
  discountController.deleteById.bind(discountController)
);

export default router;
