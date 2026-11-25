import express from 'express';
import {
    createProduct,
    deleteProduct,
    getProductById,
    getProducts,
    patchProduct,
    updateProduct
} from '../controllers/productController.js';
import {authRequired} from '../middleware/authMiddleware.js';
import {validatePartialProduct, validateProduct} from '../middleware/validateProduct.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authRequired, validateProduct, createProduct);
router.put('/:id', authRequired, validateProduct, updateProduct);
router.patch('/:id', authRequired, validatePartialProduct, patchProduct);
router.delete('/:id', authRequired, deleteProduct);

export default router;
