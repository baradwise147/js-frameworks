import mongoose from 'mongoose';
import {Product} from '../models/Product.js';

export const getProducts = async (req, res, next) => {
    try {
        const filter = {};
        if (typeof req.query.category === 'string' && req.query.category) {
            filter.category = req.query.category;
        }
        if (typeof req.query.city === 'string' && req.query.city) {
            filter.city = req.query.city;
        }
        if (typeof req.query.status === 'string' && req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.tracked === 'true') {
            filter.tracked = true;
        }
        if (typeof req.query.search === 'string' && req.query.search.trim()) {
            const escaped = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.name = {$regex: escaped, $options: 'i'};
        }

        const products = await Product.find(filter).sort({createdAt: 1});
        return res.json(products);
    } catch (err) {
        return next(err);
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const {id} = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({message: 'Оголошення не знайдено.'});
        }
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({message: 'Оголошення не знайдено.'});
        }
        return res.json(product);
    } catch (err) {
        return next(err);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const payload = {
            name: req.body.name.trim(),
            category: req.body.category || 'Квартира',
            city: req.body.city.trim(),
            price: req.body.price,
            area: req.body.area,
            rooms: req.body.rooms,
            description: req.body.description.trim(),
            image: req.body.image || 'images/apartment.jpg',
            status: req.body.status || 'Активне',
            tracked: Boolean(req.body.tracked),
            ...(req.user?.userId ? {createdBy: req.user.userId} : {})
        };
        const product = new Product(payload);
        await product.save();
        return res.status(201).json(product);
    } catch (err) {
        return next(err);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const {id} = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({message: 'Оголошення не знайдено.'});
        }
        const payload = {
            name: req.body.name.trim(),
            category: req.body.category || 'Квартира',
            city: req.body.city.trim(),
            price: req.body.price,
            area: req.body.area,
            rooms: req.body.rooms,
            description: req.body.description.trim(),
            image: req.body.image || 'images/apartment.jpg',
            status: req.body.status || 'Активне',
            tracked: Boolean(req.body.tracked)
        };
        const updated = await Product.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });
        if (!updated) {
            return res.status(404).json({message: 'Оголошення не знайдено.'});
        }
        return res.json(updated);
    } catch (err) {
        return next(err);
    }
};

export const patchProduct = async (req, res, next) => {
    try {
        const {id} = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({message: 'Оголошення не знайдено.'});
        }
        const allowed = ['name', 'category', 'city', 'price', 'area', 'rooms', 'description', 'image', 'status', 'tracked'];
        const updates = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) {
                updates[key] = typeof req.body[key] === 'string' ? req.body[key].trim() : req.body[key];
            }
        }
        const updated = await Product.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });
        if (!updated) {
            return res.status(404).json({message: 'Оголошення не знайдено.'});
        }
        return res.json(updated);
    } catch (err) {
        return next(err);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const {id} = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({message: 'Оголошення не знайдено.'});
        }
        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({message: 'Оголошення не знайдено.'});
        }
        return res.json({message: 'Оголошення успішно видалено.'});
    } catch (err) {
        return next(err);
    }
};
