import mongoose from 'mongoose';
import {Product} from '../models/Product.js';

export const SEED_PRODUCTS = [
    {
        name: 'Світла квартира на Подолі',
        category: 'Квартира',
        city: 'Київ',
        price: 89000,
        area: 64,
        rooms: 2,
        image: 'images/apartment.jpg',
        status: 'Активне',
        tracked: true,
        description:
            'Світлий простір із продуманим плануванням та великими вікнами. Зручна кухня, затишні кімнати та місце для відпочинку. Поруч зелені зони, магазини й міська інфраструктура.'
    },
    {
        name: 'Будинок біля лісу',
        category: 'Будинок',
        city: 'Львів',
        price: 165000,
        area: 148,
        rooms: 4,
        image: 'images/house.jpg',
        status: 'Перегляд',
        tracked: true,
        description:
            'Просторий будинок для спокійного життя ближче до природи. Власне подвір’я, зручне планування та місце для родинних зустрічей. Тераса стане улюбленим куточком для ранкової кави.'
    },
    {
        name: 'Простір для вашого бізнесу',
        category: 'Будівля',
        city: 'Львів',
        price: 240000,
        area: 320,
        rooms: 8,
        image: 'images/office.jpg',
        status: 'Активне',
        tracked: false,
        description:
            'Окремий простір для команди та розвитку власної справи. Гнучке планування дозволяє організувати робочі місця, переговорну та зону відпочинку. Зручний доступ і природне освітлення.'
    },
    {
        name: 'Квартира з видом на місто',
        category: 'Квартира',
        city: 'Львів',
        price: 72000,
        area: 48,
        rooms: 1,
        image: 'images/interior.jpg',
        status: 'Заброньовано',
        tracked: true,
        description:
            'Світлий простір із продуманим плануванням та великими вікнами. Зручна кухня, затишні кімнати та місце для відпочинку. Поруч зелені зони, магазини й міська інфраструктура.'
    },
    {
        name: 'Сімейний будинок із садом',
        category: 'Будинок',
        city: 'Київ',
        price: 210000,
        area: 180,
        rooms: 5,
        image: 'images/villa.jpg',
        status: 'Активне',
        tracked: false,
        description:
            'Просторий будинок для спокійного життя ближче до природи. Власне подвір’я, зручне планування та місце для родинних зустрічей. Тераса стане улюбленим куточком для ранкової кави.'
    },
    {
        name: 'Офіс у ритмі міста',
        category: 'Будівля',
        city: 'Київ',
        price: 195000,
        area: 210,
        rooms: 6,
        image: 'images/workspace.jpg',
        status: 'Перегляд',
        tracked: false,
        description:
            'Окремий простір для команди та розвитку власної справи. Гнучке планування дозволяє організувати робочі місця, переговорну та зону відпочинку. Зручний доступ і природне освітлення.'
    },
    {
        name: 'Квартира поруч із парком',
        category: 'Квартира',
        city: 'Івано-Франківськ',
        price: 68000,
        area: 58,
        rooms: 2,
        image: 'images/apartment.jpg',
        status: 'Активне',
        tracked: false,
        description:
            'Світлий простір із продуманим плануванням та великими вікнами. Зручна кухня, затишні кімнати та місце для відпочинку. Поруч зелені зони, магазини й міська інфраструктура.'
    },
    {
        name: 'Будинок із сонячною терасою',
        category: 'Будинок',
        city: 'Івано-Франківськ',
        price: 142000,
        area: 135,
        rooms: 4,
        image: 'images/house.jpg',
        status: 'Продано',
        tracked: false,
        description:
            'Просторий будинок для спокійного життя ближче до природи. Власне подвір’я, зручне планування та місце для родинних зустрічей. Тераса стане улюбленим куточком для ранкової кави.'
    },
    {
        name: 'Творчий простір у центрі',
        category: 'Будівля',
        city: 'Львів',
        price: 128000,
        area: 120,
        rooms: 3,
        image: 'images/workspace.jpg',
        status: 'Активне',
        tracked: true,
        description:
            'Окремий простір для команди та розвитку власної справи. Гнучке планування дозволяє організувати робочі місця, переговорну та зону відпочинку. Зручний доступ і природне освітлення.'
    }
];

export async function connectDB(mongoURI) {
    if (!mongoURI) {
        throw new Error('Змінна середовища MONGO_URI не задана. Додайте рядок підключення MongoDB Atlas у .env');
    }
    try {
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected');
        const count = await Product.countDocuments();
        if (count === 0) {
            await Product.insertMany(SEED_PRODUCTS);
            console.log(`Seeded ${SEED_PRODUCTS.length} initial Haven listings into MongoDB`);
        }
    } catch (err) {
        console.error('Mongo error:', err);
        throw err;
    }
}
