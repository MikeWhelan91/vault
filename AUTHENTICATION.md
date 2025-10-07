# Authentication & Encryption Flow

## Updated Authentication Model

The vault now uses **Email + Passphrase** authentication instead of passphrase-only.

### Sign In Flow

1. **User enters email address**
   - Email is stored in `localStorage` for convenience
   - Email is used as the `userId` for organizing encrypted data
   - Email is normalized (lowercase, trimmed)

2. **User enters passphrase**
   - Passphrase is NEVER stored anywhere
   - Used to derive encryption keys via PBKDF2
   - Validated for strength (12+ chars, mixed case, numbers)

3. **Key derivation**
   - Master Key = PBKDF2(passphrase, salt, 100k iterations)
   - Data Key = Random 256-bit key (wrapped with Master Key)
   - Item Keys = Random 256-bit keys per item (wrapped with Data Key)

### Data Organization

```
R2 Bucket Structure:
└── user@email.com/
    ├── item-id-1/
    │   └── 1.bin (encrypted data)
    ├── item-id-2/
    │   └── 1.bin (encrypted data)
    └── ...

LocalStorage:
├── vault_user_email → "user@email.com"
├── vault_wrapped_data_key_user@email.com → hex(iv + wrapped_key)
├── vault_item_key_item-id-1 → hex(iv + wrapped_key)
└── vault_metadata → { userId, items[], ... }
```

### Security Properties

✅ **Zero-Knowledge**: Server never sees plaintext data or passphrase
✅ **Email as Identity**: Makes UX clearer, doesn't compromise security
✅ **Key Hierarchy**: Master → Data → Item keys for flexibility
✅ **Client-Side Only**: All encryption happens in browser
✅ **No Server Auth**: Currently no backend user accounts (MVP)

### Future Enhancements

For production, add:
- Backend user authentication (email + password)
- Email verification
- 2FA/MFA support
- Passphrase recovery flow (with security tradeoffs)
- Account deletion
- Session management with JWT tokens
- Rate limiting on unlock attempts

### User Experience

**First Time:**
1. Enter email: `user@example.com`
2. Create passphrase: `MySecureVault2024!`
3. Vault created, data key generated
4. Email saved for next visit

**Returning User:**
1. Email pre-filled: `user@example.com`
2. Enter passphrase: `MySecureVault2024!`
3. Keys derived, vault unlocked
4. Dashboard shows: "Welcome back, user@example.com"

**Multiple Devices:**
- Same email + passphrase unlocks on any device
- Encrypted data synced via R2
- Wrapped keys stored in localStorage per device
- No cross-device session (each device unlocks independently)

### Why This Approach?

**Email as identifier:**
- ✅ Familiar UX pattern
- ✅ Enables future features (email notifications, sharing)
- ✅ Helps organize data in storage
- ✅ Doesn't compromise zero-knowledge encryption

**Passphrase for encryption:**
- ✅ Never leaves the device
- ✅ Cannot be reset (by design for zero-knowledge)
- ✅ User controls their own security
- ✅ No trust required in server

This gives us the best of both worlds: familiar email-based identity with zero-knowledge encryption security.
