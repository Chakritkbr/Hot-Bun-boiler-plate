import express, { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';

const router: Router = express.Router();

const categoryController = new CategoryController();

router.post('/categories', categoryController.create.bind(categoryController));
router.get('/categories', categoryController.getAll.bind(categoryController));
router.get(
  '/categories/:id',
  categoryController.getById.bind(categoryController)
);
router.patch(
  '/categories/:id',
  categoryController.updateById.bind(categoryController)
);
router.delete(
  '/categories/:id',
  categoryController.deleteById.bind(categoryController)
);

export default router;
