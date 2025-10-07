-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dataKeySalt" TEXT NOT NULL,
    "wrappedDataKey" TEXT NOT NULL,
    "wrappedDataKeyIV" TEXT NOT NULL,
    "totalSize" BIGINT NOT NULL DEFAULT 0,
    "storageLimit" BIGINT NOT NULL DEFAULT 5368709120,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "r2Key" TEXT NOT NULL,
    "itemKeySalt" TEXT NOT NULL,
    "wrappedItemKey" TEXT NOT NULL,
    "wrappedItemKeyIV" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseBundle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3),
    "heartbeatCadenceDays" INTEGER,
    "lastHeartbeat" TIMESTAMP(3),
    "released" BOOLEAN NOT NULL DEFAULT false,
    "releaseToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReleaseBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleItem" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BundleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trustee" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "accessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trustee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Heartbeat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "cadenceDays" INTEGER NOT NULL DEFAULT 30,
    "lastHeartbeat" TIMESTAMP(3),
    "nextHeartbeat" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Heartbeat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Item_userId_idx" ON "Item"("userId");

-- CreateIndex
CREATE INDEX "Item_userId_updatedAt_idx" ON "Item"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseBundle_releaseToken_key" ON "ReleaseBundle"("releaseToken");

-- CreateIndex
CREATE INDEX "ReleaseBundle_userId_idx" ON "ReleaseBundle"("userId");

-- CreateIndex
CREATE INDEX "ReleaseBundle_releaseDate_idx" ON "ReleaseBundle"("releaseDate");

-- CreateIndex
CREATE INDEX "ReleaseBundle_released_idx" ON "ReleaseBundle"("released");

-- CreateIndex
CREATE INDEX "BundleItem_bundleId_idx" ON "BundleItem"("bundleId");

-- CreateIndex
CREATE INDEX "BundleItem_itemId_idx" ON "BundleItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "BundleItem_bundleId_itemId_key" ON "BundleItem"("bundleId", "itemId");

-- CreateIndex
CREATE INDEX "Trustee_bundleId_idx" ON "Trustee"("bundleId");

-- CreateIndex
CREATE INDEX "Trustee_email_idx" ON "Trustee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Heartbeat_userId_key" ON "Heartbeat"("userId");

-- CreateIndex
CREATE INDEX "Heartbeat_nextHeartbeat_idx" ON "Heartbeat"("nextHeartbeat");

-- CreateIndex
CREATE INDEX "Heartbeat_enabled_nextHeartbeat_idx" ON "Heartbeat"("enabled", "nextHeartbeat");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseBundle" ADD CONSTRAINT "ReleaseBundle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "ReleaseBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trustee" ADD CONSTRAINT "Trustee_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "ReleaseBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Heartbeat" ADD CONSTRAINT "Heartbeat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
