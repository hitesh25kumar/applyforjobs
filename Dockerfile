FROM mcr.microsoft.com/playwright:v1.58.0-noble

WORKDIR /app

COPY automation/package.json automation/package-lock.json ./automation/
COPY automation/src ./automation/src
COPY automation/tsconfig.json ./automation/
RUN cd automation && npm ci && npm run build

COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci
COPY backend ./backend

WORKDIR /app/backend
RUN npm run build

ENV NODE_ENV=production
CMD ["node", "dist/main"]