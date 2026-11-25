import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {mkdir, stat, writeFile} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = path.join(rootDir, 'public', 'images');
const buildDir = path.join(rootDir, 'build');
const serveStatic = process.env.SERVE_STATIC === 'true';
const jsonServerPort = Number(process.env.JSON_SERVER_PORT || 3001);
const apiPort = Number(process.env.PORT || process.env.API_PORT || 3000);
const apiHost = process.env.HOST || (serveStatic ? '0.0.0.0' : '127.0.0.1');
const maxFileSize = 10 * 1024 * 1024;

const mimeToExt = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif'
};

const extToMime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.avif': 'image/avif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2'
};

const jsonServer = spawn(
    process.execPath,
    [path.join(rootDir, 'node_modules/json-server/lib/bin.js'), 'db.json', '--port', String(jsonServerPort)],
    {cwd: rootDir, stdio: 'inherit', windowsHide: true}
);

function sendJson(res, status, payload) {
    const body = JSON.stringify(payload);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body)
    });
    res.end(body);
}

function sanitizeBaseName(rawName) {
    let decoded = rawName || 'photo';
    try {
        decoded = decodeURIComponent(decoded);
    } catch {
        // Keep raw header if not URI-encoded.
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

async function handleUpload(req, res) {
    const contentType = (req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
    const ext = mimeToExt[contentType];
    if (!ext) {
        sendJson(res, 400, {error: 'Підтримуються лише зображення JPG, PNG, WebP, GIF або AVIF.'});
        return;
    }

    const declaredLength = Number(req.headers['content-length'] || 0);
    if (declaredLength > maxFileSize) {
        sendJson(res, 413, {error: 'Розмір зображення не повинен перевищувати 10 МБ.'});
        return;
    }

    const chunks = [];
    let total = 0;
    let tooLarge = false;

    for await (const chunk of req) {
        total += chunk.length;
        if (total > maxFileSize) {
            tooLarge = true;
            break;
        }
        chunks.push(chunk);
    }

    if (tooLarge) {
        sendJson(res, 413, {error: 'Розмір зображення не повинен перевищувати 10 МБ.'});
        return;
    }

    if (total === 0) {
        sendJson(res, 400, {error: 'Файл порожній. Оберіть зображення ще раз.'});
        return;
    }

    const headerName = Array.isArray(req.headers['x-file-name'])
        ? req.headers['x-file-name'][0]
        : req.headers['x-file-name'];
    const baseName = sanitizeBaseName(headerName);
    const filename = `${baseName}-${Date.now()}-${randomBytes(3).toString('hex')}${ext}`;
    const targetPath = path.join(imagesDir, filename);

    await mkdir(imagesDir, {recursive: true});
    await writeFile(targetPath, Buffer.concat(chunks));

    sendJson(res, 201, {path: `images/${filename}`, filename});
}

async function sendFile(req, res, filePath, cacheControl = 'no-cache') {
    const info = await stat(filePath);
    if (!info.isFile()) return false;
    const mime = extToMime[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
        'Content-Type': mime,
        'Content-Length': info.size,
        'Cache-Control': cacheControl
    });
    if (req.method === 'HEAD') {
        res.end();
        return true;
    }
    createReadStream(filePath).pipe(res);
    return true;
}

async function handleImageRequest(req, res, pathname) {
    let rawName = pathname.slice('/images/'.length);
    try {
        rawName = decodeURIComponent(rawName);
    } catch {
        res.writeHead(400);
        res.end();
        return;
    }

    if (!rawName || rawName.includes('/') || rawName.includes('\\') || rawName.includes('..')) {
        res.writeHead(400);
        res.end();
        return;
    }

    const filePath = path.join(imagesDir, rawName);
    try {
        const sent = await sendFile(req, res, filePath);
        if (!sent) {
            res.writeHead(404);
            res.end();
        }
    } catch {
        res.writeHead(404);
        res.end();
    }
}

async function handleStaticRequest(req, res, pathname) {
    let decoded = pathname;
    try {
        decoded = decodeURIComponent(pathname);
    } catch {
        res.writeHead(400);
        res.end();
        return;
    }

    const relative = decoded.replace(/^\/+/, '');
    const candidate = path.resolve(buildDir, relative);
    if (candidate.startsWith(buildDir + path.sep)) {
        try {
            const cache = relative.startsWith('assets/') ? 'public, max-age=31536000, immutable' : 'no-cache';
            if (await sendFile(req, res, candidate, cache)) return;
        } catch {
            // Fall back to index.html for SPA routes.
        }
    }

    try {
        await sendFile(req, res, path.join(buildDir, 'index.html'));
    } catch {
        res.writeHead(404);
        res.end('Not found');
    }
}

function proxyToJsonServer(req, res, targetPath) {
    const proxyReq = http.request(
        {
            hostname: '127.0.0.1',
            port: jsonServerPort,
            path: targetPath,
            method: req.method,
            headers: {...req.headers, host: `127.0.0.1:${jsonServerPort}`}
        },
        proxyRes => {
            res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
            proxyRes.pipe(res);
        }
    );

    proxyReq.on('error', () => {
        if (!res.headersSent) {
            sendJson(res, 503, {error: 'API сервер ще запускається. Спробуйте ще раз.'});
        } else {
            res.end();
        }
    });

    req.pipe(proxyReq);
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://127.0.0.1:${apiPort}`);

    if (req.method === 'POST' && (url.pathname === '/upload' || url.pathname === '/api/upload')) {
        try {
            await handleUpload(req, res);
        } catch (error) {
            console.error('[UPLOAD]', error);
            if (!res.headersSent) {
                sendJson(res, 500, {error: 'Не вдалося зберегти зображення на сервері.'});
            }
        }
        return;
    }

    if ((req.method === 'GET' || req.method === 'HEAD') && url.pathname.startsWith('/images/')) {
        await handleImageRequest(req, res, url.pathname);
        return;
    }

    if (serveStatic) {
        if (url.pathname.startsWith('/api/')) {
            const stripped = url.pathname.slice('/api'.length) + url.search;
            proxyToJsonServer(req, res, stripped || '/');
            return;
        }
        if (req.method === 'GET' || req.method === 'HEAD') {
            await handleStaticRequest(req, res, url.pathname);
            return;
        }
    }

    proxyToJsonServer(req, res, req.url || '/');
});

server.listen(apiPort, apiHost, () => {
    console.log(
        `API server listening on http://${apiHost}:${apiPort} (uploads -> public/images${serveStatic ? ', serving build/' : ''})`
    );
});

const shutdown = (code = 0) => {
    server.close();
    if (!jsonServer.killed) {
        jsonServer.kill();
    }
    process.exit(code);
};

jsonServer.on('exit', code => shutdown(code ?? 0));
jsonServer.on('error', error => {
    console.error(error);
    shutdown(1);
});
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
