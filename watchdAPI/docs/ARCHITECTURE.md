# Arquitetura

A watchdAPI é o backend do Watchd: uma API REST em Express que guarda o que precisa ser salvo de verdade — contas, reviews, watchlist, favoritos e listas. Os dados das séries vêm da TVMaze pelo front; aqui só guardamos o `movieId` com título/poster/ano.

## Stack

- **Express 5** + **Prisma 7 com PostgreSQL** (sobe pelo Docker Compose, ver `docker-compose.yml`)
- **JWT** para autenticação (token válido por 7 dias) e **bcrypt** para hash de senha

## Estrutura

- `server.js`: entrada, só carrega o `.env` e sobe o servidor.
- `src/app.js`: monta o Express (CORS, JSON, health check) e pluga as rotas.
- `src/routes/`: mapa de cada recurso — qual caminho chama qual controller e o que exige login.
- `src/controllers/`: onde a lógica mora (validação, banco, resposta).
- `src/middlewares/`: `auth` (exige token, senão 401) e `optionalAuth` (token é opcional, só preenche `req.user` se tiver).
- `prisma/`: schema dos modelos e migrações do banco.

## Rodando local

```bash
npm install
cp .env.example .env       # troque o JWT_SECRET
docker compose up -d db    # sobe o Postgres
npx prisma migrate dev     # cria as tabelas
npm run dev
```
