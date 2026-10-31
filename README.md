# Watchd

Aplicação para registrar, avaliar e organizar séries assistidas, inspirada no Letterboxd. O usuário cria uma conta, monta sua watchlist, escreve reviews com nota, escolhe séries favoritas e organiza listas temáticas, tudo exposto em um perfil público. Os dados das séries vêm da TVMaze; aqui guardamos só o que é do usuário.

Projeto full stack organizado em duas partes:

- `front`: aplicação React + Vite do Watchd.
- `watchdAPI`: API REST Node.js + Express + Prisma + PostgreSQL.

Documentação detalhada do back: [arquitetura](watchdAPI/docs/ARCHITECTURE.md), [rotas](watchdAPI/docs/API.md) e [banco](watchdAPI/docs/DATABASE.md).

## Entidades

Seis entidades, todas ligadas ao `User` com `onDelete: Cascade`, ou seja, apagou a conta, tudo daquele usuário some junto.

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
| `Review` | Avaliação de uma série | `id`, `userId` → `User`, `movieId`, `rating` (0.5 a 5, meia estrela), `text`. `@@unique([userId, movieId])`, uma por usuário/série |
| `WatchListItem` | Série no "quero assistir" | `id`, `userId` → `User`, `movieId`, `title`, `posterUrl`, `releaseYear`, `type` |
| `FavoriteSeries` | Favoritos do perfil (máx. 4) | `id`, `userId` → `User`, `movieId`, `position`. `@@unique([userId, movieId])` |

A relação em dois níveis (`User → List → ListItem`) é o fluxo principal da aplicação.

## Endpoints principais

Base local: `http://localhost:3000`. Rotas marcadas com **auth** exigem sessão: o login grava um cookie `httpOnly` (usado pelo front) e as mesmas rotas também aceitam o header `Authorization: Bearer <token>` como alternativa, útil para testar com curl/Postman. Lista completa em [docs/API.md](watchdAPI/docs/API.md).

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

### Back (`watchdAPI`)

Ficam em `watchdAPI/.env`, a partir do modelo em [`watchdAPI/.env.example`](watchdAPI/.env.example). O `.env` real fica fora do Git.

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | sim | Conexão do PostgreSQL, ex. `postgresql://watchd:watchd@localhost:5432/watchd?schema=public` |
| `JWT_SECRET` | sim | Segredo que assina os tokens JWT, troque em produção |
| `PORT` | não | Porta da API (padrão `3000`); em produção quem define é a própria plataforma de deploy |
| `CORS_ORIGIN` | não | Origem(ns) liberada(s) no CORS, separadas por vírgula se for mais de uma (padrão `http://localhost:5173`) |
| `NODE_ENV` | não | Quando `production`, o cookie de sessão sai com `Secure` e `SameSite=None` (necessário para front e back em domínios diferentes) |

### Front (`front`)

Ficam em `front/.env`, a partir do modelo em [`front/.env.example`](front/.env.example).

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `VITE_API_URL` | não | URL base da API. Em dev pode ficar vazia (usa o proxy `/api` do Vite); em produção aponta para a API publicada |

## Como rodar o back

Precisa de Node 22+ e Docker (para o Postgres).

```bash
cd watchdAPI
npm install
cp .env.example .env     # troque o JWT_SECRET
docker compose up -d db  # Postgres 16 em localhost:5432
npx prisma migrate dev   # cria as tabelas
npm run dev
```

A API sobe em `http://localhost:3000`, confira com `curl http://localhost:3000/health`.

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

## Testes e lint

```bash
cd watchdAPI && npm test               # node:test + supertest, services mockados (nao conecta no banco)
cd front && npm run lint && npm test   # ESLint + Vitest
```

O workflow [`ci.yml`](.github/workflows/ci.yml) roda os dois em todo pull request e push na `main`.

## Links publicados

| Parte | Onde | URL |
| --- | --- | --- |
| Front-end | GitHub Pages | https://caiorenatodot.github.io/ProjetoIntegradorMorrissey2/ |
| Back-end | Railway | https://projetointegradormorrissey2-production.up.railway.app |
| Banco de dados | Supabase (PostgreSQL gerenciado) | não público |

## Deploy

**Front:** o workflow [`deploy.yml`](.github/workflows/deploy.yml) builda a pasta `front` e publica no GitHub Pages a cada push na `main` (ou manualmente pela aba Actions). A variável `VITE_API_URL`, configurada em Settings → Secrets and variables → Actions → Variables do repositório, é injetada no build para o front saber onde fica a API publicada.

**Back:** publicado no [Railway](https://railway.app), com deploy automático a cada push na `main`. O serviço usa o `Dockerfile` da pasta `watchdAPI` (Root Directory configurado como `watchdAPI` nas configurações do serviço) e precisa das variáveis `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` e `NODE_ENV=production`.

**Banco:** PostgreSQL gerenciado pelo [Supabase](https://supabase.com), região São Paulo. As migrations são aplicadas com `npx prisma migrate deploy` apontando para a `DATABASE_URL` de produção.

## Limitações e próximos passos

O projeto cobre o fluxo principal (contas, listas, reviews, watchlist e favoritos) de ponta a ponta, mas alguns pontos ficaram de fora do escopo desta entrega:

- **Recuperação de senha é só interface**, a tela "Forgot password" existe no front, mas não chama nenhum endpoint, não há envio de email nem rota de reset no back.
- **CRUD de listas incompleto**, dá para criar, listar e apagar uma lista, e adicionar/remover itens, mas não existe `PUT /lists/:id` para editar título ou categoria de uma lista já criada.
- **Testes cobrem só o essencial**, a API tem testes de auth, checagem de dono e validações, e o front testa só utilitários (rotas e força da senha), sem testes de componentes.
- **Rate limiting básico, mas não completo**, login e registro têm limite de tentativas por IP, mas não há bloqueio por conta específica nem CAPTCHA.
- **Sem autorização por papéis**, todo usuário tem as mesmas permissões, não existe admin ou moderador.
- **JWT não é revogável no servidor**, o logout limpa o cookie no navegador, mas o token em si continua válido até expirar (7 dias) se tiver sido copiado antes do logout.
- **O cookie de sessão é "de terceiros" em produção**, porque o front (GitHub Pages) e a API (Railway) ficam em domínios diferentes. Navegadores em janela anônima bloqueiam esse tipo de cookie, então a API também aceita o token pelo header `Authorization`, usado como reserva quando o cookie não chega. O custo disso é que o front guarda o token no `localStorage`, onde qualquer script injetado na página (XSS) conseguiria lê-lo, o que tira boa parte da proteção do cookie `httpOnly`. Hospedar front e API sob o mesmo domínio (ex.: `app.dominio.com` e `api.dominio.com`) permitiria usar só o cookie e apagar o token do `localStorage`.
- **Depende diretamente da API pública do TVMaze**, sem cache, se ela cair ou limitar requisições, a busca de séries para de funcionar.

Próximos passos, em ordem de prioridade:

1. Colocar front e API sob o mesmo domínio e usar só o cookie `httpOnly`, tirando o token do `localStorage`.
2. Implementar `PUT /lists/:id` para fechar o CRUD de listas.
3. Paginar as listagens privadas (watchlist, reviews e listas do usuário), como já é feito em `GET /lists/all`.
4. Implementar recuperação de senha de verdade (endpoint + envio de email).
5. Avaliar refresh tokens ou uma blacklist de JWT para o logout invalidar a sessão também no servidor, não só no cookie do navegador.
6. Ampliar os testes do front para os componentes principais (login, detalhe da série, perfil).
