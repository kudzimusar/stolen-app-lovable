# 🔧 SQL Execution Options - Choose Your Method

## ✅ Service Key Saved!

Your service key is now saved in `.env.local` for future automated deployments.

---

## 🎯 3 Ways to Execute SQL Migrations

### Option 1: Manual (Fastest for NOW - 60 seconds)

**Best for**: This one-time deployment  
**Time**: 60 seconds  
**Requires**: Just a browser

**Steps**:
1. Open: https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn/sql/new
2. Copy file: `supabase/migrations/20251023000001_stakeholder_admin_system.sql`
3. Paste in SQL Editor
4. Click "RUN"
5. Done! ✅

**Pros**:
- ✅ Fastest right now
- ✅ No installation needed
- ✅ Works 100% of the time
- ✅ Visual confirmation of success

**Cons**:
- ⏰ Manual step each time

---

### Option 2: Install PostgreSQL Client (Best for FUTURE - 5 minutes)

**Best for**: Automated future deployments  
**Time**: 5 minutes one-time setup  
**Requires**: Xcode Command Line Tools + Homebrew

**Steps**:

**A. Install Xcode Command Line Tools** (if not installed):
```bash
xcode-select --install
# Follow the GUI prompts (2-3 minutes)
```

**B. Install PostgreSQL Client**:
```bash
brew install libpq
export PATH="/usr/local/opt/libpq/bin:$PATH"
echo 'export PATH="/usr/local/opt/libpq/bin:$PATH"' >> ~/.zshrc
```

**C. Then run migrations automatically**:
```bash
bash scripts/deploy-via-psql.sh
# Future migrations: Just run this command!
```

**Pros**:
- ✅ Fully automated future deployments
- ✅ Can run scripts anytime
- ✅ Direct PostgreSQL connection
- ✅ Works offline (once installed)

**Cons**:
- ⏰ 5-minute setup time
- 💾 ~50MB disk space

---

### Option 3: Supabase Management API (Experimental)

**Best for**: When psql not available  
**Time**: Instant  
**Requires**: Service key (already set up!)

**Run**:
```bash
node scripts/deploy-via-management-api.cjs
```

**Status**: May work, may not (depends on Supabase API availability)

**Pros**:
- ✅ No installation needed
- ✅ Uses service key we already have
- ✅ Fast if it works

**Cons**:
- ⚠️  May not work (API limitations)
- ⚠️  Requires exec_sql function to exist in database

---

## 💡 My Recommendation

### For RIGHT NOW (This Migration):
**Use Option 1** (Manual - 60 seconds)
- Fastest and guaranteed to work
- Takes literally 60 seconds
- You're done testing in 2 minutes

### For THE FUTURE (Next Migrations):
**Set up Option 2** (Install psql)
- One-time 5-minute setup
- All future migrations are automatic
- Run one command and done

---

## 🚀 Quick Start (Choose Your Path)

### Path A: Fast Deploy Now, Automate Later
```bash
# 1. Deploy manually NOW (60 sec):
#    https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn/sql/new
#    Copy/paste: supabase/migrations/20251023000001_stakeholder_admin_system.sql
#    Click RUN

# 2. Set up automation for FUTURE (5 min):
xcode-select --install  # If not installed
brew install libpq
echo 'export PATH="/usr/local/opt/libpq/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 3. Test automation:
bash scripts/deploy-via-psql.sh
```

### Path B: Quick Manual Only (Always)
```bash
# Every time you need to deploy:
# 1. Open SQL Editor
# 2. Copy/paste SQL file
# 3. Run
# Takes 60 seconds each time
```

---

## ✅ What You Have NOW

**Service Key**: ✅ Saved in `.env.local`  
**Future Ready**: ✅ Yes (once psql is installed)  
**Current Deployment**: ⏳ Pending (use Option 1 manual for now)

---

## 🎯 Your Next Step

**Recommended**: Use Option 1 (manual) RIGHT NOW

1. Open: https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn/sql/new
2. Open file in editor: `supabase/migrations/20251023000001_stakeholder_admin_system.sql`
3. Copy all (Ctrl/Cmd+A, Ctrl/Cmd+C)
4. Paste in SQL Editor
5. Click RUN
6. Tell me "Done!" and I'll guide you through testing

**Then later** (when you have time):
- Install psql (Option 2)
- Future migrations will be automatic

---

**Quick Link**: https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn/sql/new  
**File**: `supabase/migrations/20251023000001_stakeholder_admin_system.sql`  
**Time**: 60 seconds

