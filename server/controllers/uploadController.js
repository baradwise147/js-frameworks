import {randomBytes} from 'node:crypto';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const imagesDir = path.join(rootDir, 'public', 'images');

const mimeToExt = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif'
};

function sanitizeBaseName(rawName) {
    let decoded = rawName || 'photo';
    try {
        decoded = decodeURIComponent(decoded);
    } catch {
        // Keep raw value if not URI-encoded.
    }
    const base = path.basename(decoded, path.extname(decoded))
        .normalize('NFKD')
        .replace(/[^\w-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()
        .slice(0, 40);
    return base || 'photo';
}

export const uploadImage = async (req, res, next) => {
    try {
        const contentType = (req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
        const ext = mimeToExt[contentType];
        if (!ext) {
            return res.status(400).json({message: 'Підтримуються лише зображення JPG, PNG, WebP, GIF або AVIF.'});
        }

        if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
            return res.status(400).json({message: 'Файл порожній. Оберіть зображення ще раз.'});
        }

        const headerName = Array.isArray(req.headers['x-file-name'])
            ? req.headers['x-file-name'][0]
            : req.headers['x-file-name'];
        const baseName = sanitizeBaseName(headerName);
        const filename = `${baseName}-${Date.now()}-${randomBytes(3).toString('hex')}${ext}`;
        const targetPath = path.join(imagesDir, filename);

        await mkdir(imagesDir, {recursive: true});
        await writeFile(targetPath, req.body);

        return res.status(201).json({path: `images/${filename}`, filename});
    } catch (err) {
        return next(err);
    }
};
