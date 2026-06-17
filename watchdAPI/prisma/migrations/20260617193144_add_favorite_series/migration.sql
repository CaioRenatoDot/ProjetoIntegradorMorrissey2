-- CreateTable
CREATE TABLE "FavoriteSeries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "PosterUrl" TEXT,
    "releaseYear" TEXT,
    "type" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FavoriteSeries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteSeries_userId_movieId_key" ON "FavoriteSeries"("userId", "movieId");
