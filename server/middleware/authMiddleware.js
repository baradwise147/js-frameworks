import jwt from 'jsonwebtoken';

export function getJwtSecret() {
    return process.env.JWT_SECRET || 'haven_dev_jwt_secret_change_in_production';
}

export const authRequired = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({message: 'Потрібна авторизація. Увійдіть в акаунт.'});
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, getJwtSecret());
        req.user = decoded;
        return next();
    } catch {
        return res.status(401).json({message: 'Токен недійсний або термін його дії завершився. Увійдіть знову.'});
    }
};
