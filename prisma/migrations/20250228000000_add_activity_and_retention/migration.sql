-- Add activity tracking and retention policies

-- Add lastActivityAt to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update tier column comment to reflect new tiers
COMMENT ON COLUMN "User"."tier" IS 'free | plus_monthly | plus_annual | plus_lifetime';

-- Add release tracking fields to ReleaseBundle table
ALTER TABLE "ReleaseBundle" ADD COLUMN IF NOT EXISTS "releasedAt" TIMESTAMP(3);
ALTER TABLE "ReleaseBundle" ADD COLUMN IF NOT EXISTS "deleteScheduledFor" TIMESTAMP(3);
ALTER TABLE "ReleaseBundle" ADD COLUMN IF NOT EXISTS "archived" BOOLEAN NOT NULL DEFAULT false;

-- Create index for cleanup queries
CREATE INDEX IF NOT EXISTS "User_lastActivityAt_idx" ON "User"("lastActivityAt");
CREATE INDEX IF NOT EXISTS "ReleaseBundle_released_deleteScheduledFor_idx" ON "ReleaseBundle"("released", "deleteScheduledFor");
CREATE INDEX IF NOT EXISTS "ReleaseBundle_archived_idx" ON "ReleaseBundle"("archived");
