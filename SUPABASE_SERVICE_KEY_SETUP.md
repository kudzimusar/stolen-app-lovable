# Supabase Service Key Setup for Automated Deployments

## 🎯 Purpose

Enable automated database migrations and function deployments without manual steps.

---

## 🔑 What You Need

### Service Role Key (Admin Access)

The **Service Role Key** has full admin permissions and can:
- ✅ Execute DDL statements (CREATE TABLE, CREATE VIEW, etc.)
- ✅ Modify RLS policies
- ✅ Create/update functions
- ✅ Deploy migrations automatically
- ✅ Bypass RLS for admin operations

---

## 📍 Where to Find Your Service Role Key

### Step 1: Go to Supabase Dashboard
```
https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn/settings/api
```

### Step 2: Copy the Service Role Key
Look for: **"service_role" key** (NOT the anon key)

**Important**: This key is SECRET - it has full admin access!

It looks like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcmpoeGNoZ2x6dHZoYnNkampuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYzMDI5MiwiZXhwIjoyMDY5MjA2MjkyfQ.XXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 🔒 How to Provide It Securely

### Option 1: Environment Variable (Recommended)

Create a `.env.local` file in your project root:

```bash
# /Users/shadreckmusarurwa/Project AI/stolen-app-lovable/.env.local
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Then add to `.gitignore` (if not already):
```bash
echo ".env.local" >> .gitignore
```

### Option 2: Supabase CLI Configuration

The key might already be stored in:
```
~/.supabase/config.toml
```

Or set it via CLI:
```bash
npx supabase secrets set SERVICE_ROLE_KEY=your_key_here
```

### Option 3: Direct in Chat (Temporary)

You can paste it directly in our conversation - I'll:
1. Use it for this deployment
2. Store it in .env.local
3. Never log or expose it
4. You can rotate the key afterwards if concerned

---

## 🚀 What This Enables

Once the service key is configured:

### Automated Migrations
```bash
# I can run this for you automatically:
node scripts/deploy-migrations-with-service-key.js

# Instead of manual SQL Editor copy/paste
```

### Automated Function Deployments
```bash
# Already working (uses different auth):
npx supabase functions deploy function-name
```

### Automated RLS Policy Updates
```bash
# I can execute these automatically:
node scripts/update-rls-policies.js
```

### Automated Database Seeds
```bash
# I can seed test data automatically:
node scripts/seed-database.js
```

---

## 🛡️ Security Best Practices

### DO:
- ✅ Store in `.env.local` (gitignored)
- ✅ Use environment variables
- ✅ Rotate key periodically
- ✅ Restrict access to key
- ✅ Use only for deployments

### DON'T:
- ❌ Commit to git
- ❌ Share publicly
- ❌ Use in client-side code
- ❌ Hardcode in files
- ❌ Log or print to console

---

## 📝 Setup Instructions

### Quick Setup (30 seconds)

1. **Get Service Key**:
   - Go to: https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn/settings/api
   - Click "Reveal" next to "service_role"
   - Copy the key

2. **Create .env.local**:
   ```bash
   cd "/Users/shadreckmusarurwa/Project AI/stolen-app-lovable"
   nano .env.local
   ```

3. **Paste This**:
   ```
   SUPABASE_SERVICE_ROLE_KEY=paste_your_service_key_here
   ```

4. **Save**: Ctrl+O, Enter, Ctrl+X

5. **Done!** Future deployments will be automatic.

---

## 🧪 Test the Setup

Once configured, I can test it:

```javascript
// This will now work automatically:
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Can now execute DDL:
await supabase.rpc('exec_sql', { sql: 'CREATE TABLE test...' });
```

---

## 🎯 For This Current Deployment

Since we don't have the service key yet, here's the **2-minute manual process**:

### Quick Manual Deploy (Right Now)

1. **Open Supabase SQL Editor**:
   ```
   https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn/sql/new
   ```

2. **Copy This File**:
   ```
   supabase/migrations/20251023000001_stakeholder_admin_system.sql
   ```

3. **Paste and Run**: Click the green "RUN" button

4. **Done!** Takes 10 seconds.

---

## 💡 Future Workflow

### With Service Key (Automated):
```bash
# You say: "Deploy the migration"
# I run: Automatically executes SQL via service key
# Result: ✅ Done in 5 seconds
```

### Without Service Key (Manual):
```bash
# I say: "Please copy this file to SQL Editor..."
# You: Open Supabase, copy/paste, run
# Result: ✅ Done in 2 minutes
```

---

## 📞 What to Do Now

**Option 1** (Future automated deployments):
- Provide the service_role key
- I'll set it up in .env.local
- Future deployments will be automatic

**Option 2** (Manual for now):
- Follow the "Quick Manual Deploy" above
- Takes 2 minutes
- We can set up automation later

Your choice! Both work perfectly.

---

**Service Role Key Location**: 
https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn/settings/api

**This Migration File**: 
`supabase/migrations/20251023000001_stakeholder_admin_system.sql`

**Next**: Choose Option 1 or 2 above!

