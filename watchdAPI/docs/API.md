# Rotas da API

Rotas marcadas com "auth" exigem o header `Authorization: Bearer <token>` (que vem do login).

## Auth (`/auth`)

- `POST /auth/register` — cria conta (nome, email, senha). O username é gerado sozinho a partir do nome.
- `POST /auth/login` — devolve o token JWT.
- `GET /auth/me` (auth) — dados do usuário logado.
- `PUT /auth/me` (auth) — atualiza perfil (displayName, location, website, bio, username). Trocar o username só a cada 30 dias.
- `DELETE /auth/me` (auth) — apaga a conta (pede a senha para confirmar).

## Reviews (`/reviews`)

- `GET /reviews/mine` (auth) — minhas reviews (alimenta o Diary e o My Series).
- `GET /reviews/:movieId` — reviews de uma série (token opcional: se logado, destaca a sua).
- `POST /reviews` (auth) — cria ou atualiza a review daquela série (uma por usuário/série).
- `DELETE /reviews/:id` (auth) — apaga uma review.

## Watchlist (`/watchlist`) — tudo com auth

- `GET /` lista, `POST /` adiciona, `DELETE /:id` remove.

## Favoritos (`/favorites`) — tudo com auth

- `GET /` lista, `POST /` adiciona, `DELETE /:id` remove, `PUT /reorder` reordena (drag & drop do perfil).

## Listas (`/lists`)

- `GET /lists/all` e `GET /lists/public/:id` — públicas, sem login.
- `GET /` minhas listas, `POST /` cria, `GET /:id` detalhe, `DELETE /:id` apaga (tudo com auth).
- `POST /:id/items` adiciona série na lista, `DELETE /:id/items/:itemId` remove (auth).

## Usuários (`/users`)

- `GET /users/:username` — perfil público: dados do usuário, favoritos, atividade recente (reviews), listas e stats.
