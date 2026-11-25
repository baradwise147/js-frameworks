import path from 'node:path';
import {fileURLToPath} from 'node:url';
import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import {errorHandler} from './middleware/errorHandler.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = path.join(rootDir, 'public', 'images');
const buildDir = path.join(rootDir, 'build');

export function createApp() {
    const app = express();

    const rawOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').trim();
    const allowAll = rawOrigins === '*';
    const allowedOrigins = rawOrigins
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean);

    app.use(
        cors({
            origin: (origin, callback) => {
                if (!origin || allowAll || allowedOrigins.includes(origin)) {
                    return callback(null, true);
                }
                return callback(new Error('Not allowed by CORS'));
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
        })
    );

    app.use((req, _res, next) => {
        if (process.env.NODE_ENV !== 'test') {
            console.log(`[API] ${req.method} ${req.originalUrl}`);
        }
        next();
    });

    app.use('/api/upload', uploadRoutes);
    app.use(express.json());

    app.get('/api/health', (_req, res) => {
        res.json({status: 'ok', service: 'haven-backend'});
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);

    // Compatibility aliases without /api prefix
    app.use('/auth', authRoutes);
    app.use('/products', productRoutes);

    app.use('/images', express.static(imagesDir));

    if (process.env.SERVE_STATIC === 'true') {
        app.use(express.static(buildDir));
        app.use((req, res, next) => {
            if (req.method !== 'GET' || req.path.startsWith('/api/')) {
                return next();
            }
            return res.sendFile(path.join(buildDir, 'index.html'));
        });
    }

    app.use(errorHandler);
    return app;
}
