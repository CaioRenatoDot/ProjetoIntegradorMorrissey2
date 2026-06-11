# Watchd

Projeto full stack organizado em duas partes:

- `front`: aplicacao React + Vite do Watchd.
- `watchdAPI`: API Node.js + Express + Prisma.

## Como rodar o front

```bash
cd front
npm install
npm run dev
```

## Como rodar o back

```bash
cd watchdAPI
npm install
cp .env.example .env
npm run dev
```

Configure o `.env` local antes de iniciar a API. O arquivo real `.env` fica fora do Git.

## Deploy

O workflow do GitHub Pages roda o build dentro da pasta `front`.

