-- CreateTable
CREATE TABLE "Batik" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tone" TEXT,
    "hue" TEXT,
    "colorCategory" TEXT NOT NULL,
    "history" TEXT NOT NULL,
    "philosophy" TEXT,
    "origin" TEXT,
    "imageUrl" TEXT NOT NULL,
    "model3dUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TryOnSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "detectedSeason" TEXT,
    "confidence" REAL,
    "selectedBatikId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TryOnSession_selectedBatikId_fkey" FOREIGN KEY ("selectedBatikId") REFERENCES "Batik" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
