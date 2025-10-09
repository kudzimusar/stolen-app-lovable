# My Devices - Quick Start Guide 🚀

## One-Command Deployment

```bash
# Make script executable (run once)
chmod +x scripts/deploy-my-devices.sh

# Deploy everything
./scripts/deploy-my-devices.sh
```

---

## Manual Deployment (Step by Step)

### 1. Deploy Edge Function
```bash
npx supabase functions deploy my-devices --project-ref lerjhxchglztvhbsdjjn
```

### 2. Seed Test Data

**Option A: Via Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn/sql
2. Copy contents from: `database/sql/seed-my-devices-test-data.sql`
3. Click "Run"

**Option B: Via CLI**
```bash
npx supabase db execute --file database/sql/seed-my-devices-test-data.sql --project-ref lerjhxchglztvhbsdjjn
```

### 3. Start Dev Server
```bash
npm run dev
```

### 4. Test the Page
Navigate to: http://localhost:8081/my-devices

---

## Expected Results ✅

After successful deployment, you should see:

### My Devices Page
- ✅ **3 test devices**:
  1. iPhone 14 Pro (Active, Insured)
  2. MacBook Air M2 (Active, Insurance Expired)
  3. AirPods Pro 2 (Lost/Reported)

### Statistics Cards
- ✅ Total: 3 devices
- ✅ Active: 2
- ✅ Reported: 1
- ✅ Total Value: R37,498
- ✅ Insured: 2

### Blockchain Verification
- ✅ Green "Blockchain Verified" badge on each device
- ✅ Blockchain hash displayed (e.g., `0xabc123...`)
- ✅ Clickable link to Polygon Mumbai explorer
- ✅ Opens: https://mumbai.polygonscan.com/tx/0x...

---

## Quick Test Commands

### Test Edge Function
```bash
# Get auth token from browser console:
# localStorage.getItem('sb-auth-token')

curl -X GET https://lerjhxchglztvhbsdjjn.supabase.co/functions/v1/my-devices \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Verify Database
```sql
-- Run in Supabase SQL Editor
SELECT 
  device_name, 
  serial_number, 
  status, 
  blockchain_hash,
  current_owner_id
FROM devices 
WHERE serial_number IN ('F2LLD123ABC', 'C02YL456DEF', 'GLDM789GHI');
```

### Check User's Devices
```sql
-- Replace USER_ID with your auth.uid()
SELECT * FROM devices WHERE current_owner_id = 'YOUR_USER_ID';
```

---

## Troubleshooting 🔧

### Issue: "No devices found"

**Cause**: Test data not seeded or wrong user

**Fix**:
```sql
-- Check if devices exist
SELECT COUNT(*) FROM devices;

-- If 0, run seed script
-- See: database/sql/seed-my-devices-test-data.sql
```

### Issue: "Edge function not found"

**Cause**: Function not deployed

**Fix**:
```bash
npx supabase functions deploy my-devices --project-ref lerjhxchglztvhbsdjjn
```

### Issue: "401 Unauthorized"

**Cause**: Not logged in or invalid token

**Fix**:
1. Ensure you're logged in
2. Check browser console for auth errors
3. Try logging out and back in

### Issue: Blockchain badge not showing

**Cause**: `blockchain_hash` column missing or null

**Fix**:
```sql
-- Check blockchain_hash column
SELECT device_name, blockchain_hash 
FROM devices 
WHERE blockchain_hash IS NOT NULL;

-- If empty, re-run seed script
```

---

## Testing Checklist ✓

- [ ] Edge function deployed successfully
- [ ] Test data seeded (3 devices)
- [ ] My Devices page loads
- [ ] Shows 3 devices with correct data
- [ ] Statistics cards show correct numbers
- [ ] Blockchain verification badges visible
- [ ] Blockchain explorer links work
- [ ] Search functionality works
- [ ] Filter tabs work (All/Active/Reported)
- [ ] Refresh button works
- [ ] Real-time updates work (try changing device status in DB)

---

## Key Files Created/Modified

### New Files
- ✅ `supabase/functions/my-devices/index.ts` - Edge function API
- ✅ `database/sql/seed-my-devices-test-data.sql` - Test data
- ✅ `scripts/deploy-my-devices.sh` - Deployment script
- ✅ `MY_DEVICES_INTEGRATION_GUIDE.md` - Full documentation
- ✅ `MY_DEVICES_QUICK_START.md` - This file

### Modified Files
- ✅ `src/pages/user/MyDevices.tsx` - Connected to Supabase + Blockchain
- ✅ `vite.config.ts` - Added proxy for my-devices API

---

## API Reference

**Endpoint**: `/api/v1/devices/my-devices`

**Method**: GET

**Auth**: Required (Bearer token)

**Response**:
```json
{
  "success": true,
  "devices": [...],
  "stats": {
    "total": 3,
    "active": 2,
    "reported": 1,
    "totalValue": 37498,
    "insured": 2
  }
}
```

---

## Support

For detailed information, see: **MY_DEVICES_INTEGRATION_GUIDE.md**

---

## Success! 🎉

Once everything is working, you'll have:

- ✅ Real-time device management
- ✅ Blockchain verification (your app's selling point!)
- ✅ Live database synchronization
- ✅ Professional UI with loading states
- ✅ Secure authentication
- ✅ Mobile responsive design

**Your My Devices feature is now production-ready!**

