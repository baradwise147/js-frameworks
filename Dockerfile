FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --silent
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV SERVE_STATIC=true
ENV PORT=80
COPY package*.json ./
RUN npm install --omit=dev --silent
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public
COPY --from=build /app/scripts/api-server.mjs ./scripts/api-server.mjs
COPY --from=build /app/db.json ./db.json
EXPOSE 80
CMD ["node", "scripts/api-server.mjs"]
