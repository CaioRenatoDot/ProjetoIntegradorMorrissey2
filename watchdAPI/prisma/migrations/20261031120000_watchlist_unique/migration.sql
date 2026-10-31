-- Remove itens duplicados que possam ter entrado antes da restricao,
-- mantendo o mais antigo de cada (userId, movieId).
DELETE FROM "WatchListItem" a
USING "WatchListItem" b
WHERE a."userId" = b."userId"
  AND a."movieId" = b."movieId"
  AND (a."createdAt", a."id") > (b."createdAt", b."id");

-- CreateIndex
CREATE UNIQUE INDEX "WatchListItem_userId_movieId_key" ON "WatchListItem"("userId", "movieId");
