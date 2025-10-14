# Forebearer Pricing Implementation Plan

## Current Status
✅ Updated all pricing documentation (FAQ, landing page)
✅ Created pricing constants file (`src/lib/pricing.ts`)
✅ Defined tier limits and feature gates

## Tier Structure

### FREE TIER
- **Storage**: 300 MB
- **Active Bundles**: 1
- **Trustees**: Up to 10 per bundle
- **Heartbeat**: Monthly check-ins only
- **Features**: Basic email notifications, community support
- **NO**: Release analytics, custom schedules, priority support

### PLUS TIER ($9/month or $99/year)
- **Storage**: 5 GB
- **Active Bundles**: Unlimited
- **Trustees**: Unlimited
- **Heartbeat**: Custom schedules (weekly, bi-weekly, custom)
- **Features**: Release analytics, priority support, all email types

---

## Backend Implementation Needed

### 1. Database Schema Updates
**Priority: HIGH**

Add to `users` table:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS tier VARCHAR(10) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_limit BIGINT DEFAULT 314572800; -- 300 MB
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_period VARCHAR(10); -- 'monthly' or 'annual'
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP;
```

### 2. API Endpoint Updates
**Priority: HIGH**

#### `/api/items` (POST)
- Check storage limits before upload
- Return specific error codes: `STORAGE_LIMIT_EXCEEDED`

#### `/api/bundles` (POST) - NEW ENDPOINT NEEDED
- Check bundle limit: `canCreateBundle(tier, currentCount)`
- Return error: `BUNDLE_LIMIT_EXCEEDED` if over limit

#### `/api/bundles/:id/trustees` (POST) - NEW ENDPOINT NEEDED
- Check trustee limit: `canAddTrustee(tier, currentCount)`
- Return error: `TRUSTEE_LIMIT_EXCEEDED` if over limit

#### `/api/user/tier` (GET)
- Return current tier, limits, and usage

### 3. Stripe Integration
**Priority: MEDIUM** (Can launch without, manually manage at first)

Endpoints needed:
- `POST /api/checkout/create` - Create Stripe checkout session
- `POST /api/webhooks/stripe` - Handle subscription events
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`

Stripe Products to create:
- `prod_plus_monthly` - Plus Monthly ($9/month)
- `prod_plus_annual` - Plus Annual ($99/year)

### 4. Heartbeat Schedule Restrictions
**Priority: LOW** (Nice to have, not critical for launch)

- Frontend: Disable/hide weekly/bi-weekly options for free tier
- Backend: Validate `intervalDays >= tier.heartbeat.minIntervalDays`

### 5. Release Analytics
**Priority: LOW** (Plus feature)

Database additions:
```sql
CREATE TABLE IF NOT EXISTS release_views (
  id SERIAL PRIMARY KEY,
  release_id INTEGER REFERENCES releases(id),
  trustee_email VARCHAR(255),
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45)
);
```

Track when trustees:
- Receive email (already tracked)
- Open release link
- Download items

Only show to Plus users.

---

## Frontend Implementation Needed

### 1. Upgrade Prompts
**Priority: HIGH**

Create `<UpgradePrompt>` component:
- Shows when user hits limits
- Uses messages from `UPGRADE_MESSAGES`
- Links to `/app/settings/billing` or Stripe checkout

Trigger on:
- Creating 2nd bundle (free users)
- Adding 11th trustee (free users)
- Uploading beyond 300 MB (free users)
- Trying to set weekly heartbeat (free users)

### 2. Settings > Billing Page
**Priority: MEDIUM**

Display:
- Current tier
- Usage stats (storage, bundles, trustees)
- Upgrade/downgrade options
- Billing history (if Plus)
- Cancel subscription button (if Plus)

### 3. Dashboard Storage Indicator
**Priority: HIGH**

Show:
```
Storage: 145 MB / 300 MB (48%)
[=========>     ]
```

Turn red at 80%+, show upgrade prompt at 100%

### 4. Bundle Creation Flow
**Priority: HIGH**

Before creating bundle:
```typescript
import { canCreateBundle, UPGRADE_MESSAGES } from '@/lib/pricing';

if (!canCreateBundle(user.tier, currentBundleCount)) {
  showUpgradePrompt(UPGRADE_MESSAGES.bundle_limit);
  return;
}
```

### 5. Analytics Page (Plus Only)
**Priority: LOW**

New page: `/app/releases/:id/analytics`
- Show who viewed
- When they viewed
- What they downloaded
- Only accessible to Plus users

---

## Launch Strategy

### Phase 1: MVP (Launch without payments)
**Week 1-2**
1. ✅ Update all documentation
2. ✅ Create pricing constants
3. ⬜ Add `tier` column to database (default everyone to 'free')
4. ⬜ Implement storage limit checks
5. ⬜ Implement bundle limit checks (block at 2nd bundle)
6. ⬜ Add upgrade prompts UI
7. ⬜ Create Settings > Billing page (show "Coming Soon" for upgrades)

**Result**: Users see limits, get prompts, but can't actually pay yet

### Phase 2: Payment Integration
**Week 3-4**
1. Set up Stripe account
2. Create products & prices
3. Build checkout flow
4. Implement webhook handlers
5. Test subscription lifecycle
6. Add billing management UI

### Phase 3: Premium Features
**Week 5+**
1. Implement release analytics
2. Add custom heartbeat schedules
3. Priority support badge/routing
4. Consider additional Plus features

---

## Immediate Next Steps

1. **Backend**: Add `tier` column to database, default to 'free'
2. **Backend**: Update storage checks to use tier limits
3. **Frontend**: Import pricing constants into relevant components
4. **Frontend**: Build `<UpgradePrompt>` modal component
5. **Frontend**: Add storage usage indicator to dashboard

---

## Testing Checklist

- [ ] Free user can create 1 bundle
- [ ] Free user blocked at 2nd bundle
- [ ] Free user can add 10 trustees
- [ ] Free user blocked at 11th trustee
- [ ] Free user can upload up to 300 MB
- [ ] Free user blocked beyond 300 MB
- [ ] Plus user has no limits (except storage)
- [ ] Upgrade prompts show correct messaging
- [ ] Stripe checkout creates subscription
- [ ] Subscription webhook updates user tier
- [ ] Downgrade warning shown correctly
