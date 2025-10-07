# Vault - Zero-Knowledge Encrypted Storage

A secure, zero-knowledge encrypted storage application with time-locked releases and heartbeat monitoring. Built with Next.js 14, deployed on Cloudflare Pages, with encrypted data stored in Cloudflare R2.

## 🔐 Security Model

- **Zero-Knowledge Architecture**: All encryption/decryption happens in the browser
- **Master Key**: Derived from user passphrase using PBKDF2-SHA256 (Argon2id upgrade planned)
- **Data Key**: Random 256-bit AES key, encrypted with Master Key
- **Item Keys**: Unique 256-bit AES keys per item, encrypted with Data Key
- **Encryption**: AES-GCM with 96-bit IVs
- **No Server Access**: Your passphrase and decryption keys never leave your device

## ✨ Features

### Core Functionality
- 📁 **Encrypted Storage**: Upload files and notes with client-side encryption
- 🔒 **Zero-Knowledge**: Server never has access to your unencrypted data
- 💾 **Cloud Backup**: Encrypted data stored on Cloudflare R2
- 📊 **Storage Dashboard**: Track usage and manage items

### Release Mechanisms
- ⏰ **Time-Lock Releases**: Schedule automatic releases at future dates
- 💓 **Heartbeat Monitoring**: Auto-release if you miss check-ins
- 👥 **Trustee Management**: Designate recipients for encrypted data
- 📧 **Email Notifications**: Trustees receive unlock links (coming soon)

### User Experience
- 🎨 **Clean UI**: Minimal, calm interface with Tailwind CSS
- 🌙 **Dark Mode**: Automatic dark mode support
- 📱 **Responsive**: Works on all devices
- ⚡ **Fast**: Edge-deployed on Cloudflare's global network

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Cloudflare account (for deployment)
- Existing Cloudflare Worker API (vault-api) deployed with R2 bucket

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd vault

# Install dependencies
npm install

# Set up environment variables
cp .env.sample .env.local

# Edit .env.local with your Worker API URL
# NEXT_PUBLIC_WORKER_URL=https://vault-api.yourdomain.workers.dev

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📦 Project Structure

```
vault/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── app/               # Authenticated app routes
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── items/         # Items management
│   │   │   ├── release/       # Release bundles
│   │   │   └── settings/      # Settings pages
│   │   └── unlock/            # Recipient unlock pages
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   └── UnlockGate.tsx    # Authentication wrapper
│   ├── contexts/             # React contexts
│   │   ├── CryptoContext.tsx # Encryption session
│   │   └── ToastContext.tsx  # Notifications
│   ├── lib/                  # Core libraries
│   │   ├── crypto.ts         # WebCrypto utilities
│   │   └── r2-client.ts      # R2 API client
│   └── types/                # TypeScript types
│       └── index.ts
├── public/                   # Static assets
├── package.json
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS config
└── tsconfig.json            # TypeScript config
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file (from `.env.sample`):

```env
NEXT_PUBLIC_WORKER_URL=https://vault-api.yourdomain.workers.dev
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
```

### Cloudflare Worker API

Your Worker API should have these endpoints:

- `GET /health` - Health check
- `GET /r2/list?prefix=` - List objects
- `PUT /r2/:key` - Upload object
- `GET /r2/:key` - Download object
- `DELETE /r2/:key` - Delete object

See `wrangler.toml` for Worker configuration reference.

## 🚢 Deployment

### Deploy to Cloudflare Pages

1. **Install Cloudflare adapter:**
   ```bash
   npm install -D @cloudflare/next-on-pages
   ```

2. **Build for Cloudflare Pages:**
   ```bash
   npm run pages:build
   ```

3. **Deploy via Wrangler:**
   ```bash
   npm run pages:deploy
   ```

4. **Or deploy via Cloudflare Dashboard:**
   - Go to Cloudflare Dashboard → Pages
   - Create new project from Git
   - Set build command: `npm run pages:build`
   - Set build output: `.vercel/output/static`
   - Add environment variable: `NEXT_PUBLIC_WORKER_URL`

### Manual Deployment Steps

```bash
# 1. Build the application
npm run build

# 2. Build for Cloudflare Pages
npm run pages:build

# 3. Deploy to Cloudflare Pages
npx wrangler pages deploy .vercel/output/static --project-name=vault
```

## 🔐 How It Works

### First-Time Setup

1. User visits `/app` and enters a passphrase
2. System generates:
   - Master Key (derived from passphrase + salt)
   - Data Key (random, wrapped with Master Key)
3. Keys stored in-memory only (never persisted unencrypted)

### Adding Items

1. User uploads file or creates note
2. System generates random Item Key
3. Content encrypted with Item Key (AES-GCM)
4. Item Key wrapped with Data Key
5. Encrypted data uploaded to R2
6. Metadata stored locally (localStorage)

### Creating Release Bundles

1. User selects items and trustees
2. Chooses release mode (time-lock or heartbeat)
3. Bundle metadata stored (locally for now)
4. On trigger, trustees receive email with unlock token

### Unlocking Bundles

1. Trustee visits `/unlock/:token` with passphrase
2. System derives key from passphrase
3. Unwraps Data Key, then Item Keys
4. Downloads and decrypts items
5. Displays decrypted content

## 📝 Development Notes

### Current Limitations (MVP)

- **Authentication**: Passphrase-only, no user accounts yet
- **Storage**: Metadata in localStorage (should be server-side)
- **Heartbeat**: Client-side only (needs backend cron)
- **Releases**: Placeholder logic (needs backend automation)
- **Email**: Not implemented (integrate Resend)
- **Key Derivation**: Using PBKDF2 (should upgrade to Argon2id)

### Production TODOs

- [ ] Implement user authentication (Clerk, Auth0, or custom)
- [ ] Move metadata to Neon Postgres
- [ ] Implement backend heartbeat monitoring
- [ ] Set up automated release triggers (Cloudflare Workers Cron)
- [ ] Integrate Resend for email notifications
- [ ] Add Stripe billing for Pro tier
- [ ] Upgrade to Argon2id for key derivation
- [ ] Implement proper access control
- [ ] Add audit logging
- [ ] Set up monitoring (Sentry, etc.)

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type checking
npx tsc --noEmit

# Build test
npm run build
```

## 📚 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Encryption**: WebCrypto API, @noble/hashes
- **Storage**: Cloudflare R2 (via Worker API)
- **Deployment**: Cloudflare Pages
- **Edge Runtime**: Cloudflare Workers

## 🔒 Security Considerations

### Current Implementation

✅ Client-side encryption
✅ Keys never sent to server
✅ AES-256-GCM encryption
✅ Unique IV per encryption
✅ PBKDF2 with 100k iterations

### Improvements Needed

⚠️ Upgrade to Argon2id for key derivation
⚠️ Implement proper key rotation
⚠️ Add rate limiting on unlock attempts
⚠️ Implement secure key backup/recovery
⚠️ Add 2FA for additional security

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please follow security best practices and test thoroughly.

## ⚠️ Disclaimer

This is a prototype/MVP. For production use:
- Conduct security audit
- Implement proper user management
- Add comprehensive error handling
- Set up monitoring and alerts
- Review and improve key management

**Never rely solely on this code for critical data protection without thorough security review.**

## 🆘 Support

For issues or questions, please open a GitHub issue.

---

Built with ❤️ and 🔐 by the Vault team
