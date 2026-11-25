// @vitest-environment node
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import request from 'supertest';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createApp} from './app.js';
import {getJwtSecret} from './middleware/authMiddleware.js';
import {Product} from './models/Product.js';
import {User} from './models/User.js';

const validId = new mongoose.Types.ObjectId().toString();
const validProductBody = {
    name: 'Світла квартира на Подолі',
    category: 'Квартира',
    city: 'Київ',
    price: 89000,
    area: 64,
    rooms: 2,
    description: 'Світлий простір із продуманим плануванням та великими вікнами.',
    image: 'images/apartment.jpg',
    status: 'Активне',
    tracked: true
};

describe('Haven Express REST API (Supertest)', () => {
    let app;
    let token;

    beforeEach(() => {
        process.env.NODE_ENV = 'test';
        app = createApp();
        token = jwt.sign({userId: validId, userName: 'tester'}, getJwtSecret(), {expiresIn: '1h'});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns health status on GET /api/health', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({status: 'ok', service: 'haven-backend'});
    });

    it('lists products openly on GET /api/products', async () => {
        const mockDocs = [{_id: validId, id: validId, ...validProductBody}];
        vi.spyOn(Product, 'find').mockReturnValue({
            sort: vi.fn().mockResolvedValue(mockDocs)
        });

        const res = await request(app).get('/api/products');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].name).toBe(validProductBody.name);
    });

    it('returns 404 for invalid ObjectId on GET /api/products/:id', async () => {
        const res = await request(app).get('/api/products/not-valid-id');
        expect(res.status).toBe(404);
    });

    it('blocks unauthenticated POST /api/products with 401', async () => {
        const res = await request(app).post('/api/products').send(validProductBody);
        expect(res.status).toBe(401);
    });

    it('validates product payload via middleware and returns 400 on bad data', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send({...validProductBody, name: 'Аб', price: -10});
        expect(res.status).toBe(400);
        expect(res.body.message).toBeTruthy();
    });

    it('creates a product when authenticated and payload is valid', async () => {
        vi.spyOn(Product.prototype, 'save').mockResolvedValueOnce(undefined);

        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send(validProductBody);

        expect(res.status).toBe(201);
        expect(res.body.name).toBe(validProductBody.name);
        expect(res.body.id).toBeTruthy();
    });

    it('patches tracking fields on PATCH /api/products/:id', async () => {
        const updated = {_id: validId, id: validId, ...validProductBody, status: 'Заброньовано'};
        vi.spyOn(Product, 'findByIdAndUpdate').mockResolvedValueOnce(updated);

        const res = await request(app)
            .patch(`/api/products/${validId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({status: 'Заброньовано'});

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('Заброньовано');
    });

    it('deletes a product on DELETE /api/products/:id', async () => {
        vi.spyOn(Product, 'findByIdAndDelete').mockResolvedValueOnce({_id: validId});

        const res = await request(app)
            .delete(`/api/products/${validId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toContain('видалено');
    });

    it('registers and logs in a user with bcrypt + JWT', async () => {
        const hashedPassword = await bcrypt.hash('secret123', 4);
        vi.spyOn(User, 'findOne').mockResolvedValueOnce(null);
        vi.spyOn(User.prototype, 'save').mockResolvedValueOnce(undefined);

        const regRes = await request(app)
            .post('/api/auth/register')
            .send({userName: 'olena', password: 'secret123'});

        expect(regRes.status).toBe(201);
        expect(regRes.body.token).toBeTruthy();
        expect(regRes.body.user.userName).toBe('olena');

        vi.spyOn(User, 'findOne').mockResolvedValueOnce({
            _id: validId,
            userName: 'olena',
            password: hashedPassword
        });

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({userName: 'olena', password: 'secret123'});

        expect(loginRes.status).toBe(200);
        expect(loginRes.body.token).toBeTruthy();

        const meRes = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${loginRes.body.token}`);

        expect(meRes.status).toBe(200);
        expect(meRes.body.user.userName).toBe('olena');
    });
});
