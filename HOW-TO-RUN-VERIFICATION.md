# HOW TO RUN STAKEHOLDER VERIFICATION SCRIPTS

**IMPORTANT**: Different scripts run in different places!

---

## 📋 SCRIPT TYPES

### 1. SQL Script (Runs in Supabase)
- **File**: `database/sql/verify-stakeholder-system-supabase.sql`
- **Where**: Supabase SQL Editor
- **Purpose**: Check database components

### 2. JavaScript Scripts (Run in Terminal)
- **Files**: 
  - `scripts/verify-edge-functions.js`
  - `scripts/test-stakeholder-api.js`
- **Where**: Your computer's terminal/command line
- **Purpose**: Check edge functions and API connections

---

## ✅ STEP 1: DATABASE VERIFICATION

### Using Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy and Paste Script**
   - Open: `database/sql/verify-stakeholder-system-supabase.sql`
   - Copy ALL contents
   - Paste into SQL Editor

4. **Run the Script**
   - Click "Run" button (or press Ctrl+Enter / Cmd+Enter)
   - Wait for results

5. **Check Results**
   - Look for ✅ (exists) or ❌ (missing)
   - Check "FINAL SUMMARY" at the bottom

### Expected Output

```
✅ Tables: 6/6
✅ Views: 1/1
✅ Functions: 6/6
✅ RLS: 6/6
✅ Triggers: 5/5
✅ ALL COMPONENTS READY
```

### If Components Are Missing

```sql
-- Run these scripts in Supabase SQL Editor:
1. database/sql/stakeholder-management-system.sql
2. database/sql/admin-stakeholders-view.sql
```

---

## ✅ STEP 2: EDGE FUNCTIONS VERIFICATION

### Run in Terminal (Command Line)

1. **Open Terminal**
   - Mac/Linux: Open Terminal app
   - Windows: Open Command Prompt or PowerShell

2. **Navigate to Project Directory**
   ```bash
   cd "/Users/shadreckmusarurwa/Project AI/stolen-app-lovable"
   ```

3. **Run the Script**
   ```bash
   node scripts/verify-edge-functions.js
   ```

### Expected Output

```
✅ admin-stakeholders-list: DEPLOYED
✅ admin-stakeholders-update: DEPLOYED
✅ ALL EDGE FUNCTIONS ARE DEPLOYED
```

### If Functions Are Missing

```bash
cd supabase
supabase functions deploy admin-stakeholders-list
supabase functions deploy admin-stakeholders-update
```

---

## ✅ STEP 3: API CONNECTION TEST

### Run in Terminal (Requires Dev Server)

1. **Start Development Server** (Terminal 1)
   ```bash
   npm run dev
   ```
   Keep this running!

2. **Open New Terminal** (Terminal 2)
   ```bash
   cd "/Users/shadreckmusarurwa/Project AI/stolen-app-lovable"
   node scripts/test-stakeholder-api.js
   ```

### Expected Output

```
✅ Vite dev server is running
✅ API request successful (get_stats)
✅ API request successful (list_stakeholders)
✅ Vite proxy routes configured correctly
✅ ALL API CONNECTIONS ARE WORKING
```

---

## 🚫 COMMON ERRORS

### Error: "syntax error at or near \\set"

**Problem**: You're running a psql-specific script in Supabase SQL Editor

**Solution**: Use `verify-stakeholder-system-supabase.sql` instead:
```
✗ Don't use: verify-stakeholder-system.sql (has psql commands)
✓ Use instead: verify-stakeholder-system-supabase.sql (pure SQL)
```

### Error: "syntax error at or near #!/"

**Problem**: You're trying to run a JavaScript file in SQL Editor

**Solution**: Run JavaScript files in your terminal, not in SQL Editor:
```bash
# In your terminal (NOT in SQL Editor):
node scripts/verify-edge-functions.js
```

### Error: "Cannot find module"

**Problem**: Running script from wrong directory

**Solution**: Navigate to project root first:
```bash
cd "/Users/shadreckmusarurwa/Project AI/stolen-app-lovable"
node scripts/verify-edge-functions.js
```

### Error: "ECONNREFUSED"

**Problem**: Dev server is not running (for API test)

**Solution**: Start dev server first:
```bash
# Terminal 1:
npm run dev

# Terminal 2:
node scripts/test-stakeholder-api.js
```

---

## 📝 QUICK REFERENCE

### Where to Run Each Script

| Script | Run Where | Command |
|--------|-----------|---------|
| `verify-stakeholder-system-supabase.sql` | Supabase SQL Editor | Copy & paste, click Run |
| `verify-edge-functions.js` | Terminal | `node scripts/verify-edge-functions.js` |
| `test-stakeholder-api.js` | Terminal | `node scripts/test-stakeholder-api.js` |

### Verification Order

1. ✅ Database → Run SQL script in Supabase
2. ✅ Edge Functions → Run JS script in terminal
3. ✅ API Connections → Run JS script in terminal (with dev server)
4. ✅ Manual Test → Open browser, test UI

---

## 🎯 COMPLETE VERIFICATION WORKFLOW

```bash
# STEP 1: Database (Supabase SQL Editor)
# → Open Supabase
# → SQL Editor
# → Copy/paste: database/sql/verify-stakeholder-system-supabase.sql
# → Run

# STEP 2: Edge Functions (Terminal)
cd "/Users/shadreckmusarurwa/Project AI/stolen-app-lovable"
node scripts/verify-edge-functions.js

# STEP 3: API Connections (Terminal)
# Terminal 1:
npm run dev

# Terminal 2 (new terminal):
cd "/Users/shadreckmusarurwa/Project AI/stolen-app-lovable"
node scripts/test-stakeholder-api.js

# STEP 4: Browser Test
# → Open: http://localhost:8080/admin/dashboard
# → Click: Stakeholders tab
# → Check: Everything loads and works
```

---

## ❓ STILL HAVING ISSUES?

1. **Check you're using the right script**:
   - SQL scripts → Supabase SQL Editor
   - JavaScript scripts → Terminal

2. **Check you're in the right directory**:
   ```bash
   pwd
   # Should show: /Users/shadreckmusarurwa/Project AI/stolen-app-lovable
   ```

3. **Check Node.js is installed**:
   ```bash
   node --version
   # Should show: v18.x.x or higher
   ```

4. **Read the full documentation**:
   - `STAKEHOLDER-VERIFICATION-REPORT.md` - Complete guide
   - `STAKEHOLDER-QUICK-VERIFICATION.md` - Quick start
   - `STAKEHOLDER-VERIFICATION-SUMMARY.md` - Overview

---

**Last Updated**: October 21, 2025  
**Files Created**: Supabase-compatible SQL script  
**Status**: Ready to run

