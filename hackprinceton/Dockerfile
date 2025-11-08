# Frontend (Next.js) Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci || npm install

# Copy the rest of the app
COPY . .

# Build for production by default (compose can override to `npm run dev`)
RUN npm run build

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
