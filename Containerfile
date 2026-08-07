# Production backend (frontend built locally, dist copied in)
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache bash postgresql-client

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/src/ ./src/

COPY frontend/dist ./frontend/dist

COPY wait-for-db.sh /app/wait-for-db.sh
RUN chmod +x /app/wait-for-db.sh

RUN mkdir -p uploads

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

CMD ["/app/wait-for-db.sh"]
