# Database Setup - Neon Postgres + Prisma

## ✅ What's Been Set Up

### Database: Neon Postgres
- **Provider**: Neon (serverless Postgres)
- **Connection**: Pooled connection for optimal performance
- **Location**: EU West 2 (London)
- **SSL**: Required for security

### ORM: Prisma
- **Version**: 6.17.0
- **Client Generated**: `src/generated/prisma`
- **Migration Status**: Initial schema created ✅

## 📊 Database Schema

### Tables Created

#### **User**
```sql
- id (cuid)
- email (unique)
- dataKeySalt (encrypted key material)
- wrappedDataKey (encrypted)
- wrappedDataKeyIV
- totalSize (storage used)
- storageLimit (5GB default)
- createdAt, updatedAt
```

#### **Item** (Files & Notes)
```sql
- id, userId
- type ('file' | 'note')
- name, size, version
- r2Key (storage location)
- itemKeySalt, wrappedItemKey, wrappedItemKeyIV
- createdAt, updatedAt
```

#### **ReleaseBundle**
```sql
- id, userId
- name, mode ('time-lock' | 'heartbeat')
- releaseDate (optional)
- heartbeatCadenceDays, lastHeartbeat (optional)
- released (boolean)
- releaseToken (unique)
- createdAt, updatedAt
```

#### **BundleItem** (Junction table)
```sql
- id, bundleId, itemId
- createdAt
```

#### **Trustee**
```sql
- id, bundleId
- email, name
- notified (boolean)
- accessedAt
- createdAt
```

#### **Heartbeat**
```sql
- id, userId (unique)
- enabled, cadenceDays
- lastHeartbeat, nextHeartbeat
- createdAt, updatedAt
```

## 🔧 Available Commands

```bash
# Run database migrations
npm run db:migrate

# Push schema changes without creating migration
npm run db:push

# Open Prisma Studio (visual database browser)
npm run db:studio

# Regenerate Prisma Client
npm run db:generate
```

## 🚀 Next Steps

### 1. Update CryptoContext to use Prisma
Instead of localStorage, save:
- User records with wrapped keys
- Item metadata
- Release bundles
- Heartbeat settings

### 2. Create API Routes
Create Next.js API routes in `src/app/api/`:
- `POST /api/auth/unlock` - Create/unlock user account
- `GET /api/items` - List user's items
- `POST /api/items` - Create new item
- `GET /api/items/[id]` - Get item details
- `DELETE /api/items/[id]` - Delete item
- `POST /api/bundles` - Create release bundle
- `POST /api/heartbeat` - Record heartbeat

### 3. Migration Strategy
**Phase 1: Dual Write** (Current → Database)
- Keep localStorage working
- Also write to database
- Read from database when available

**Phase 2: Database Primary**
- Remove localStorage code
- Use database as source of truth
- Migrate existing users

## 🔐 Security Considerations

### What's Stored in Database
✅ **User email** - Public identifier
✅ **Wrapped keys** - Encrypted with user's passphrase
✅ **Item metadata** - Names, sizes, types
✅ **Salts & IVs** - Public cryptographic parameters
✅ **Release bundle settings** - Dates, trustees

### What's NOT in Database
❌ **Passphrases** - Never stored anywhere
❌ **Unencrypted keys** - Only in browser memory
❌ **File contents** - Stored encrypted in R2
❌ **Note contents** - Stored encrypted in R2

### Key Security Properties
- **Zero-Knowledge**: Database admin cannot decrypt user data
- **Client-Side Derivation**: Keys derived in browser from passphrase
- **Wrapped Keys**: Data keys encrypted with master key
- **No Server Access**: Server never sees plaintext data

## 📝 Example Usage

```typescript
import prisma from '@/lib/prisma';

// Create a user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    dataKeySalt: 'hex...',
    wrappedDataKey: 'hex...',
    wrappedDataKeyIV: 'hex...',
  },
});

// Create an item
const item = await prisma.item.create({
  data: {
    userId: user.id,
    type: 'file',
    name: 'secret.pdf',
    size: 1024n,
    r2Key: 'user@example.com/item-id/1.bin',
    itemKeySalt: 'hex...',
    wrappedItemKey: 'hex...',
    wrappedItemKeyIV: 'hex...',
  },
});

// List user's items
const items = await prisma.item.findMany({
  where: { userId: user.id },
  orderBy: { updatedAt: 'desc' },
});
```

## 🎯 Production Readiness

Before going live:
- [ ] Set up database backups (Neon handles this)
- [ ] Configure connection pooling (already using pooler)
- [ ] Add database monitoring
- [ ] Set up alerts for storage limits
- [ ] Implement rate limiting on API routes
- [ ] Add proper error handling
- [ ] Set up logging (Sentry, etc.)

## 🔗 Resources

- **Neon Dashboard**: https://console.neon.tech/
- **Prisma Studio**: Run `npm run db:studio`
- **Schema File**: `prisma/schema.prisma`
- **Migrations**: `prisma/migrations/`
- **Generated Client**: `src/generated/prisma/`
