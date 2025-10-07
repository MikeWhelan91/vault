# Vault Worker API - R2 Storage Backend

This Cloudflare Worker provides secure R2 storage endpoints for the Zero-Knowledge Vault application.

## Features

- ✅ **R2 Object Storage**: PUT, GET, DELETE, HEAD operations
- ✅ **CORS Support**: Configured for cross-origin requests from your frontend
- ✅ **Zero-Knowledge**: Only stores encrypted ciphertext, never has access to keys or plaintext
- ✅ **Type-Safe**: Full TypeScript support with Cloudflare Workers types
- ✅ **Environment-Aware**: Separate dev/production configurations

## Prerequisites

1. **Cloudflare Account** (free tier works)
2. **Node.js** 18+ and npm
3. **Wrangler CLI** (will be installed via npm)

## Setup Instructions

### 1. Install Dependencies

```bash
cd worker
npm install
```

### 2. Authenticate with Cloudflare

```bash
npx wrangler login
```

This will open your browser to authenticate with your Cloudflare account.

### 3. Create R2 Buckets

Create the production and development R2 buckets:

```bash
# Production bucket
npm run r2:create

# Development bucket
npm run r2:create:dev
```

**Expected Output:**
```
Created bucket 'vault-data' with default storage class set to Standard.
Created bucket 'vault-data-dev' with default storage class set to Standard.
```

### 4. Update CORS Configuration

Edit `wrangler.toml` and update the `ALLOWED_ORIGINS` variable with your actual domain:

```toml
[vars]
ALLOWED_ORIGINS = "http://localhost:3000,https://your-app.pages.dev"

[env.production]
vars = { ALLOWED_ORIGINS = "https://your-app.pages.dev" }
```

### 5. Test Locally

Run the worker in development mode:

```bash
npm run dev
```

This starts a local server at `http://localhost:8787`. You can test endpoints:

```bash
# Health check
curl http://localhost:8787/health

# Expected response:
# {"status":"ok","timestamp":"2024-...","version":"1.0.0"}
```

### 6. Deploy to Production

Deploy the worker to Cloudflare:

```bash
npm run deploy
```

**Expected Output:**
```
Uploaded vault-api (1.23 sec)
Published vault-api (0.45 sec)
  https://vault-api.<your-subdomain>.workers.dev
```

**Copy the Worker URL** - you'll need it for your frontend configuration.

## Configure Frontend

After deploying, update your Next.js app's `.env.local`:

```bash
# In the main vault directory (not worker/)
cd ..
echo "NEXT_PUBLIC_WORKER_URL=https://vault-api.<your-subdomain>.workers.dev" > .env.local
```

Or if you already have `.env.local`, update it:

```env
NEXT_PUBLIC_WORKER_URL=https://vault-api.<your-subdomain>.workers.dev
```

Restart your Next.js dev server to pick up the new environment variable.

## API Endpoints

### Health Check
```
GET /health
```

### List Objects
```
GET /r2/list?prefix={userId}/
```

### Upload Object
```
PUT /r2/{userId}/{itemId}/{version}.bin
Body: Binary encrypted data
```

### Download Object
```
GET /r2/{userId}/{itemId}/{version}.bin
```

### Get Object Metadata
```
HEAD /r2/{userId}/{itemId}/{version}.bin
```

### Delete Object
```
DELETE /r2/{userId}/{itemId}/{version}.bin
```

## Storage Structure

Objects are stored in R2 with this key pattern:

```
{email}/{itemId}/{version}.bin
```

Example:
```
user@example.com/cltx5k2ab0001/1.bin
user@example.com/cltx5k2ab0002/1.bin
```

## Security

- ✅ **CORS**: Only configured origins can access the API
- ✅ **Key Validation**: Only allows specific key formats
- ✅ **Zero-Knowledge**: Worker never has access to encryption keys
- ✅ **Encrypted Data**: All stored data is AES-256-GCM encrypted ciphertext

## Monitoring

View live logs from your worker:

```bash
npm run tail
```

## Cost Estimates (Cloudflare Free Tier)

- **R2 Storage**: 10 GB free
- **R2 Requests**:
  - Class A (writes): 1M/month free
  - Class B (reads): 10M/month free
- **Worker Requests**: 100k/day free
- **Worker CPU**: 10ms/request free

For most personal vault use cases, this should stay within free tier limits.

## Troubleshooting

### Error: "Bucket not found"

Create the R2 buckets:
```bash
npm run r2:create
npm run r2:create:dev
```

### Error: "CORS policy" in browser

Update `ALLOWED_ORIGINS` in `wrangler.toml` to include your frontend URL, then redeploy:
```bash
npm run deploy
```

### Error: "Unauthorized" during deployment

Re-authenticate with Cloudflare:
```bash
npx wrangler login
```

## Development Workflow

1. Make changes to `src/index.ts`
2. Test locally: `npm run dev`
3. Deploy: `npm run deploy`
4. Monitor: `npm run tail`

## Production Checklist

- [ ] R2 buckets created (`vault-data` and `vault-data-dev`)
- [ ] `ALLOWED_ORIGINS` updated with production domain
- [ ] Worker deployed and accessible
- [ ] Frontend `.env.local` updated with Worker URL
- [ ] Health check endpoint returns 200
- [ ] Test upload/download flow works end-to-end

## Next Steps

After deploying the Worker:

1. Test the connection from your Next.js app
2. Try uploading an encrypted note or file
3. Verify data appears in R2 bucket (via Cloudflare dashboard)
4. Set up alerting for Worker errors (optional)
