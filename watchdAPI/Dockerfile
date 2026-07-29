# Estagio 1: builder — instala tudo, compila o bcrypt e gera o client do Prisma
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

# Estagio 2: imagem final — instala so as deps de producao (sem o CLI do
# prisma, que arrasta o Prisma Studio com React/Chart.js junto) e reaproveita
# o client ja gerado no builder.
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm ci --omit=dev --omit=optional \
    && apk del .build-deps \
    && npm cache clean --force \
    && chown -R node:node /app/node_modules

COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=node:node . .

USER node

EXPOSE 3000

CMD ["node", "server.js"]
