import dotenv from 'dotenv';
import {createApp} from './server/app.js';
import {connectDB} from './server/services/db.js';

dotenv.config();

const app = createApp();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || (process.env.SERVE_STATIC === 'true' ? '0.0.0.0' : '127.0.0.1');

async function start() {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(PORT, HOST, () => {
            console.log(`Server running on http://${HOST}:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
}

void start();
