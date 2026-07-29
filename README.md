# Watchd

Aplicação para registrar, avaliar e organizar séries assistidas, inspirada no Letterboxd. O usuário cria uma conta, monta sua watchlist, escreve reviews com nota, escolhe séries favoritas e organiza listas temáticas — tudo exposto em um perfil público. Os dados das séries vêm da TVMaze; aqui guardamos só o que é do usuário.

Projeto full stack organizado em duas partes:

- `front`: aplicação React + Vite do Watchd.
- `watchdAPI`: API REST Node.js + Express + Prisma + PostgreSQL.

Documentação detalhada do back: [arquitetura](watchdAPI/docs/ARCHITECTURE.md), [rotas](watchdAPI/docs/API.md) e [banco](watchdAPI/docs/DATABASE.md).

## Entidades

Seis entidades, todas ligadas ao `User` com `onDelete: Cascade` — apagou a conta, tudo daquele usuário some junto.

```
User 1──N List 1──N ListItem
 │
 ├──N Review
 ├──N WatchListItem
 └──N FavoriteSeries
```

| Entidade | Descrição | Campos principais |
| --- | --- | --- |
| `User` | Conta e perfil | `id`, `name`, `email` (único), `username` (único, gerado no cadastro), `password` (hash bcrypt), `usernameChangedAt`, `displayName`, `location`, `website`, `bio` |
| `List` | Lista temática criada pelo usuário | `id`, `userId` → `User`, `title`, `category` |
| `ListItem` | Série dentro de uma lista | `id`, `listId` → `List`, `movieId`, `title`, `posterUrl`, `releaseYear`, `type`, `position`. `@@unique([listId, movieId])` |
| `Review` | Avaliação de uma série | `id`, `userId` → `User`, `movieId`, `rating` (0.5 a 5, meia estrela), `text`. `@@unique([userId, movieId])` — uma por usuário/série |
| `WatchListItem` | Série no "quero assistir" | `id`, `userId` → `User`, `movieId`, `title`, `posterUrl`, `releaseYear`, `type` |
| `FavoriteSeries` | Favoritos do perfil (máx. 4) | `id`, `userId` → `User`, `movieId`, `position`. `@@unique([userId, movieId])` |

A relação em dois níveis (`User → List → ListItem`) é o fluxo principal da aplicação.

## Endpoints principais

Base local: `http://localhost:3000`. Rotas marcadas com **auth** exigem o header `Authorization: Bearer <token>`. Lista completa em [docs/API.md](watchdAPI/docs/API.md).

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/auth/register` | Cria conta (`name`, `email`, `password`); senha salva com bcrypt |
| `POST` | `/auth/login` | Devolve o token JWT (válido por 7 dias) |
| `GET` | `/auth/me` **auth** | Dados do usuário logado |
| `PUT` | `/auth/me` **auth** | Atualiza o perfil |
| `DELETE` | `/auth/me` **auth** | Apaga a conta (pede a senha); remove listas, reviews, watchlist e favoritos em cascata |
| `GET` | `/lists/all` | Todas as listas públicas |
| `GET` | `/lists` **auth** | Minhas listas |
| `POST` | `/lists` **auth** | Cria lista (`title`, `category?`) |
| `GET` | `/lists/:id` **auth** | Detalhe da lista com os itens |
| `DELETE` | `/lists/:id` **auth** | Apaga a lista e seus itens |
| `POST` | `/lists/:id/items` **auth** | Adiciona série na lista |
| `DELETE` | `/lists/:id/items/:itemId` **auth** | Remove série da lista |
| `GET` | `/reviews/:movieId` | Reviews de uma série (token opcional destaca a sua) |
| `POST` | `/reviews` **auth** | Cria ou atualiza a review daquela série |
| `DELETE` | `/reviews/:id` **auth** | Apaga a review |
| `GET` `POST` `DELETE` | `/watchlist` **auth** | Lista, adiciona e remove (`DELETE /watchlist/:id`) |
| `GET` `POST` `DELETE` | `/favorites` **auth** | Lista, adiciona e remove; `PUT /favorites/reorder` reordena |
| `GET` | `/users/:username` | Perfil público: favoritos, listas, atividade recente e stats |

## Variáveis de ambiente

Ficam em `watchdAPI/.env`, a partir do modelo em [`watchdAPI/.env.example`](watchdAPI/.env.example). O `.env` real fica fora do Git.

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | sim | Conexão do PostgreSQL, ex. `postgresql://watchd:watchd@localhost:5432/watchd?schema=public` |
| `JWT_SECRET` | sim | Segredo que assina os tokens JWT — troque em produção |
| `PORT` | não | Porta da API (padrão `3000`) |
| `CORS_ORIGIN` | não | Origem liberada no CORS (padrão `http://localhost:5173`) |

## Como rodar o back

Precisa de Node 18+ e Docker (para o Postgres).

```bash
cd watchdAPI
npm install
cp .env.example .env     # troque o JWT_SECRET
docker compose up -d db  # Postgres 16 em localhost:5432
npx prisma migrate dev   # cria as tabelas
npm run dev
```

A API sobe em `http://localhost:3000` — confira com `curl http://localhost:3000/health`.

Para rodar a API também em container, em vez dos dois últimos passos:

```bash
docker compose --profile tools run --rm migrate  # aplica as migrations
docker compose up -d                             # sobe db + api
```

Se preferir um Postgres na nuvem (Neon, Supabase), troque a `DATABASE_URL` do `.env` e pule o `docker compose`.

## Como rodar o front

```bash
cd front
npm install
npm run dev
```

## Deploy

O workflow do GitHub Pages roda o build dentro da pasta `front`.
