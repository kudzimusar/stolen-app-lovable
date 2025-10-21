# 🚀 ADMIN PORTAL SETUP GUIDE

## Quick Setup Instructions

### 1. Run Database Migrations

Execute the SQL script to set up all admin functions and views:

```bash
# Navigate to project directory
cd /Users/shadreckmusarurwa/Project\ AI/stolen-app-lovable

# Run the SQL script via Supabase CLI
supabase db execute -f database/sql/admin-dashboard-data-integration.sql
```

Or manually via Supabase Dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to SQL Editor
4. Copy and paste the contents of `database/sql/admin-dashboard-data-integration.sql`
5. Click "Run"

### 2. Verify Database Functions

Test that all functions are working:

```sql
-- Test admin dashboard stats
SELECT get_admin_dashboard_stats();

-- Test recent activity (last 10 items)
SELECT get_admin_recent_activity(10);

-- Test pending reports
SELECT get_admin_pending_reports();

-- Check if user is admin (replace with actual UUID)
SELECT is_admin_user('your-user-uuid-here');
```

### 3. Create Super Admin User

If you don't have an admin user yet, run:

```sql
-- Create admin user entry
INSERT INTO admin_users (user_id, role, is_active, permissions)
VALUES (
  'your-user-uuid-here',
  'super_admin',
  true,
  jsonb_build_array(
    'admin:full',
    'admin:overview',
    'admin:users',
    'admin:lost-found',
    'admin:marketplace',
    'admin:stakeholders',
    'admin:financial',
    'admin:security',
    'admin:settings'
  )
);
```

### 4. Access Admin Dashboard

Navigate to the admin dashboard:

```
http://localhost:5173/admin/dashboard
```

Or in production:
```
https://your-domain.com/admin/dashboard
```

## 📱 Mobile Testing Checklist

### iPhone (iOS)
- [ ] Safari - Portrait mode
- [ ] Safari - Landscape mode
- [ ] Safari - Dark mode
- [ ] Chrome iOS

### Android
- [ ] Chrome - Portrait mode
- [ ] Chrome - Landscape mode
- [ ] Samsung Internet
- [ ] Firefox Mobile

### Tablet
- [ ] iPad (Safari)
- [ ] Android Tablet (Chrome)
- [ ] Responsive mode in Chrome DevTools

## 🧪 Testing Scenarios

### 1. Dashboard Overview
- [ ] Stats cards display correctly
- [ ] Navigation grid is touchable
- [ ] Quick actions are accessible
- [ ] Recent activity loads

### 2. Lost & Found Panel
- [ ] Stats cards show real data
- [ ] Search functionality works
- [ ] Filter by status works
- [ ] Tabs scroll horizontally on mobile
- [ ] Approve/Reject actions work
- [ ] Modal opens and closes

### 3. Marketplace Panel
- [ ] Listings load correctly
- [ ] Table scrolls horizontally
- [ ] Filter and search work
- [ ] Approve/Reject functionality
- [ ] Stats update after actions

### 4. Users Panel
- [ ] User list loads
- [ ] Search users works
- [ ] Filter by role works
- [ ] User details modal opens
- [ ] Verify user action works

## 🔍 Debugging

### Check Database Connection

```javascript
// In browser console
const { data, error } = await supabase
  .rpc('get_admin_dashboard_stats');
  
console.log('Stats:', data);
console.log('Error:', error);
```

### Check Edge Functions

```bash
# Test edge function
curl -i --location --request POST 'https://your-project-ref.supabase.co/functions/v1/admin-dashboard-stats' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'
```

### Check RLS Policies

```sql
-- Check if current user has admin access
SELECT is_admin_user(auth.uid());

-- Check admin_users table
SELECT * FROM admin_users WHERE user_id = auth.uid();
```

## 🐛 Common Issues

### Issue: "RPC function not found"
**Solution**: Run the SQL migration script again

### Issue: "Permission denied"
**Solution**: Check that you're logged in as an admin user

### Issue: "Stats showing 0"
**Solution**: 
1. Check that tables have data
2. Verify table names match schema
3. Check RLS policies

### Issue: "Mobile layout broken"
**Solution**:
1. Clear browser cache
2. Hard refresh (Cmd+Shift+R)
3. Check Tailwind CSS is loaded

## 📊 Data Flow

```
User Request
    ↓
Admin Dashboard Component
    ↓
Fetch from Supabase
    ↓
RPC Functions (get_admin_dashboard_stats, etc.)
    ↓
Database Views (admin_*_view)
    ↓
Base Tables (users, devices, lost_found_reports, etc.)
    ↓
Return JSON Response
    ↓
Update UI State
    ↓
Render Components
```

## 🎯 Performance Optimization

### Enable Database Indexes

```sql
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lost_found_status ON lost_found_reports(status);
CREATE INDEX IF NOT EXISTS idx_lost_found_user ON lost_found_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_devices_owner ON devices(current_owner_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
```

### Enable Connection Pooling

In Supabase dashboard:
1. Settings → Database
2. Enable "Connection Pooling"
3. Use pooled connection string in production

## 🔐 Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Admin users verified before granting access
- [ ] All admin actions logged to `admin_activity_log`
- [ ] Sensitive data properly masked
- [ ] HTTPS enforced in production
- [ ] API keys not exposed in frontend
- [ ] CORS properly configured

## 📈 Monitoring

### Key Metrics to Track

1. **Page Load Time**
   - Target: < 2 seconds on 4G
   - Monitor with Lighthouse

2. **Database Query Performance**
   - Check slow queries in Supabase dashboard
   - Optimize with indexes

3. **Error Rate**
   - Monitor with Sentry or similar
   - Target: < 1% error rate

4. **Mobile Usage**
   - Track with Google Analytics
   - Target: 70%+ mobile usage

## 🎓 Training Materials

### For Admins

1. **Dashboard Overview**
   - Navigate using top navigation cards
   - Each card represents a module
   - Stats update in real-time

2. **Lost & Found Management**
   - Review pending reports in "Contact" tab
   - Approve legitimate claims
   - Reject fraudulent claims
   - Monitor reunited devices

3. **Marketplace Management**
   - Review pending listings
   - Verify device authenticity
   - Approve/reject listings
   - Monitor sales

4. **User Management**
   - Search and filter users
   - Verify user accounts
   - View user activity
   - Manage permissions

## 🆘 Support

### Getting Help

1. **Documentation**: Check ADMIN_MOBILE_FIRST_IMPLEMENTATION.md
2. **Database Schema**: See Supabase schema documentation
3. **Issue Tracker**: Report bugs on GitHub
4. **Team Chat**: Contact development team

### Emergency Contacts

- **Technical Lead**: [Contact info]
- **Database Admin**: [Contact info]
- **DevOps**: [Contact info]

## ✅ Production Deployment Checklist

- [ ] All SQL migrations applied
- [ ] Database functions tested
- [ ] RLS policies verified
- [ ] Admin users created
- [ ] Edge functions deployed
- [ ] Environment variables set
- [ ] HTTPS configured
- [ ] CORS configured
- [ ] Monitoring enabled
- [ ] Backup system verified
- [ ] Performance tested
- [ ] Mobile responsiveness verified
- [ ] Cross-browser tested
- [ ] Security audit completed
- [ ] Documentation updated

---

## 🎉 You're Ready!

Your admin portal is now fully configured and ready for use. Access it at `/admin/dashboard` and start managing your platform!

For detailed implementation notes, see: `ADMIN_MOBILE_FIRST_IMPLEMENTATION.md`

