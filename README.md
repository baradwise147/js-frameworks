START
```sh
npm install
npm start
```
Після запуску застосунок відкривається на `http://127.0.0.1:5173`, а локальний API-сервер (`json-server` + завантаження фото у `public/images`) працює на `http://127.0.0.1:3000`.


TEST
```sh
npm test
```


BUILD
```sh
npm run build
```


DOCKER (Render.com)
```sh
docker build -t haven-react .
docker run -p 8080:80 haven-react
```


Render.com link:
