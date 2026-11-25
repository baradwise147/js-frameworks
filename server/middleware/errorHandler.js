export const errorHandler = (err, _req, res, _next) => {
    if (err?.message === 'Not allowed by CORS') {
        return res.status(403).json({message: 'Доступ заборонено політикою CORS.'});
    }
    if (err?.type === 'entity.too.large') {
        return res.status(413).json({message: 'Розмір файлу не повинен перевищувати 10 МБ.'});
    }
    if (err?.name === 'ValidationError') {
        const first = Object.values(err.errors || {})[0];
        return res.status(400).json({message: first?.message || 'Некоректні вхідні дані.'});
    }
    if (err?.name === 'CastError') {
        return res.status(400).json({message: 'Некоректний ідентифікатор запису.'});
    }
    if (err?.code === 11000) {
        return res.status(409).json({message: 'Такий запис уже існує.'});
    }

    console.error('[SERVER ERROR]', err);
    return res.status(500).json({message: 'Внутрішня помилка сервера.'});
};
