# Android/Capacitor Compatibility Checklist

## Storage Retention System - Android Verification

### ✅ Backend APIs (All Compatible)

All new backend endpoints are standard REST APIs that work identically on web and Android:

1. **`POST /api/user/activity`**
   - Standard JSON POST request
   - ✅ Works on Android via fetch/axios
   - Called from CryptoContext (works cross-platform)

2. **`POST /api/cron/cleanup-orphaned-items`**
   - Server-side cron job
   - ✅ No client dependency (runs on server)

3. **`POST /api/cron/cleanup-released-bundles`**
   - Server-side cron job
   - ✅ No client dependency (runs on server)

4. **`GET /api/cron/hourly`** (modified)
   - Server-side cron job
   - ✅ No client dependency (runs on server)

### ✅ Database Changes (All Compatible)

Schema updates via Prisma work identically:

1. **User.lastActivityAt**
   - ✅ Standard DateTime field
   - ✅ Accessed via Prisma client (works everywhere)

2. **ReleaseBundle fields** (releasedAt, deleteScheduledFor, archived)
   - ✅ Standard DateTime/Boolean fields
   - ✅ Accessed via Prisma client (works everywhere)

### ✅ UI Components (Mobile-Responsive)

1. **Items Page Warning Banner**
   - Location: `src/app/app/items/ItemsPageClient.tsx`
   - Uses: `<Card>`, `<Button>`, `<AlertCircle>`
   - ✅ All components are mobile-responsive
   - ✅ Uses Tailwind responsive classes
   - ✅ Tested pattern (similar to existing alerts)

2. **MobilePageHeader** (already mobile-native)
   - ✅ Already works on Android
   - ✅ No changes needed

### ✅ Pricing Tier System

1. **New tier types**: `free | plus_monthly | plus_annual | plus_lifetime`
   - ✅ Backend enum (works everywhere)
   - ✅ Helper functions are pure TypeScript

2. **`isPaidTier()` helper**
   - Pure function, no platform dependencies
   - ✅ Works on web and Android

3. **Release window limits**
   - Enforced server-side in bundle creation
   - ✅ Works identically on Android

### 🔄 Integration Points to Test on Android

While everything is compatible, these areas should be tested:

#### 1. Activity Tracking

The activity tracking needs to be called from Android flows:

**Where to add calls:**

```typescript
// In CryptoContext or wherever user actions happen
const trackActivity = async () => {
  try {
    await fetch('/api/user/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.dbUserId })
    });
  } catch (error) {
    // Silent fail - not critical
    console.log('Activity tracking failed:', error);
  }
};

// Call on:
- unlock() // When user unlocks vault
- addItem() // When user uploads file
- addBundle() // When user creates bundle
- checkIn() // When user does heartbeat check-in
```

**Status:** ✅ Compatible (standard fetch), ⚠️ Needs integration

#### 2. Inactivity Warning Display

The warning banner uses:
- `metadata.lastActivityAt` (from CryptoContext)
- `metadata.bundles` (from CryptoContext)
- `router.push()` (Next.js navigation)

**Android Testing:**
- [x] Verify CryptoContext includes `lastActivityAt` in metadata
- [ ] Test warning banner displays after 18 months mock
- [ ] Test "Add Items to Bundle" button navigation

**Status:** ✅ Compatible, ⏳ Needs testing

#### 3. Tier Checks

All tier checks now use `isPaidTier(tier)` instead of `tier === 'plus'`

**Files Updated:**
- DashboardPageClient.tsx
- SettingsPageClient.tsx
- layout.tsx
- PricingPageClient.tsx
- billing/page.tsx

**Android Testing:**
- [ ] Verify Plus badge shows for all paid tiers
- [ ] Verify free tier restrictions work
- [ ] Test tier-based feature gates

**Status:** ✅ Compatible, ⏳ Needs testing

### 🔍 Android-Specific Considerations

#### Capacitor HTTP Plugin

If using Capacitor's HTTP plugin instead of fetch:

```typescript
import { CapacitorHttp } from '@capacitor/core';

const trackActivity = async () => {
  try {
    await CapacitorHttp.post({
      url: `${API_URL}/api/user/activity`,
      headers: { 'Content-Type': 'application/json' },
      data: { userId: session.dbUserId }
    });
  } catch (error) {
    console.log('Activity tracking failed:', error);
  }
};
```

**Note:** Standard `fetch()` works fine on Android, Capacitor HTTP is optional.

#### Storage Persistence

Android needs to persist `lastActivityAt` from server:

```typescript
// In CryptoContext metadata fetch
const metadata = await response.json();
// metadata.lastActivityAt is included
// ✅ Already works (no changes needed)
```

#### Date Handling

Uses standard JavaScript Date:
- `new Date(metadata.lastActivityAt)` ✅ Works
- `Date.now()` ✅ Works
- Date arithmetic ✅ Works

**Status:** ✅ No issues

### 📋 Pre-Deployment Android Testing Checklist

- [ ] **Login Flow**
  - [ ] lastActivityAt updates on Android login
  - [ ] Activity tracking endpoint accessible from Android

- [ ] **Items Page**
  - [ ] Warning banner displays correctly on mobile
  - [ ] Button navigation works
  - [ ] Responsive layout looks good

- [ ] **Upload Flow**
  - [ ] Activity tracks on file upload
  - [ ] Storage limits respect new tiers

- [ ] **Bundle Creation**
  - [ ] Activity tracks on bundle creation
  - [ ] Release window limits enforced based on tier
  - [ ] Free tier: max 1 year
  - [ ] Monthly tier: max 5 years
  - [ ] Annual tier: max 10 years
  - [ ] Lifetime tier: unlimited

- [ ] **Tier Display**
  - [ ] Plus badge shows for all paid tiers
  - [ ] Tier displayed correctly in settings
  - [ ] Upgrade prompts work

- [ ] **Check-in Flow** (Heartbeat)
  - [ ] Activity tracks on check-in
  - [ ] Works from Android notifications

### 🚀 Deployment Steps

1. **Database Migration** (Already applied ✅)
   ```bash
   npx prisma migrate deploy
   ```

2. **Set CRON_SECRET** (If not set)
   ```bash
   # Add to environment variables
   CRON_SECRET=your-secret-here
   ```

3. **Schedule Cron Jobs** (GitHub Actions or external)
   ```yaml
   # Daily at 2 AM UTC
   - cron: '0 2 * * *'
   ```

4. **Test Endpoints**
   ```bash
   # Test activity tracking
   curl -X POST https://yourdomain.com/api/user/activity \
     -H "Content-Type: application/json" \
     -d '{"userId":"test-user-id"}'

   # Test cleanup (requires CRON_SECRET)
   curl -X POST https://yourdomain.com/api/cron/cleanup-orphaned-items \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

5. **Android Build & Test**
   ```bash
   npm run build:android
   # Install on test device
   # Run through checklist above
   ```

### 📊 Expected Behavior

**Scenario 1: New User**
- Signs up → lastActivityAt set to now()
- Uploads files → lastActivityAt updates
- No warning banner (active user)

**Scenario 2: Inactive User (18+ months)**
- Hasn't logged in for 18 months
- Has items not in bundles
- ⚠️ Warning banner appears on Items page
- Can dismiss by: logging in (resets timer) or adding to bundle

**Scenario 3: Released Bundle**
- Bundle releases → releasedAt set, deleteScheduledFor calculated
- Trustees receive emails
- Bundle data available for download for retention period
- After retention → data deleted via cleanup cron
- Metadata preserved (archived = true)

### ✅ Summary

**All new features are Android-compatible** because:

1. ✅ Standard REST APIs (no web-only dependencies)
2. ✅ Server-side processing (cron jobs independent of client)
3. ✅ Mobile-responsive UI components
4. ✅ Pure TypeScript/JavaScript (no platform-specific code)
5. ✅ Standard date handling (no web-only Date APIs)

**No additional Android-specific code needed.**

The only requirement is **integrating activity tracking calls** into existing flows, which is a simple `fetch()` call that works identically on web and Android.
