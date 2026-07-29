# Banco de dados

PostgreSQL gerenciado pelo Prisma (`prisma/schema.prisma`). A conexão vem da `DATABASE_URL` e o Prisma fala com o banco pelo driver adapter `@prisma/adapter-pg` (configurado em `src/config/prisma.js`). O `movieId` que aparece em quase todo modelo é o id da série na TVMaze — junto dele guardamos título, poster e ano para não buscar na TVMaze toda hora.

## Modelos

- **User** — conta: email/senha (hash), username único (com data da última troca, por causa do cooldown de 30 dias) e campos de perfil (displayName, location, website, bio).
- **Review** — nota (0.5 a 5, aceita meia estrela) + texto. Única por usuário/série: se avaliar de novo, atualiza a mesma.
- **WatchListItem** — série salva no "quero assistir".
- **FavoriteSeries** — os favoritos do perfil, com `position` para a ordem escolhida no drag & drop.
- **List / ListItem** — listas criadas pelo usuário (título + categoria) e as séries dentro delas.

Todas as relações apontam para o User com `onDelete: Cascade`: apagou a conta, tudo daquele usuário some junto.

## Migrações

Cada mudança no schema vira uma pasta em `prisma/migrations`. Para aplicar tudo do zero: `npx prisma migrate dev` (precisa do Postgres no ar — `docker compose up -d db`). Em ambiente já provisionado, use `npx prisma migrate deploy`.
