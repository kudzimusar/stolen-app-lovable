import React from 'react'
import { useLocation } from 'react-router-dom'
import { LostFoundNotificationCenter } from '@/components/user/LostFoundNotificationCenter'
import { DeviceNotificationCenter } from '@/components/device/DeviceNotificationCenter'
import { MarketplaceNotificationCenter } from '@/components/marketplace/MarketplaceNotificationCenter'
import { InsuranceNotificationCenter } from '@/components/insurance/InsuranceNotificationCenter'
import { PaymentNotificationCenter } from '@/components/payment/PaymentNotificationCenter'
import { RepairNotificationCenter } from '@/components/repair/RepairNotificationCenter'
import { SecurityNotificationCenter } from '@/components/security/SecurityNotificationCenter'
import { AdminNotificationCenter } from '@/components/admin/AdminNotificationCenter'
import { CommunityNotificationCenter } from '@/components/community/CommunityNotificationCenter'
import { HotDealsNotificationCenter } from '@/components/hot-deals/HotDealsNotificationCenter'
import { LawEnforcementNotificationCenter } from '@/components/law-enforcement/LawEnforcementNotificationCenter'
import { NGONotificationCenter } from '@/components/ngo/NGONotificationCenter'
import { RetailerNotificationCenter } from '@/components/retailer/RetailerNotificationCenter'
import { RepairShopNotificationCenter } from '@/components/repair-shop/RepairShopNotificationCenter'
import { UserProfileNotificationCenter } from '@/components/user-profile/UserProfileNotificationCenter'
import { SupportNotificationCenter } from '@/components/support/SupportNotificationCenter'

export const SmartNotificationCenter = () => {
  const location = useLocation()
  const pathname = location.pathname

  // Route-based notification center selection
  const getNotificationCenter = () => {
    // Device Management
    if (pathname.includes('/device') || pathname.includes('/my-devices') || pathname.includes('/device-transfer')) {
      return <DeviceNotificationCenter />
    }
    
    // Marketplace
    if (pathname.includes('/marketplace') || pathname.includes('/hot-deals')) {
      return <MarketplaceNotificationCenter />
    }
    
    // Insurance
    if (pathname.includes('/insurance') || pathname.includes('/claims')) {
      return <InsuranceNotificationCenter />
    }
    
    // Payment/Wallet
    if (pathname.includes('/wallet') || pathname.includes('/payment') || pathname.includes('/s-pay')) {
      return <PaymentNotificationCenter />
    }
    
    // Repair Services
    if (pathname.includes('/repair') || pathname.includes('/booking')) {
      return <RepairNotificationCenter />
    }
    
    // Security
    if (pathname.includes('/security') || pathname.includes('/verification')) {
      return <SecurityNotificationCenter />
    }
    
    // Admin
    if (pathname.includes('/admin') || pathname.includes('/super-admin')) {
      return <AdminNotificationCenter />
    }
    
    // Community
    if (pathname.includes('/community') || pathname.includes('/rewards')) {
      return <CommunityNotificationCenter />
    }
    
    // Hot Deals
    if (pathname.includes('/hot-deals') || pathname.includes('/flash-sale')) {
      return <HotDealsNotificationCenter />
    }
    
    // Law Enforcement
    if (pathname.includes('/law-enforcement') || pathname.includes('/police')) {
      return <LawEnforcementNotificationCenter />
    }
    
    // NGO
    if (pathname.includes('/ngo') || pathname.includes('/charity')) {
      return <NGONotificationCenter />
    }
    
    // Retailer
    if (pathname.includes('/retailer') || pathname.includes('/vendor')) {
      return <RetailerNotificationCenter />
    }
    
    // Repair Shop
    if (pathname.includes('/repair-shop') || pathname.includes('/repairer')) {
      return <RepairShopNotificationCenter />
    }
    
    // User Profile
    if (pathname.includes('/profile') || pathname.includes('/settings')) {
      return <UserProfileNotificationCenter />
    }
    
    // Support
    if (pathname.includes('/support') || pathname.includes('/help')) {
      return <SupportNotificationCenter />
    }
    
    // Lost & Found (default for dashboard and other pages)
    if (pathname.includes('/lost-found') || pathname.includes('/dashboard') || pathname === '/') {
      return <LostFoundNotificationCenter />
    }
    
    // Default to Lost & Found for unknown routes
    return <LostFoundNotificationCenter />
  }

  return getNotificationCenter()
}
