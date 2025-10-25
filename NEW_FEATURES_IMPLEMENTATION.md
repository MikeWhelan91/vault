# New Features Implementation Guide

## ✅ Completed: Database Schema

All four major features have been added to the database schema:

### 1. Password Vault ✅
- `Password` model with encrypted password storage
- `EmergencyAccess` model for beneficiary access
- Support for multiple password types: logins, credit cards, secure notes
- Categories, favorites, last used tracking

### 2. Digital Asset Inventory ✅
- `DigitalAsset` model for tracking all digital accounts
- Categories: financial, social_media, subscription, email, crypto, domains, cloud_storage
- Encrypted account details and beneficiary instructions
- Value estimation and renewal tracking

### 3. Video Messages ✅
- `VideoMessage` model for storing encrypted video recordings
- `VideoRecipient` model for managing who receives videos
- Trigger types: date, age milestones, events
- Support for guided memory prompts

### 4. Life Event Triggers ✅
- Added to `ReleaseBundle` model
- New mode: `'life-event'`
- Trigger types: birthday, age milestone, anniversary, recurring annual, custom date
- Recipient tracking for age-based triggers

---

## 🚧 In Progress: API Endpoints

### Password Vault APIs - Partially Complete
- ✅ `POST /api/passwords` - Create password
- ✅ `GET /api/passwords` - List passwords (with filtering)
- ✅ `GET /api/passwords/[id]` - Get single password
- ✅ `PATCH /api/passwords/[id]` - Update password
- ✅ `DELETE /api/passwords/[id]` - Delete password
- ⏳ Emergency Access APIs (to be built)

### Digital Asset APIs - Partially Complete
- ✅ `POST /api/digital-assets` - Create asset
- ✅ `GET /api/digital-assets` - List assets with summary
- ⏳ Update/Delete endpoints (to be built)

### Video Message APIs - Not Started
- ⏳ Upload/record video API
- ⏳ List/manage videos API
- ⏳ Trigger checking cron job

### Life Event Triggers - Not Started
- ⏳ Update bundle creation to support life events
- ⏳ Cron job to check for life event triggers
- ⏳ Age calculation logic

---

## 📋 Next Steps

### Priority 1: Complete Password Vault

#### Emergency Access Features
Create these API endpoints:

1. **POST /api/passwords/emergency-access**
   ```typescript
   // Invite emergency contact
   {
     userId: string,
     trusteeEmail: string,
     trusteeName: string,
     accessLevel: 'view' | 'takeover',
     waitTimeDays: number
   }
   ```

2. **POST /api/passwords/emergency-access/[id]/request**
   ```typescript
   // Trustee requests access
   // Starts wait timer
   ```

3. **POST /api/passwords/emergency-access/[id]/grant**
   ```typescript
   // Owner manually approves request
   ```

4. **POST /api/passwords/emergency-access/[id]/deny**
   ```typescript
   // Owner denies request
   ```

5. **GET /api/passwords/emergency-access/granted/[token]**
   ```typescript
   // Trustee accesses passwords after wait period
   ```

#### Password Vault UI Components

Create these components:

1. **PasswordVaultPage** - Main password list
   - Search and filter
   - Categories sidebar
   - Favorites section
   - Quick actions (copy password, open URL)

2. **PasswordEditor** - Create/Edit modal
   - Category selection
   - Auto-fill URL from browser
   - Password strength indicator
   - Encrypted notes field

3. **EmergencyAccessManager** - Manage emergency contacts
   - List of emergency contacts
   - Status indicators (pending, active, requested)
   - Add new contact modal
   - Approve/deny requests

---

### Priority 2: Complete Digital Asset Inventory

#### Remaining APIs
1. **PATCH /api/digital-assets/[id]** - Update asset
2. **DELETE /api/digital-assets/[id]** - Delete asset
3. **GET /api/digital-assets/summary** - Dashboard stats

#### UI Components

1. **DigitalAssetsPage** - Main inventory view
   - Category breakdown
   - Total value calculator
   - Renewal date warnings
   - Quick add button

2. **AssetEditor** - Create/Edit modal
   - Category templates (pre-filled fields)
   - Platform suggestions
   - Value estimation helper
   - Beneficiary instructions

3. **AssetsDashboard** - Summary widget for main dashboard
   - Total digital estate value
   - Upcoming renewals/expirations
   - Asset count by category

---

### Priority 3: Video Messages

#### Upload & Recording API
1. **POST /api/videos/upload** - Direct upload to R2
   - Chunked upload for large files
   - Generate thumbnail
   - Encrypt video

2. **POST /api/videos/record** - Browser recording
   - MediaRecorder API integration
   - Max duration enforcement (5min free, 30min plus)
   - Real-time encryption

3. **GET /api/videos** - List user's videos
4. **POST /api/videos/[id]/send** - Manually send video

#### Recording UI Components

1. **VideoRecorder** - Browser-based recording
   - Camera/mic permission handling
   - Recording timer
   - Preview before save
   - Guided prompt system

2. **VideoLibrary** - Manage videos
   - Grid view with thumbnails
   - Play/preview
   - Edit triggers
   - Manage recipients

3. **GuidedMemoryPrompts** - Structured interview
   - Pre-written questions
   - Progress tracker
   - Skip/rerecord options

---

### Priority 4: Life Event Triggers

#### Cron Job Updates
Add to `/api/cron/hourly` or create `/api/cron/daily`:

```typescript
// Check for life event triggers
const lifeEventBundles = await prisma.releaseBundle.findMany({
  where: {
    mode: 'life-event',
    released: false,
  },
});

for (const bundle of lifeEventBundles) {
  const shouldRelease = checkLifeEventTrigger(bundle);
  if (shouldRelease) {
    await triggerRelease(bundle);
  }
}

function checkLifeEventTrigger(bundle) {
  if (bundle.lifeEventType === 'age_milestone') {
    // Calculate current age from birthdate
    const age = calculateAge(bundle.recipientBirthdate);
    return age >= bundle.targetAge;
  }

  if (bundle.lifeEventType === 'recurring_annual') {
    const today = new Date();
    return today.getMonth() + 1 === bundle.recurringMonth &&
           today.getDate() === bundle.recurringDay;
  }

  // ... other trigger types
}
```

#### UI Integration

Update bundle creation form to include:
- Life event mode selection
- Recipient name/birthdate input
- Age milestone selector
- Recurring date picker
- Custom event date

---

## 🎨 UI Design Patterns

### Password Vault
```
┌─────────────────────────────────────────────────┐
│ 🔐 Password Vault                     [+ New]   │
├─────────────────────────────────────────────────┤
│ Search... │ All │ Logins │ Cards │ Notes │ ⭐  │
├─────────────────────────────────────────────────┤
│ ⭐ Gmail                          Last used: 2h │
│    username@gmail.com             [Copy] [Open]│
├─────────────────────────────────────────────────┤
│    Bank of America                              │
│    ****1234                       [Copy] [Open]│
└─────────────────────────────────────────────────┘
```

### Digital Asset Inventory
```
┌─────────────────────────────────────────────────┐
│ 💼 Digital Assets              Total: $125,000  │
├─────────────────────────────────────────────────┤
│ 💰 Financial (5)                      $100,000  │
│ 📱 Social Media (8)                   —         │
│ 📧 Email (3)                          —         │
│ 🔐 Crypto (2)                         $25,000   │
├─────────────────────────────────────────────────┤
│ ⚠️  3 assets expiring soon                      │
└─────────────────────────────────────────────────┘
```

### Video Messages
```
┌─────────────────────────────────────────────────┐
│ 🎥 Video Messages                   [+ Record]  │
├─────────────────────────────────────────────────┤
│ [▶️ Thumbnail]  18th Birthday - Sarah           │
│   Trigger: When Sarah turns 18                  │
│   2:34 duration · Created Oct 25                │
├─────────────────────────────────────────────────┤
│ [▶️ Thumbnail]  Life Lessons                    │
│   Trigger: Manual                               │
│   5:12 duration · Created Oct 20                │
└─────────────────────────────────────────────────┘
```

---

## 🔒 Encryption Pattern

All features follow the same zero-knowledge encryption pattern as Items:

```typescript
// Client-side encryption before sending to server
const { encrypted, iv, salt, wrappedKey, wrappedKeyIV } = await encryptData(
  sensitiveData,
  userMasterKey
);

// Send to server
await fetch('/api/passwords', {
  method: 'POST',
  body: JSON.stringify({
    passwordEncrypted: encrypted,
    passwordIV: iv,
    passwordKeySalt: salt,
    wrappedPasswordKey: wrappedKey,
    wrappedPasswordKeyIV: wrappedKeyIV,
  }),
});

// Server only stores encrypted data, cannot decrypt
```

---

## 📊 Pricing Tier Limits

### Free Tier
- 5 password vault entries
- 5 digital asset entries
- 1 video message (5 min max)
- Basic life event triggers

### Plus Tier ($9/month)
- Unlimited passwords
- Emergency access for passwords
- Unlimited digital assets
- Unlimited video messages (30 min max each)
- All life event trigger types
- Priority support

---

## 🚀 Deployment Checklist

- [x] Database schema updated
- [x] Schema pushed to production DB
- [x] Password API endpoints created
- [x] Digital Asset API endpoints created
- [ ] Complete Emergency Access API
- [ ] Build Password Vault UI
- [ ] Build Digital Asset Inventory UI
- [ ] Create Video Message recording/upload API
- [ ] Build Video Message UI
- [ ] Update bundle creation for life events
- [ ] Add life event cron job
- [ ] Update pricing tier logic
- [ ] Update dashboard to show new features
- [ ] Create migration guide for users
- [ ] Update marketing pages

---

## 💡 Quick Wins Available Now

Even with partial implementation, you can:

1. **Test Password Vault API** - Create/retrieve passwords via API
2. **Test Digital Asset API** - Add digital assets via API
3. **Plan UI Integration** - Start building React components
4. **Update Dashboard** - Add placeholders for new features

---

## 📞 Next Session Focus

Recommend focusing on:
1. **Password Vault UI** - Most requested feature
2. **Emergency Access Flow** - Key differentiator
3. **Dashboard Integration** - Show feature to users

This will give you a complete, shippable Password Vault feature that provides immediate value!
