import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: [true, 'Вкажіть ім’я користувача.'],
            unique: true,
            trim: true,
            minlength: [3, 'Ім’я користувача має містити щонайменше 3 символи.'],
            maxlength: [40, 'Ім’я користувача не може перевищувати 40 символів.']
        },
        password: {
            type: String,
            required: [true, 'Вкажіть пароль.']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false,
        toJSON: {
            transform: (_doc, ret) => {
                ret.id = String(ret._id);
                delete ret.password;
                return ret;
            }
        }
    }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
