# User Account Creation Guide

## 🔐 **Authentication System Overview**

The Stolen App has **3 types of user accounts** with different creation processes:

---

## 1. 👤 **Individual Users** (Self-Service Registration)

### **Who**: Regular users who want to register their devices
### **How to Create**: 
- **Self-registration** at `/register`
- **Automatic role assignment**: `individual`
- **Access**: Personal dashboard at `/my-devices`

### **Process**:
1. User visits `/register`
2. Fills out registration form
3. Account created automatically
4. Receives `individual` role
5. Can access personal device management

---

## 2. 🏢 **Stakeholder Users** (Self-Service Registration)

### **Who**: External businesses (retailers, repair shops, insurance, law enforcement, NGOs)
### **How to Create**: 
- **Self-registration** at `/register`
- **Role selection** during registration
- **Automatic role assignment**: Selected role (`retailer`, `repair_shop`, `insurance`, `law_enforcement`, `ngo`)
- **Access**: Stakeholder dashboard

### **Process**:
1. User visits `/register`
2. Selects their business type/role
3. Fills out business information
4. Account created automatically
5. Receives selected stakeholder role
6. Can access stakeholder dashboard

---

## 3. 🏛️ **Department Admin Users** (Super Admin Created)

### **Who**: Internal Stolen App staff members
### **How to Create**: 
- **Super Admin creates** via Admin User Management
- **Manual role assignment** by Super Admin
- **Access**: Department-specific admin dashboards

### **Process**:
1. Super Admin logs into `/admin`
2. Goes to "Users" tab
3. Uses "Admin User Management" section
4. Creates new department admin account
5. Assigns specific department role
6. Sets temporary password
7. New admin receives credentials

---

## 🎯 **Account Creation Methods**

### **Method 1: Self-Service Registration** ✅
**For**: Individual Users + Stakeholder Users
**URL**: `/register`
**Process**: User fills form → Account created automatically
**Roles**: `individual`, `retailer`, `repair_shop`, `insurance`, `law_enforcement`, `ngo`

### **Method 2: Super Admin Creation** ✅
**For**: Department Admin Users
**URL**: `/admin` → Users tab → Admin User Management
**Process**: Super Admin creates → Assigns role → Sets password
**Roles**: `retailer`, `repair_shop`, `insurance`, `law_enforcement`, `ngo`, `super_admin`

---

## 🔧 **Super Admin User Management Features**

### **Create New Department Admin**:
1. **Email**: Set admin email address
2. **Display Name**: Full name for the admin
3. **Department Role**: Select department (Retailer, Repair Shop, Insurance, Law Enforcement, NGO)
4. **Temporary Password**: Set initial password
5. **Create**: Account created with selected role

### **Manage Existing Admins**:
- **View all department admins**
- **Edit admin details**
- **Delete admin accounts**
- **Reset passwords**
- **Monitor login activity**

---

## 📋 **Role-Based Access Summary**

| User Type | Creation Method | Role | Dashboard Access |
|-----------|----------------|------|------------------|
| **Individual Users** | Self-registration | `individual` | `/my-devices` |
| **Retailer Users** | Self-registration | `retailer` | Stakeholder dashboard |
| **Repair Shop Users** | Self-registration | `repair_shop` | Stakeholder dashboard |
| **Insurance Users** | Self-registration | `insurance` | Stakeholder dashboard |
| **Law Enforcement Users** | Self-registration | `law_enforcement` | Stakeholder dashboard |
| **NGO Users** | Self-registration | `ngo` | Stakeholder dashboard |
| **Retailer Dept Admin** | Super Admin creates | `retailer` | `/retailer-admin` |
| **Repair Dept Admin** | Super Admin creates | `repair_shop` | `/repair-shop-admin` |
| **Insurance Dept Admin** | Super Admin creates | `insurance` | `/insurance-admin` |
| **Law Enforcement Dept Admin** | Super Admin creates | `law_enforcement` | `/law-enforcement-admin` |
| **NGO Dept Admin** | Super Admin creates | `ngo` | `/ngo-admin` |
| **Super Admin** | Manual setup | `super_admin` | `/admin` (all access) |

---

## 🚀 **Special Privileges**

### **kudzimusar@gmail.com Account**:
- **Role**: `super_admin`
- **Special Access**: Can access ALL department admin dashboards
- **Login Process**: 
  1. Go to `/admin/login`
  2. Select any department from dropdown
  3. Login with same credentials
  4. Access granted to selected department

---

## 🔒 **Security & Access Control**

### **Row Level Security (RLS)**:
- **Individual users**: See only their own data
- **Stakeholder users**: See only their business data
- **Department admins**: See only their department's data
- **Super admin**: See all data across all departments

### **Authentication Flow**:
1. **Login**: User authenticates with email/password
2. **Role Check**: System checks user role
3. **Redirect**: User redirected to appropriate dashboard
4. **Data Access**: RLS policies enforce data isolation

---

## 📞 **Support & Troubleshooting**

### **For Individual/Stakeholder Users**:
- **Issue**: Can't register
- **Solution**: Check email format, password requirements
- **Contact**: Use main app support

### **For Department Admins**:
- **Issue**: Can't access admin dashboard
- **Solution**: Contact Super Admin to verify account creation
- **Contact**: Super Admin (kudzimusar@gmail.com)

### **For Super Admin**:
- **Issue**: Can't create department admins
- **Solution**: Check Supabase permissions, service role key
- **Contact**: System administrator

---

## 🎯 **Quick Start Guide**

### **To Create a New Department Admin**:
1. Login as Super Admin (`kudzimusar@gmail.com`)
2. Go to `/admin`
3. Click "Users" tab
4. Scroll to "Admin User Management" section
5. Click "Create Admin User"
6. Fill in details:
   - Email: `new.admin@department.com`
   - Display Name: `John Doe`
   - Department Role: Select appropriate department
   - Password: Set secure temporary password
7. Click "Create Admin User"
8. Share credentials with new admin

### **To Test Department Access**:
1. Go to `/admin/login`
2. Select department from dropdown
3. Login with `kudzimusar@gmail.com`
4. Verify access to department dashboard

---

## ✅ **Current Status**

- ✅ **Individual Users**: Can self-register
- ✅ **Stakeholder Users**: Can self-register  
- ✅ **Department Admins**: Super Admin can create
- ✅ **Super Admin Access**: Can access all departments
- ✅ **Role-Based Security**: RLS policies active
- ✅ **Admin User Management**: Available in Super Admin dashboard

**All user account creation methods are now fully functional!** 🎉
