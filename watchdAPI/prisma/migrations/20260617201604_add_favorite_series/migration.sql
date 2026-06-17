/*
  Warnings:

  - You are about to drop the column `PosterUrl` on the `FavoriteSeries` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FavoriteSeries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "posterUrl" TEXT,
    "releaseYear" TEXT,
    "type" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FavoriteSeries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FavoriteSeries" ("createdAt", "id", "movieId", "position", "releaseYear", "title", "type", "userId") SELECT "createdAt", "id", "movieId", "position", "releaseYear", "title", "type", "userId" FROM "FavoriteSeries";
DROP TABLE "FavoriteSeries";
ALTER TABLE "new_FavoriteSeries" RENAME TO "FavoriteSeries";
CREATE UNIQUE INDEX "FavoriteSeries_userId_movieId_key" ON "FavoriteSeries"("userId", "movieId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
