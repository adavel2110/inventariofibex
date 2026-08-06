# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/index.html ./
COPY frontend/vite.config.js ./
COPY frontend/tailwind.config.js ./
COPY frontend/postcss.config.js ./
COPY frontend/src/ ./src/
COPY frontend/public/ ./public/
RUN npm run build

# Stage 2: Production backend
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache bash postgresql-client

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/src/ ./src/

COPY --from=frontend-build /app/frontend/dist ./frontend/dist

COPY wait-for-db.sh /app/wait-for-db.sh
RUN chmod +x /app/wait-for-db.sh

RUN mkdir -p uploads

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

CMD ["/app/wait-for-db.sh"]
