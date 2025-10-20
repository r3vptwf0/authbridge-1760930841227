# Personal Finance & Productivity Platform

A modern web application built with Next.js 14 for managing your finances, inventory, debts, work hours, and calendar—all in one elegant, monochrome interface.

## Features

- 💰 **Wallet Management** - Track income and expenses with categorization
- 📦 **Stock Management** - Manage product inventory with cost/price tracking and consumption history
- 💳 **Debt Tracking** - Monitor debts to others and money owed to you
- ⏰ **Work Hours** - Clock in/out and track work sessions
- 📅 **Calendar & Tasks** - Organize events and daily tasks with Telegram reminders
- 📊 **Dashboard** - Comprehensive overview of all your data

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma
- **Backend:** Supabase (Database + Auth)
- **Integrations:** Telegram Bot API

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Supabase account ([sign up free](https://supabase.com))
- (Optional) Telegram account for reminders

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <project-folder>
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Fill in the required values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
   
   # Optional: Telegram integration
   TELEGRAM_BOT_TOKEN=your-bot-token
   TELEGRAM_CHAT_ID=your-chat-id
   INTERNAL_WEBHOOK_SECRET=your-random-secret
   ```

   **Where to find Supabase credentials:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to **Settings → API**
   - Copy `Project URL` and `anon public` key
   - For `DATABASE_URL`: **Settings → Database → Connection string**

4. **Set up the database**
   
   Run Prisma migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

   Or run SQL migrations manually (see `SQL_MIGRATIONS.md`)

5. **Create initial user**
   
   Use the Supabase SQL Editor or run:
   ```bash
   npx ts-node scripts/create-user.ts
   ```

   ⚠️ **Security Note:** The current authentication uses plaintext passwords. See [SECURITY.md](./SECURITY.md) for migration guide to Supabase Auth.

6. **Run the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Environment Variable Validation

Visit `/env-check` to validate all required environment variables are set correctly.

## Database Schema

Key models:
- **User** - User accounts
- **Expense** - Expense transactions
- **Income** - Income transactions
- **Product** - Stock inventory items
- **Consumption** - Stock consumption history
- **Debt** - Money owed (to others or owed to you)
- **WorkHours** - Clock in/out records
- **CalendarEvent** - Calendar events with reminders
- **Task** - Daily tasks with completion tracking

See `prisma/schema.prisma` for full schema.

## SQL Migrations

Run these SQL commands in Supabase SQL Editor:

```sql
-- Add debt type column
ALTER TABLE debts ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'to_others';

-- Add task hour column
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS hour TEXT;

-- Create consumptions table
CREATE TABLE IF NOT EXISTS consumptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  product_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  cost_value DOUBLE PRECISION NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE consumptions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view own consumptions" ON consumptions FOR SELECT USING (true);
CREATE POLICY "Users can create own consumptions" ON consumptions FOR INSERT WITH CHECK (true);
```

## Telegram Integration (Optional)

1. Create a bot:
   - Message [@BotFather](https://t.me/BotFather) on Telegram
   - Send `/newbot` and follow instructions
   - Copy the bot token

2. Get your Chat ID:
   - Message [@userinfobot](https://t.me/userinfobot)
   - Copy your ID

3. Add to `.env`:
   ```env
   TELEGRAM_BOT_TOKEN=1234567890:ABCdef...
   TELEGRAM_CHAT_ID=123456789
   ```

4. Features:
   - Send calendar event reminders
   - Send daily tasks to Telegram

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── telegram/      # Telegram bot endpoint
│   ├── calendar/          # Calendar & tasks page
│   ├── dashboard/         # Main dashboard
│   ├── debts/            # Debt management
│   ├── env-check/        # Environment validation
│   ├── login/            # Login page
│   ├── stock/            # Stock management
│   ├── wallet/           # Income/Expense tracking
│   ├── work-hours/       # Time tracking
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── env-config.ts     # Environment variable definitions
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
├── middleware.ts          # Route middleware (env check)
├── .env.example          # Environment template
└── SECURITY.md           # Security documentation
```

## Development

### Build
```bash
npm run build
```

### Lint & Type Check
```bash
npm run lint
npx tsc --noEmit
```

### Prisma Commands
```bash
npx prisma studio        # Open Prisma Studio (DB GUI)
npx prisma migrate dev   # Create and apply migration
npx prisma generate      # Generate Prisma Client
```

## Security Considerations

⚠️ **This application is in development and has security issues that must be addressed before production:**

1. **Authentication uses plaintext passwords** - Must migrate to Supabase Auth
2. **Row Level Security (RLS) should be enabled** on all tables
3. **Webhook secret should be required** for Telegram endpoint

See [SECURITY.md](./SECURITY.md) for detailed security review and migration guide.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Works on any platform supporting Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

Make sure to:
- Set all environment variables
- Run database migrations
- Configure custom domain (optional)

## Contributing

This is a personal project template. Feel free to fork and customize for your needs.

## License

MIT

---

**Note:** Remember to review [SECURITY.md](./SECURITY.md) before deploying to production.
