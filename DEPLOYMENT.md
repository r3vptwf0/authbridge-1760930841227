# Deployment Checklist

## Pre-Deployment Security Review

### Critical Issues (Must Fix Before Production)

- [ ] **Migrate to Supabase Auth** - Replace plaintext password login
  - [ ] Set up Supabase Auth in project settings
  - [ ] Create server actions for auth (`app/login/actions.ts`)
  - [ ] Update login page to use `supabase.auth.signInWithPassword()`
  - [ ] Store sessions in HTTP-only cookies
  - [ ] Remove custom password checking from `users` table
  
- [ ] **Enable Row Level Security (RLS)**
  - [ ] Enable RLS on all tables
  - [ ] Create policies for each table (see `SQL_MIGRATIONS.md`)
  - [ ] Test RLS policies with different users
  - [ ] Verify no data leaks between users
  
- [ ] **Secure API Routes**
  - [ ] Make `INTERNAL_WEBHOOK_SECRET` required
  - [ ] Add rate limiting to `/api/telegram`
  - [ ] Validate all API inputs
  - [ ] Add CORS policies if needed

### Environment Variables

- [ ] Create production environment variables
- [ ] Generate strong secrets (`openssl rand -base64 32`)
- [ ] Never commit `.env` to version control
- [ ] Set all required vars on hosting platform:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `DATABASE_URL`
  - [ ] `TELEGRAM_BOT_TOKEN` (if using)
  - [ ] `TELEGRAM_CHAT_ID` (if using)
  - [ ] `INTERNAL_WEBHOOK_SECRET` (required)

### Database Setup

- [ ] Run all Prisma migrations
  ```bash
  npx prisma generate
  npx prisma migrate deploy
  ```
- [ ] Run manual SQL migrations (see `SQL_MIGRATIONS.md`)
  - [ ] Add `type` column to `debts`
  - [ ] Add `hour` column to `tasks`
  - [ ] Create `consumptions` table
- [ ] Enable RLS on all tables
- [ ] Create RLS policies
- [ ] Add performance indexes
- [ ] Set up automated backups
- [ ] Verify Supabase project limits

### Code Review

- [ ] Remove all `console.log` statements
- [ ] Remove development comments
- [ ] Check for exposed secrets in code
- [ ] Verify error handling doesn't leak sensitive info
- [ ] Review all API routes for security
- [ ] Check middleware for proper auth gates

### Testing

- [ ] Test all authentication flows
- [ ] Verify RLS policies work correctly
- [ ] Test Telegram integration
- [ ] Check mobile responsiveness
- [ ] Test with empty database (new user flow)
- [ ] Test error scenarios (network failures, etc.)
- [ ] Verify env-check page works
- [ ] Load test critical endpoints

### Performance

- [ ] Run production build locally
  ```bash
  npm run build
  npm start
  ```
- [ ] Check bundle size
- [ ] Test with slow network (throttling)
- [ ] Verify images are optimized
- [ ] Check for unnecessary re-renders
- [ ] Monitor initial page load time

## Deployment Steps

### Option 1: Vercel (Recommended)

1. **Prepare Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Next.js
     - Build Command: `npm run build`
     - Output Directory: `.next`
   
3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env`
   - Select appropriate environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Test deployed application

5. **Configure Custom Domain** (Optional)
   - Go to Project Settings → Domains
   - Add custom domain
   - Update DNS records

### Option 2: Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Initialize**
   ```bash
   railway login
   railway init
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set NEXT_PUBLIC_SUPABASE_URL="your-url"
   railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key"
   # ... add all variables
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### Option 3: Self-Hosted (Docker)

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base
   
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build
   
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   CMD ["node", "server.js"]
   ```

2. **Build and Run**
   ```bash
   docker build -t finance-app .
   docker run -p 3000:3000 --env-file .env finance-app
   ```

## Post-Deployment

### Monitoring

- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up analytics (if needed)
- [ ] Monitor Supabase usage/limits
- [ ] Check API response times
- [ ] Review server logs regularly

### Security

- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Configure security headers
- [ ] Set up Content Security Policy (CSP)
- [ ] Enable CSRF protection
- [ ] Review Supabase security settings
- [ ] Set up automated security scans

### Maintenance

- [ ] Schedule regular backups
- [ ] Set up database maintenance tasks
- [ ] Plan for dependency updates
- [ ] Document deployment process
- [ ] Create rollback plan

## Security Headers (next.config.js)

Add security headers to `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}
```

## Rollback Plan

If deployment fails or issues are discovered:

1. **Vercel:** Use deployment history to rollback
   - Go to Deployments tab
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Git:** Revert to previous commit
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Database:** Restore from backup if schema changed
   - Use Supabase backup/restore feature
   - Or restore from scheduled backup

## Support & Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Railway Documentation](https://docs.railway.app/)

---

**Remember:** Do not deploy to production until all critical security issues are resolved. See [SECURITY.md](./SECURITY.md) for details.
