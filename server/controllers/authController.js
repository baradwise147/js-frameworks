import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {User} from '../models/User.js';
import {getJwtSecret} from '../middleware/authMiddleware.js';

export const register = async (req, res, next) => {
    try {
        const userName = typeof req.body?.userName === 'string' ? req.body.userName.trim() : '';
        const password = typeof req.body?.password === 'string' ? req.body.password : '';

        if (userName.length < 3 || userName.length > 40) {
            return res.status(400).json({message: 'Ім’я користувача має містити від 3 до 40 символів.'});
        }
        if (password.length < 6) {
            return res.status(400).json({message: 'Пароль має містити щонайменше 6 символів.'});
        }

        const existingUser = await User.findOne({userName});
        if (existingUser) {
            return res.status(400).json({message: 'Користувач із таким ім’ям уже існує.'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({userName, password: hashedPassword});
        await newUser.save();

        const token = jwt.sign(
            {userId: String(newUser._id), userName: newUser.userName},
            getJwtSecret(),
            {expiresIn: '7d'}
        );

        return res.status(201).json({
            message: 'Реєстрація успішна.',
            token,
            user: {id: String(newUser._id), userName: newUser.userName}
        });
    } catch (err) {
        return next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const userName = typeof req.body?.userName === 'string' ? req.body.userName.trim() : '';
        const password = typeof req.body?.password === 'string' ? req.body.password : '';

        if (!userName || !password) {
            return res.status(400).json({message: 'Введіть ім’я користувача та пароль.'});
        }

        const user = await User.findOne({userName});
        if (!user) {
            return res.status(401).json({message: 'Невірне ім’я користувача або пароль.'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({message: 'Невірне ім’я користувача або пароль.'});
        }

        const token = jwt.sign(
            {userId: String(user._id), userName: user.userName},
            getJwtSecret(),
            {expiresIn: '7d'}
        );

        return res.json({
            token,
            user: {id: String(user._id), userName: user.userName}
        });
    } catch (err) {
        return next(err);
    }
};

export const me = (req, res) => {
    return res.json({
        user: {
            id: req.user.userId,
            userName: req.user.userName
        }
    });
};
