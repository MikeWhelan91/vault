# Per-Bundle Check-In System - Complete Flow Documentation

## Overview

The heartbeat system now works **per-bundle** instead of per-user. Each bundle tracks its own check-in schedule independently.

---

## Changes Made

### 1. ✅ Database Schema (`prisma/schema.prisma`)
- **Added** `nextHeartbeat DateTime?` to `ReleaseBundle` model
- **Added** index on `[mode, released, nextHeartbeat]` for efficient queries
- **Removed dependency** on `Heartbeat` table for check-in tracking

### 2. ✅ Bundle Creation API (`src/app/api/bundles/route.ts`)
- **Sets** `lastHeartbeat` to now when bundle is created
- **Calculates** `nextHeartbeat` based on `heartbeatCadenceDays`
- **Removed** creation/update of `Heartbeat` table record

### 3. ✅ Cron Job (`src/app/api/cron/hourly/route.ts`)
- **Changed** from checking `Heartbeat` table to checking `ReleaseBundle` table directly
- **Queries** for bundles where:
  - `mode = 'heartbeat'`
  - `released = false`
  - `heartbeatPaused = false`
  - `nextHeartbeat < now`
- **Sends** per-bundle reminders with bundle name in notification

### 4. ✅ Check-In API Endpoint (`src/app/api/bundles/[id]/checkin/route.ts`) **[NEW FILE]**
- **POST** `/api/bundles/{bundleId}/checkin`
- **Resets** `lastHeartbeat` to now
- **Recalculates** `nextHeartbeat` based on bundle's cadence
- **Unpauses** bundle if it was paused

### 5. ✅ Email Updates (`src/lib/email.ts`)
- **Added** optional `bundleName` parameter to `sendCheckInReminder()`
- **Includes** bundle name in reminder emails

### 6. ✅ Check-In UI Component (`src/components/BundleCheckIn.tsx`) **[NEW FILE]**
- **Displays** check-in status for a bundle
- **Shows** time until next deadline
- **Color-codes** urgency (green → amber → red)
- **Button** to check in ("I'm Alive")

### 7. ✅ Migration Script (`migrate_existing_bundles.js`)
- **Migrated** your existing "Heartbeat test edited" bundle
- **Set** `lastHeartbeat` and `nextHeartbeat` fields

---

## Complete Flow

### User Creates Heartbeat Bundle

```
1. User creates bundle in app
   ├─ mode: 'heartbeat'
   ├─ heartbeatCadenceDays: 1
   └─ Items & trustees added

2. API creates bundle with:
   ├─ lastHeartbeat: Oct 25 (now)
   ├─ nextHeartbeat: Oct 26 (now + 1 day)
   └─ released: false
```

### Reminders Sent Before Deadline

```
Every Hour: Cron checks for upcoming deadlines

If bundle.nextHeartbeat is in 3 days (70-74 hours):
  → Send email: "3 days left for 'Bundle Name'"
  → Send push: "3 days left for 'Bundle Name'"

If bundle.nextHeartbeat is in 1 day (22-26 hours):
  → Send email: "1 day left for 'Bundle Name'"
  → Send push: "1 day left for 'Bundle Name'"
```

### User Checks In

#### Option 1: Via Dashboard/App
```
1. User sees check-in card on dashboard
2. Card shows:
   - Bundle name
   - "Next check-in: in 6 hours"
   - Big "I'm Alive" button
3. User clicks button
4. POST /api/bundles/{id}/checkin
5. Bundle updated:
   - lastHeartbeat: Oct 25 (now)
   - nextHeartbeat: Oct 26 (now + cadenceDays)
6. User sees confirmation
7. Timer reset ✓
```

#### Option 2: Via Email Link
```
1. User receives reminder email
2. Clicks "Check In Now" button
3. Opens app to dashboard
4. Sees check-in card for that bundle
5. Clicks "I'm Alive"
6. Timer reset ✓
```

#### Option 3: Via Push Notification (Mobile)
```
1. User receives push: "1 day left for 'Bundle Name'"
2. Taps notification
3. App opens to bundle details or dashboard
4. User sees check-in UI
5. Taps "I'm Alive"
6. Timer reset ✓
```

### User Misses Deadline

```
Every Hour: Cron checks for overdue bundles

If bundle.nextHeartbeat < now:
  1. Cron finds overdue bundle
  2. Marks bundle.released = true
  3. Generates releaseToken
  4. Sends emails to trustees
  5. Sends email to owner
  6. Sends push notifications
  7. Bundle released ✓
```

---

## Example Timeline

### Multi-Bundle Scenario

```
User has 3 bundles:

Bundle A: "Family Photos"
  - Cadence: 1 day
  - Last check-in: Oct 25
  - Next deadline: Oct 26

Bundle B: "Work Documents"
  - Cadence: 7 days
  - Last check-in: Oct 20
  - Next deadline: Oct 27

Bundle C: "Video Messages"
  - Cadence: 30 days
  - Last check-in: Oct 1
  - Next deadline: Oct 31

Oct 26:
  - User checks in for Bundle A only
  - Bundle A deadline: Oct 27 ✓
  - Bundle B still: Oct 27 (unchanged)
  - Bundle C still: Oct 31 (unchanged)

Oct 27:
  - User misses Bundle A and Bundle B deadlines
  - Cron releases BOTH Bundle A and Bundle B
  - Bundle C still safe until Oct 31
```

---

## Database Structure

### Before (User-Level)
```
Heartbeat Table:
┌────────┬──────────┬──────────────┬───────────────┐
│ userId │ enabled  │ lastHeartbeat│ nextHeartbeat │
├────────┼──────────┼──────────────┼───────────────┤
│ user1  │ true     │ Oct 25       │ Oct 26        │
└────────┴──────────┴──────────────┴───────────────┘

Problem: If overdue, ALL heartbeat bundles released together
```

### After (Per-Bundle)
```
ReleaseBundle Table:
┌──────────┬─────────────┬──────┬──────────────┬───────────────┐
│ id       │ name        │ mode │ lastHeartbeat│ nextHeartbeat │
├──────────┼─────────────┼──────┼──────────────┼───────────────┤
│ bundle1  │ Photos      │ hb   │ Oct 25       │ Oct 26        │
│ bundle2  │ Documents   │ hb   │ Oct 20       │ Oct 27        │
│ bundle3  │ Messages    │ hb   │ Oct 1        │ Oct 31        │
└──────────┴─────────────┴──────┴──────────────┴───────────────┘

✓ Each bundle tracks its own schedule
✓ Check-ins are per-bundle
✓ Releases are independent
```

---

## API Endpoints

### Check In to Bundle
```http
POST /api/bundles/{bundleId}/checkin

Response:
{
  "success": true,
  "bundle": {
    "id": "cmgu4...",
    "name": "Heartbeat test edited",
    "lastHeartbeat": "2025-10-25T22:30:00.000Z",
    "nextHeartbeat": "2025-10-26T22:30:00.000Z",
    "cadenceDays": 1
  }
}
```

### Get Bundle Details (includes heartbeat info)
```http
GET /api/bundles?userId={userId}

Response includes nextHeartbeat for each bundle
```

---

## UI Integration Points

### 1. Dashboard (`DashboardPageClient.tsx`)
Add check-in cards for each heartbeat bundle:

```tsx
import { BundleCheckIn } from '@/components/BundleCheckIn';

// In your component:
{bundles
  .filter(b => b.mode === 'heartbeat' && !b.released)
  .map(bundle => (
    <BundleCheckIn
      key={bundle.id}
      bundleId={bundle.id}
      bundleName={bundle.name}
      lastHeartbeat={bundle.lastHeartbeat}
      nextHeartbeat={bundle.nextHeartbeat}
      cadenceDays={bundle.heartbeatCadenceDays}
      onCheckInSuccess={() => fetchBundles()}
    />
  ))
}
```

### 2. Bundles Page (`BundlesPageClient.tsx`)
Show check-in button next to each heartbeat bundle

### 3. Bundle Details Page
Show detailed check-in status and history

### 4. Mobile App
- Deep link from push notifications to check-in screen
- Show check-in widget on home screen
- Badge icon when check-in due soon

---

## Testing

### Test Check-In
```javascript
// Already created test
node test_checkin.js
```

### Test Cron (after deployment)
```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://forebearer.app/api/cron/hourly
```

---

## Deployment Checklist

- [x] Update schema
- [x] Push schema changes (`npx prisma db push`)
- [x] Migrate existing bundles
- [x] Update bundle creation API
- [x] Update cron logic
- [x] Create check-in API endpoint
- [x] Create check-in UI component
- [x] Update email templates
- [ ] **Deploy to production** (git commit + push)
- [ ] Add `BundleCheckIn` component to Dashboard
- [ ] Add `BundleCheckIn` component to Bundles page
- [ ] Test end-to-end flow
- [ ] Monitor cron job logs

---

## Next Steps

1. **Deploy the code changes**:
   ```bash
   git add .
   git commit -m "Implement per-bundle check-in system"
   git push
   ```

2. **Add check-in UI to Dashboard**:
   - Import `BundleCheckIn` component
   - Map over heartbeat bundles
   - Show check-in card for each

3. **Test the flow**:
   - Create a new heartbeat bundle (1 day cadence)
   - Wait for it to appear on dashboard
   - Click "I'm Alive" button
   - Verify `nextHeartbeat` updates

4. **Monitor production**:
   - Check cron job runs successfully
   - Verify reminders are sent per-bundle
   - Confirm releases happen independently

---

## Key Benefits

✅ **Independent Schedules**: Each bundle has its own check-in cadence
✅ **Granular Control**: Check in for specific bundles, not all at once
✅ **Better UX**: Users see exactly which bundle needs attention
✅ **Flexible**: Different bundles can have different urgency levels
✅ **Scalable**: No user-level bottleneck, works with unlimited bundles

---

## Troubleshooting

### Bundle not showing check-in due date
- Verify `nextHeartbeat` is set in database
- Run `node migrate_existing_bundles.js` if created before update

### Check-in not working
- Check API endpoint is deployed
- Verify bundle is not already released
- Confirm bundle mode is 'heartbeat'

### Cron not triggering releases
- Verify index exists on `[mode, released, nextHeartbeat]`
- Check cron secret is correct
- Look at cron job logs in GitHub Actions
