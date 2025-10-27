# Storage Retention & Pricing Implementation

## Overview
Implemented a comprehensive storage retention system to prevent accumulating storage costs from inactive users and released bundles.

## ✅ Completed

### 1. Pricing Structure (`src/lib/pricing.ts`)

**New Tiers:**
- **Free**: $0
  - 1 year max release window
  - 300MB storage
  - 30 days post-release retention

- **Plus Monthly**: $12.99/month
  - 5 year max release window
  - 5GB storage
  - 90 days post-release retention

- **Plus Annual**: $89/year (Save 43%)
  - 10 year max release window
  - 5GB storage
  - 90 days post-release retention

- **Plus Lifetime**: $299 one-time
  - **Unlimited** release window (15+ years)
  - 10GB storage
  - 180 days (6 months) post-release retention

**Key Addition:**
- `releaseWindow.maxYears`: Limits how far in the future bundles can be set
- `retention.vaultInactivityYears`: 2 years (all tiers) - orphaned items deleted after this
- `retention.postReleaseDays`: How long released bundle data stays available

### 2. Database Schema (`prisma/schema.prisma`)

**User table:**
```sql
lastActivityAt DateTime @default(now()) -- Tracks user activity for cleanup
```

**ReleaseBundle table:**
```sql
releasedAt DateTime?           -- When bundle was released
deleteScheduledFor DateTime?   -- When to delete bundle data
archived Boolean @default(false) -- True after deletion
```

**Migration applied successfully** ✅

### 3. Helper Functions

Added to `pricing.ts`:
- `canSetReleaseDate(tier, yearsFromNow)` - Check if release date is within tier limits
- `getMaxReleaseYears(tier)` - Get max years for a tier
- `getRetentionPolicies(tier)` - Get retention rules

---

## 🔄 To Be Implemented

### 4. Activity Tracking API
**File**: `src/app/api/user/activity/route.ts`

```typescript
// POST /api/user/activity
// Updates user.lastActivityAt to current timestamp
// Called on: login, unlock, upload, bundle creation, check-in
```

### 5. Cron Job: Orphaned Items Cleanup
**File**: `src/app/api/cron/cleanup-orphaned-items/route.ts`

**Logic:**
1. Find users with `lastActivityAt > 2 years ago`
2. For each user, find items NOT in any bundles
3. Delete from R2 and database
4. Send warning email at 18 months (6 months before deletion)

### 6. Cron Job: Released Bundle Cleanup
**File**: `src/app/api/cron/cleanup-released-bundles/route.ts`

**Logic:**
1. Find bundles where `released = true` AND `deleteScheduledFor <= now()`
2. For each bundle:
   - Get all items in bundle
   - For each item:
     - Check if item is in OTHER active bundles
     - If NOT in other bundles → delete from R2 and DB
     - If IN other bundles → keep it
3. Mark bundle as `archived = true`
4. Send reminder emails at 60, 30, 7 days before deletion

### 7. Update Bundle Release Logic

When a bundle is released, set deletion date:

```typescript
// In bundle release function
const tier = user.tier;
const retention = getRetentionPolicies(tier);

await db.releaseBundle.update({
  where: { id: bundleId },
  data: {
    released: true,
    releasedAt: new Date(),
    deleteScheduledFor: addDays(new Date(), retention.postReleaseDays)
  }
});
```

### 8. User Notifications

**Warning Email Template** (18 months inactive):
```
Subject: Your Forebearer vault needs attention

You haven't logged in for 18 months.

Items in your vault that aren't in a bundle will be deleted in 6 months.

To keep them:
- Log in to reset the timer
- OR add them to a bundle

[Login Now]
```

**Release Deletion Reminders**:
- 60 days before deletion
- 30 days before deletion
- 7 days before deletion

### 9. UI Updates

**Items Page** (`src/app/app/items/ItemsPageClient.tsx`):

Add banner showing:
```tsx
{daysSinceActivity > 540 && ( // 18 months
  <Alert variant="warning">
    ⚠️ You haven't been active for {daysSinceActivity} days.
    Items not in a bundle will be deleted after 2 years of inactivity.

    <Button onClick={() => router.push('/app/release')}>
      Add items to bundle to protect them
    </Button>
  </Alert>
)}
```

**Bundle Creation** (`src/app/app/release/ReleasePageClient.tsx`):

Show release window limit based on tier:
```tsx
const maxYears = getMaxReleaseYears(userTier);

{!maxYears && (
  <Text>Set release date up to {maxYears} years in the future</Text>
)}
```

### 10. GitHub Actions Cron Schedule

```yaml
# .github/workflows/cleanup-cron.yml
name: Storage Cleanup

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Cleanup orphaned items
        run: |
          curl -X POST https://yourdomain.com/api/cron/cleanup-orphaned-items \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"

      - name: Cleanup released bundles
        run: |
          curl -X POST https://yourdomain.com/api/cron/cleanup-released-bundles \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

---

## Key Business Rules

### Vault Items (Not in Bundles)
- ⏱️ **Deleted after**: 2 years of user inactivity
- 📧 **Warning sent**: 18 months (6 months before deletion)
- 🔄 **Reset timer**: Any login, upload, bundle creation, or check-in

### Bundle Items (In Active Bundles)
- ✅ **Protected**: As long as bundle is active
- 📦 **Released bundles**: Available for download based on tier:
  - Free: 30 days
  - Plus Monthly/Annual: 90 days
  - Lifetime: 180 days

### Multi-Bundle Items
- If an item is in multiple bundles
- When one bundle releases and is deleted
- Item is kept if it's still in other active bundles
- Only deleted when last bundle using it is cleaned up

---

## Storage Cost Savings Example

**Before** (no cleanup):
- 1000 users × 2GB average = 2TB storage forever
- R2 cost: $0.015/GB/month = $30/month forever
- Annual: $360/year growing indefinitely

**After** (with cleanup):
- Inactive users cleaned after 2 years
- Released bundles cleaned after 90-180 days
- Estimated 60% reduction in long-term storage
- Annual: ~$144/year stabilized

---

## Testing Checklist

Before deploying to production:

- [ ] Test activity tracking updates `lastActivityAt`
- [ ] Test orphaned item cleanup with test users
- [ ] Test released bundle cleanup doesn't delete shared items
- [ ] Verify warning emails are sent
- [ ] Test tier limits on release date picker
- [ ] Verify cleanup crons run successfully
- [ ] Test database indexes for performance

---

## Next Steps

1. **Implement activity tracking API** - High priority
2. **Implement cron jobs** - High priority
3. **Add UI warnings** - Medium priority
4. **Update bundle release logic** - High priority
5. **Set up GitHub Actions** - Medium priority
6. **Test end-to-end** - Before production

Would you like me to continue implementing the remaining pieces?
