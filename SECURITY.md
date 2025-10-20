# Security Notes

## Critical Security Issues to Address Before Production

### 1. Authentication System (HIGH PRIORITY)

**Current Issue:** The login system (`app/login/page.tsx`) queries the `users` table with plaintext passwords from the client side:

```typescript
await supabase
  .from('users')
  .select('*')
  .eq('username', username)
  .eq('password', password)  // ⚠️ INSECURE: Plaintext password
  .single()
```

**Problems:**
- Passwords are stored in plaintext in the database
- Password comparison happens client-side
- Requires RLS to be disabled or overly permissive policies
- Vulnerable to timing attacks and credential stuffing

**Recommended Fix:**
Migrate to **Supabase Auth** which provides:
- Built-in password hashing (bcrypt)
- Secure server-side authentication
- Session management with JWTs
- Email verification, password reset, OAuth, etc.

**Migration Steps:**
1. Use Supabase Auth instead of custom `users` table
2. Create server action for sign-in: `app/login/actions.ts`
3. Use `supabase.auth.signInWithPassword({ email, password })`
4. Store session in HTTP-only cookies
5. Enable Row Level Security (RLS) on all tables
6. Update middleware to check auth session

**Example Implementation:** See `docs/AUTH_MIGRATION.md` (to be created)

### 2. Row Level Security (RLS)

**Current Issue:** Database tables likely have RLS disabled or overly permissive policies to allow the plaintext password login.

**Required Actions:**
- Enable RLS on all tables: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- Create policies for authenticated users only
- Ensure data isolation between users

**Example Policy:**
```sql
-- Only allow users to see their own data
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 3. Telegram Endpoint Security

**Current Status:** ✅ Partially secured with optional webhook secret

**Current Implementation:**
- Optional `INTERNAL_WEBHOOK_SECRET` for webhook protection
- Falls back to no auth if secret not set

**Recommended Actions:**
- Make `INTERNAL_WEBHOOK_SECRET` required in production
- Add rate limiting to prevent spam
- Consider using Telegram's built-in webhook verification
- Log all Telegram API calls for audit

### 4. Environment Variables

**Current Status:** ✅ Good validation system in place

**Best Practices:**
- Never commit `.env` file to version control (already in `.gitignore`)
- Use `.env.example` as template (created)
- Mark `DATABASE_URL` as required (updated)
- Rotate secrets regularly

**Production Checklist:**
- [ ] Set all required env vars on hosting platform
- [ ] Generate strong random secrets (use `openssl rand -base64 32`)
- [ ] Enable Supabase RLS
- [ ] Configure Supabase auth settings
- [ ] Set up proper CORS policies

### 5. API Routes

**Telegram Route (`/api/telegram`):**
- ✅ Validates bot token and chat ID exist
- ✅ Optional webhook secret validation
- ⚠️ Should add rate limiting
- ⚠️ Should validate message format/length

**Future API Routes:**
- Always validate input
- Use server-side authentication checks
- Implement rate limiting
- Return appropriate error codes
- Never expose sensitive data in responses

## Additional Security Best Practices

### Client-Side
- Never store sensitive data in localStorage
- Use secure HTTP-only cookies for sessions
- Validate all user input
- Sanitize data before display (XSS prevention)

### Server-Side
- Use parameterized queries (Prisma does this)
- Implement proper error handling (don't leak stack traces)
- Add CSRF protection for mutations
- Use security headers (CSP, X-Frame-Options, etc.)

### Database
- Regular backups
- Principle of least privilege for DB roles
- Enable SSL connections
- Monitor for suspicious queries

## Quick Security Audit Checklist

Before deploying to production:

- [ ] Migrate to Supabase Auth (remove plaintext password login)
- [ ] Enable RLS on all tables with proper policies
- [ ] Set `INTERNAL_WEBHOOK_SECRET` as required
- [ ] Add rate limiting to API routes
- [ ] Review and restrict Supabase RLS policies
- [ ] Enable security headers in `next.config.js`
- [ ] Set up monitoring and alerting
- [ ] Test authentication flows thoroughly
- [ ] Perform security scan (OWASP ZAP, etc.)
- [ ] Review all environment variables

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-best-practices)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Note:** This application is currently in development and should NOT be deployed to production without addressing the critical security issues outlined above.
