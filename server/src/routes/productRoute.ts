import express, { Request, Response, RequestHandler } from 'express';
import * as productControllers from '../controllers/productController';

const router = express.Router();

router.post('/products', productControllers.create);
router.get('/products', productControllers.getAll);
router.get('/products/:id', productControllers.getDetails);
router.patch('/products/:id', productControllers.update);
router.delete('/products/:id', productControllers.deleteProduct);

export default router;
