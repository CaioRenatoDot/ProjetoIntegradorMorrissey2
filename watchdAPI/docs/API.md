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

## Paginação

`GET /lists/all` aceita `?page=1&limit=12` (limite máximo 50) e responde `{ items, page, hasMore }`. O perfil público (`GET /users/:username`) traz só as 12 reviews e listas mais recentes; os totais vêm em `stats`.

## Limites dos campos

Textos acima do limite voltam `400` com `code: "INVALID_FIELD"`. Os principais: bio 240, texto da review 280, display name 32, website 100 (precisa começar com `http://` ou `https://`), título de lista 80, categoria 40, nome no cadastro 60. A senha precisa ter de 8 a 72 caracteres, com letra e número. O corpo da requisição pode ter no máximo 20 KB.

## Erros

Todo erro responde `{ code, message }`. O `message` é em português e pode mudar; o `code` é estável e é o que o front usa para traduzir:

| code | quando |
| --- | --- |
| `MISSING_FIELDS` | faltou campo obrigatório no cadastro/login |
| `INVALID_FIELD` | campo com tipo errado ou acima do limite |
| `EMAIL_IN_USE` | email já cadastrado |
| `INVALID_CREDENTIALS` | email/username ou senha incorretos (mesma resposta para os dois casos) |
| `PASSWORD_TOO_SHORT`, `PASSWORD_NO_LETTER`, `PASSWORD_NO_NUMBER`, `PASSWORD_TOO_LONG` | senha fora das regras |
| `TOO_MANY_ATTEMPTS`, `TOO_MANY_ACCOUNTS` | rate limit do login/cadastro |
| `UNAUTHENTICATED` | rota com auth sem token, ou token inválido/expirado |
| `ALREADY_EXISTS` | violação de unicidade no banco |
| `NOT_FOUND`, `ROUTE_NOT_FOUND` | registro ou rota inexistente |
| `CONFLICT` | duas gravações concorrentes; repetir resolve |
| `INVALID_JSON`, `PAYLOAD_TOO_LARGE` | corpo malformado ou acima de 20 KB |
| `INTERNAL_ERROR` | erro inesperado |
