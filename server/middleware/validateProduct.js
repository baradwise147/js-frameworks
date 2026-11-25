import {CATEGORIES, PROPERTY_STATUSES} from '../models/Product.js';

export const validateProduct = (req, res, next) => {
    const {name, category, city, price, area, rooms, description, status} = req.body ?? {};

    if (typeof name !== 'string' || name.trim().length < 5 || name.trim().length > 100) {
        return res.status(400).json({message: 'Вкажіть назву оголошення від 5 до 100 символів.'});
    }
    if (category !== undefined && !CATEGORIES.includes(category)) {
        return res.status(400).json({message: 'Оберіть коректний тип нерухомості.'});
    }
    if (typeof city !== 'string' || city.trim().length < 2 || city.trim().length > 60) {
        return res.status(400).json({message: 'Вкажіть місто від 2 до 60 символів.'});
    }
    if (typeof price !== 'number' || !Number.isFinite(price) || price < 1 || price > 1000000000) {
        return res.status(400).json({message: 'Ціна має бути числом від 1 до 1 000 000 000 $.'});
    }
    if (typeof area !== 'number' || !Number.isFinite(area) || area < 1 || area > 100000) {
        return res.status(400).json({message: 'Площа має бути числом від 1 до 100 000 м².'});
    }
    if (typeof rooms !== 'number' || !Number.isInteger(rooms) || rooms < 1 || rooms > 1000) {
        return res.status(400).json({message: 'Кількість кімнат має бути цілим числом від 1 до 1000.'});
    }
    if (typeof description !== 'string' || description.trim().length < 20 || description.trim().length > 3000) {
        return res.status(400).json({message: 'Опис має містити від 20 до 3000 символів.'});
    }
    if (status !== undefined && !PROPERTY_STATUSES.includes(status)) {
        return res.status(400).json({message: 'Оберіть коректний статус трекінгу.'});
    }

    return next();
};

export const validatePartialProduct = (req, res, next) => {
    const body = req.body ?? {};
    if (typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length === 0) {
        return res.status(400).json({message: 'Передайте поля для оновлення.'});
    }
    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length < 5 || body.name.trim().length > 100)) {
        return res.status(400).json({message: 'Назва має містити від 5 до 100 символів.'});
    }
    if (body.category !== undefined && !CATEGORIES.includes(body.category)) {
        return res.status(400).json({message: 'Непідтримуваний тип нерухомості.'});
    }
    if (body.city !== undefined && (typeof body.city !== 'string' || body.city.trim().length < 2 || body.city.trim().length > 60)) {
        return res.status(400).json({message: 'Вкажіть місто від 2 до 60 символів.'});
    }
    if (body.price !== undefined && (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price < 1)) {
        return res.status(400).json({message: 'Ціна має бути числом більше 0.'});
    }
    if (body.area !== undefined && (typeof body.area !== 'number' || !Number.isFinite(body.area) || body.area < 1)) {
        return res.status(400).json({message: 'Площа має бути числом більше 0.'});
    }
    if (body.rooms !== undefined && (typeof body.rooms !== 'number' || !Number.isInteger(body.rooms) || body.rooms < 1)) {
        return res.status(400).json({message: 'Кількість кімнат має бути цілим числом більше 0.'});
    }
    if (body.description !== undefined && (typeof body.description !== 'string' || body.description.trim().length < 20)) {
        return res.status(400).json({message: 'Опис має містити щонайменше 20 символів.'});
    }
    if (body.status !== undefined && !PROPERTY_STATUSES.includes(body.status)) {
        return res.status(400).json({message: 'Непідтримуваний статус трекінгу.'});
    }
    if (body.tracked !== undefined && typeof body.tracked !== 'boolean') {
        return res.status(400).json({message: 'Поле tracked має бути логічним значенням.'});
    }

    return next();
};
