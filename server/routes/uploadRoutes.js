import express from 'express';
import {uploadImage} from '../controllers/uploadController.js';
import {authRequired} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authRequired, express.raw({type: 'image/*', limit: '10mb'}), uploadImage);

export default router;
