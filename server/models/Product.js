import mongoose from 'mongoose';

export const CATEGORIES = ['Квартира', 'Будинок', 'Будівля'];
export const PROPERTY_STATUSES = ['Активне', 'Перегляд', 'Заброньовано', 'Продано'];

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Вкажіть назву оголошення.'],
            trim: true,
            minlength: [5, 'Назва має містити щонайменше 5 символів.'],
            maxlength: [100, 'Назва не може перевищувати 100 символів.']
        },
        category: {
            type: String,
            required: [true, 'Оберіть тип нерухомості.'],
            enum: {
                values: CATEGORIES,
                message: 'Непідтримуваний тип нерухомості.'
            },
            default: 'Квартира'
        },
        city: {
            type: String,
            required: [true, 'Вкажіть місто.'],
            trim: true,
            minlength: [2, 'Назва міста має містити щонайменше 2 символи.'],
            maxlength: [60, 'Назва міста занадто довга.']
        },
        price: {
            type: Number,
            required: [true, 'Вкажіть ціну.'],
            min: [1, 'Ціна має бути не менше 1 $.'],
            max: [1000000000, 'Ціна занадто велика.']
        },
        area: {
            type: Number,
            required: [true, 'Вкажіть площу.'],
            min: [1, 'Площа має бути не менше 1 м².'],
            max: [100000, 'Площа занадто велика.']
        },
        rooms: {
            type: Number,
            required: [true, 'Вкажіть кількість кімнат.'],
            min: [1, 'Кількість кімнат має бути не менше 1.'],
            max: [1000, 'Кількість кімнат занадто велика.']
        },
        description: {
            type: String,
            required: [true, 'Додайте опис об’єкта.'],
            trim: true,
            minlength: [20, 'Опис має містити щонайменше 20 символів.'],
            maxlength: [3000, 'Опис не може перевищувати 3000 символів.']
        },
        image: {
            type: String,
            default: 'images/apartment.jpg',
            trim: true
        },
        status: {
            type: String,
            enum: {
                values: PROPERTY_STATUSES,
                message: 'Непідтримуваний статус трекінгу.'
            },
            default: 'Активне'
        },
        tracked: {
            type: Boolean,
            default: false
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret) => {
                ret.id = String(ret._id);
                return ret;
            }
        }
    }
);

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
