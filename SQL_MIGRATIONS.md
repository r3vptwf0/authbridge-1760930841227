# SQL Migrations Reference

Run these SQL commands in **Supabase SQL Editor** after creating your Prisma schema.

## Required Migrations

### 1. Add Debt Type Column
Allows tracking debts "to others" (you owe) vs "to me" (they owe you).

```sql
ALTER TABLE debts ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'to_others';
```

### 2. Add Task Hour Column
Allows tasks to have an optional time/hour field.

```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS hour TEXT;
```

### 3. Create Consumptions Table
Tracks stock consumption history (personal use, not sales).

```sql
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

-- Enable Row Level Security
ALTER TABLE consumptions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own consumptions
CREATE POLICY "Users can view own consumptions" 
  ON consumptions FOR SELECT 
  USING (true);

-- Allow users to create consumptions
CREATE POLICY "Users can create own consumptions" 
  ON consumptions FOR INSERT 
  WITH CHECK (true);
```

## Row Level Security (RLS) Setup

⚠️ **Important:** After migrating to Supabase Auth, enable RLS on all tables.

### Enable RLS on All Tables

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumptions ENABLE ROW LEVEL SECURITY;
```

### Example RLS Policies (After Supabase Auth Migration)

**Expenses:**
```sql
-- Users can only see their own expenses
CREATE POLICY "Users can view own expenses" 
  ON expenses FOR SELECT 
  USING (auth.uid()::text = user_id);

-- Users can only insert their own expenses
CREATE POLICY "Users can insert own expenses" 
  ON expenses FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- Users can only update their own expenses
CREATE POLICY "Users can update own expenses" 
  ON expenses FOR UPDATE 
  USING (auth.uid()::text = user_id);

-- Users can only delete their own expenses
CREATE POLICY "Users can delete own expenses" 
  ON expenses FOR DELETE 
  USING (auth.uid()::text = user_id);
```

**Incomes:**
```sql
CREATE POLICY "Users can view own incomes" 
  ON incomes FOR SELECT 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own incomes" 
  ON incomes FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own incomes" 
  ON incomes FOR UPDATE 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own incomes" 
  ON incomes FOR DELETE 
  USING (auth.uid()::text = user_id);
```

**Products:**
```sql
CREATE POLICY "Users can view own products" 
  ON products FOR SELECT 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own products" 
  ON products FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own products" 
  ON products FOR UPDATE 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own products" 
  ON products FOR DELETE 
  USING (auth.uid()::text = user_id);
```

**Debts:**
```sql
CREATE POLICY "Users can view own debts" 
  ON debts FOR SELECT 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own debts" 
  ON debts FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own debts" 
  ON debts FOR UPDATE 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own debts" 
  ON debts FOR DELETE 
  USING (auth.uid()::text = user_id);
```

**Work Hours:**
```sql
CREATE POLICY "Users can view own work_hours" 
  ON work_hours FOR SELECT 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own work_hours" 
  ON work_hours FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own work_hours" 
  ON work_hours FOR UPDATE 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own work_hours" 
  ON work_hours FOR DELETE 
  USING (auth.uid()::text = user_id);
```

**Calendar Events:**
```sql
CREATE POLICY "Users can view own calendar_events" 
  ON calendar_events FOR SELECT 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own calendar_events" 
  ON calendar_events FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own calendar_events" 
  ON calendar_events FOR UPDATE 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own calendar_events" 
  ON calendar_events FOR DELETE 
  USING (auth.uid()::text = user_id);
```

**Tasks:**
```sql
CREATE POLICY "Users can view own tasks" 
  ON tasks FOR SELECT 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own tasks" 
  ON tasks FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own tasks" 
  ON tasks FOR UPDATE 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own tasks" 
  ON tasks FOR DELETE 
  USING (auth.uid()::text = user_id);
```

**Consumptions:**
```sql
CREATE POLICY "Users can view own consumptions" 
  ON consumptions FOR SELECT 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own consumptions" 
  ON consumptions FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own consumptions" 
  ON consumptions FOR UPDATE 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own consumptions" 
  ON consumptions FOR DELETE 
  USING (auth.uid()::text = user_id);
```

## Indexes for Performance

Add indexes for frequently queried columns:

```sql
-- Expenses indexes
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(date);
CREATE INDEX IF NOT EXISTS expenses_category_idx ON expenses(category);

-- Incomes indexes
CREATE INDEX IF NOT EXISTS incomes_user_id_idx ON incomes(user_id);
CREATE INDEX IF NOT EXISTS incomes_date_idx ON incomes(date);
CREATE INDEX IF NOT EXISTS incomes_category_idx ON incomes(category);

-- Products indexes
CREATE INDEX IF NOT EXISTS products_user_id_idx ON products(user_id);

-- Debts indexes
CREATE INDEX IF NOT EXISTS debts_user_id_idx ON debts(user_id);
CREATE INDEX IF NOT EXISTS debts_status_idx ON debts(status);
CREATE INDEX IF NOT EXISTS debts_type_idx ON debts(type);

-- Work hours indexes
CREATE INDEX IF NOT EXISTS work_hours_user_id_idx ON work_hours(user_id);
CREATE INDEX IF NOT EXISTS work_hours_clock_in_idx ON work_hours(clock_in);

-- Calendar events indexes
CREATE INDEX IF NOT EXISTS calendar_events_user_id_idx ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS calendar_events_date_idx ON calendar_events(date);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_date_idx ON tasks(date);
CREATE INDEX IF NOT EXISTS tasks_completed_idx ON tasks(completed);

-- Consumptions indexes
CREATE INDEX IF NOT EXISTS consumptions_user_id_idx ON consumptions(user_id);
CREATE INDEX IF NOT EXISTS consumptions_product_id_idx ON consumptions(product_id);
CREATE INDEX IF NOT EXISTS consumptions_date_idx ON consumptions(date);
```

## Verification

After running migrations, verify with:

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('debts', 'tasks', 'consumptions');

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- List all policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Notes

- All migrations use `IF NOT EXISTS` to be idempotent (safe to run multiple times)
- RLS policies shown are for **after Supabase Auth migration** (replace `user_id` foreign keys with `auth.uid()`)
- Currently the app uses a custom `users` table with plaintext passwords - this needs migration
- See [SECURITY.md](./SECURITY.md) for authentication migration guide
