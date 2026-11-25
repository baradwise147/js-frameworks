ENV
1. Створіть безкоштовний кластер у [MongoDB Atlas](https://cloud.mongodb.com/), додайте користувача в **Database Access** і дозвольте доступ у **Network Access** (`0.0.0.0/0`).
2. Скопіюйте `.env.example` у `.env` і вставте свій `MONGO_URI` та `JWT_SECRET`:
```sh
cp .env.example .env
```


START (бекенд Express + MongoDB і фронтенд React одночасно)
```sh
npm install
npm start
```
Фронтенд: `http://127.0.0.1:5173` · Бекенд API: `http://127.0.0.1:3000/api`


TEST (React + Express Supertest)
```sh
npm test
```


BUILD
```sh
npm run build
```


Render.com link: https://lab-5-1qrj.onrender.com/


API ENDPOINTS
- `GET /api/health` — перевірка роботи сервера
- `POST /api/auth/register` — реєстрація користувача (`userName`, `password`) → JWT
- `POST /api/auth/login` — вхід (`userName`, `password`) → JWT
- `GET /api/auth/me` — поточний користувач *(Bearer JWT)*
- `GET /api/products` — список оголошень (підтримує `?category=`, `?city=`, `?status=`, `?search=`, `?tracked=true`)
- `GET /api/products/:id` — деталі оголошення
- `POST /api/products` — створення оголошення *(Bearer JWT)*
- `PUT /api/products/:id` — повне оновлення оголошення *(Bearer JWT)*
- `PATCH /api/products/:id` — часткове оновлення (статус, трекер, швидке редагування) *(Bearer JWT)*
- `DELETE /api/products/:id` — видалення оголошення *(Bearer JWT)*
- `POST /api/upload` — завантаження фото у `public/images` *(Bearer JWT)*
