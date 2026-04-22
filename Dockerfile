FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV mode=prod

COPY package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY public ./public

EXPOSE 80

CMD ["npm", "run", "start:prod"]
