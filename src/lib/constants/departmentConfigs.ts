import {
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  Building2,
  DollarSign,
  Shield,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Activity,
  Bell,
  Zap,
  Store,
  Wrench,
  Scale,
  Heart,
  FileText,
  Database,
  Target,
  Award,
  Globe,
  Star,
  Calendar
} from "lucide-react";
import { DepartmentConfig } from "@/lib/types/departmentConfig";

export const DEPARTMENT_CONFIGS: Record<string, DepartmentConfig> = {
  retailer: {
    roleName: 'Retailer Department',
    roleIcon: Store,
    roleColor: 'bg-blue-500',
    description: 'Manage marketplace operations, product verification, and seller relations',
    panels: [
      { 
        id: 'overview', 
        label: 'Overview', 
        icon: BarChart3,
        description: 'Marketplace statistics and performance metrics',
        color: 'bg-blue-50 border-blue-200 text-blue-800'
      },
      { 
        id: 'marketplace', 
        label: 'Marketplace', 
        icon: ShoppingCart,
        description: 'Product listings and marketplace management',
        color: 'bg-purple-50 border-purple-200 text-purple-800'
      },
      { 
        id: 'sellers', 
        label: 'Sellers', 
        icon: Users,
        description: 'Manage retailer accounts and seller verification',
        color: 'bg-green-50 border-green-200 text-green-800'
      },
      { 
        id: 'inventory', 
        label: 'Inventory', 
        icon: Package,
        description: 'Track stock levels, SKUs, and product categories',
        color: 'bg-orange-50 border-orange-200 text-orange-800'
      },
      { 
        id: 'verification', 
        label: 'Verification', 
        icon: CheckCircle,
        description: 'Review and approve product listings',
        color: 'bg-emerald-50 border-emerald-200 text-emerald-800'
      },
      { 
        id: 'financial', 
        label: 'Financial', 
        icon: DollarSign,
        description: 'Revenue tracking and commission reports',
        color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
      },
      { 
        id: 'settings', 
        label: 'Settings', 
        icon: Settings,
        description: 'Department preferences and notification rules',
        color: 'bg-gray-50 border-gray-200 text-gray-800'
      }
    ],
    metrics: [
      { key: 'total_listings', label: 'Active Listings', icon: ShoppingCart, format: 'number' },
      { key: 'pending_verification', label: 'Pending Verification', icon: AlertTriangle, format: 'number' },
      { key: 'revenue', label: 'Revenue', icon: DollarSign, format: 'currency' },
      { key: 'conversion_rate', label: 'Conversion Rate', icon: TrendingUp, format: 'percentage' },
      { key: 'average_listing_price', label: 'Avg Listing Price', icon: DollarSign, format: 'currency' },
      { key: 'featured_listings', label: 'Featured Listings', icon: Star, format: 'number' }
    ],
    importExportTypes: ['marketplace_listings', 'inventory', 'sellers'],
    dataTypes: ['marketplace_listings', 'devices', 'users', 'marketplace_transactions']
  },

  repair_shop: {
    roleName: 'Repair Shop Department',
    roleIcon: Wrench,
    roleColor: 'bg-orange-500',
    description: 'Manage repair service network, quality control, and warranty claims',
    panels: [
      { 
        id: 'overview', 
        label: 'Overview', 
        icon: BarChart3,
        description: 'Repair statistics and shop performance',
        color: 'bg-orange-50 border-orange-200 text-orange-800'
      },
      { 
        id: 'repair_orders', 
        label: 'Repair Orders', 
        icon: Wrench,
        description: 'All ongoing and completed repairs',
        color: 'bg-blue-50 border-blue-200 text-blue-800'
      },
      { 
        id: 'service_partners', 
        label: 'Service Partners', 
        icon: Users,
        description: 'Manage repair shop partnerships',
        color: 'bg-green-50 border-green-200 text-green-800'
      },
      { 
        id: 'quality_control', 
        label: 'Quality Control', 
        icon: CheckCircle,
        description: 'Review repair quality and warranty claims',
        color: 'bg-emerald-50 border-emerald-200 text-emerald-800'
      },
      { 
        id: 'financial', 
        label: 'Financial', 
        icon: DollarSign,
        description: 'Service fees, parts costs, and revenue by shop',
        color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
      },
      { 
        id: 'inventory', 
        label: 'Inventory', 
        icon: Package,
        description: 'Repair parts stock and supplier management',
        color: 'bg-purple-50 border-purple-200 text-purple-800'
      },
      { 
        id: 'settings', 
        label: 'Settings', 
        icon: Settings,
        description: 'Service standards and warranty policies',
        color: 'bg-gray-50 border-gray-200 text-gray-800'
      }
    ],
    metrics: [
      { key: 'total_repairs', label: 'Total Repairs', icon: Wrench, format: 'number' },
      { key: 'pending_repairs', label: 'Pending Repairs', icon: Clock, format: 'number' },
      { key: 'completion_rate', label: 'Completion Rate', icon: CheckCircle, format: 'percentage' },
      { key: 'average_rating', label: 'Avg Rating', icon: Star, format: 'number' },
      { key: 'total_revenue', label: 'Total Revenue', icon: DollarSign, format: 'currency' },
      { key: 'average_repair_cost', label: 'Avg Repair Cost', icon: DollarSign, format: 'currency' }
    ],
    importExportTypes: ['repair_orders', 'parts_inventory', 'service_partners'],
    dataTypes: ['repair_orders', 'devices', 'users']
  },

  insurance: {
    roleName: 'Insurance Department',
    roleIcon: Scale,
    roleColor: 'bg-purple-500',
    description: 'Manage device insurance policies, claims processing, and risk assessment',
    panels: [
      { 
        id: 'overview', 
        label: 'Overview', 
        icon: BarChart3,
        description: 'Policy statistics and claims summary',
        color: 'bg-purple-50 border-purple-200 text-purple-800'
      },
      { 
        id: 'policies', 
        label: 'Policies', 
        icon: FileText,
        description: 'Active insurance policies',
        color: 'bg-blue-50 border-blue-200 text-blue-800'
      },
      { 
        id: 'claims', 
        label: 'Claims', 
        icon: AlertTriangle,
        description: 'Pending and processed claims',
        color: 'bg-red-50 border-red-200 text-red-800'
      },
      { 
        id: 'policyholders', 
        label: 'Policyholders', 
        icon: Users,
        description: 'Customer accounts with insurance',
        color: 'bg-green-50 border-green-200 text-green-800'
      },
      { 
        id: 'financial', 
        label: 'Financial', 
        icon: DollarSign,
        description: 'Premiums collected, claims paid, and reserves',
        color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
      },
      { 
        id: 'risk_assessment', 
        label: 'Risk Assessment', 
        icon: Shield,
        description: 'Fraud detection and high-risk devices',
        color: 'bg-orange-50 border-orange-200 text-orange-800'
      },
      { 
        id: 'settings', 
        label: 'Settings', 
        icon: Settings,
        description: 'Policy terms and coverage limits',
        color: 'bg-gray-50 border-gray-200 text-gray-800'
      }
    ],
    metrics: [
      { key: 'total_policies', label: 'Active Policies', icon: FileText, format: 'number' },
      { key: 'pending_claims', label: 'Pending Claims', icon: AlertTriangle, format: 'number' },
      { key: 'claim_approval_rate', label: 'Approval Rate', icon: CheckCircle, format: 'percentage' },
      { key: 'total_premiums_collected', label: 'Premiums Collected', icon: DollarSign, format: 'currency' },
      { key: 'total_payouts', label: 'Total Payouts', icon: DollarSign, format: 'currency' },
      { key: 'average_claim_amount', label: 'Avg Claim Amount', icon: DollarSign, format: 'currency' }
    ],
    importExportTypes: ['insurance_policies', 'insurance_claims', 'policyholders'],
    dataTypes: ['insurance_policies', 'insurance_claims', 'devices', 'users']
  },

  law_enforcement: {
    roleName: 'Law Enforcement Department',
    roleIcon: Shield,
    roleColor: 'bg-red-500',
    description: 'Facilitate law enforcement requests, manage stolen device reports, and coordinate recoveries',
    panels: [
      { 
        id: 'overview', 
        label: 'Overview', 
        icon: BarChart3,
        description: 'Case statistics and recovery rate',
        color: 'bg-red-50 border-red-200 text-red-800'
      },
      { 
        id: 'stolen_reports', 
        label: 'Stolen Reports', 
        icon: AlertTriangle,
        description: 'All theft/loss reports',
        color: 'bg-orange-50 border-orange-200 text-orange-800'
      },
      { 
        id: 'active_cases', 
        label: 'Active Cases', 
        icon: Search,
        description: 'Ongoing investigations',
        color: 'bg-blue-50 border-blue-200 text-blue-800'
      },
      { 
        id: 'recovered_devices', 
        label: 'Recovered Devices', 
        icon: CheckCircle,
        description: 'Successfully recovered items',
        color: 'bg-green-50 border-green-200 text-green-800'
      },
      { 
        id: 'law_enforcement_partners', 
        label: 'LE Partners', 
        icon: Users,
        description: 'Police departments and agencies',
        color: 'bg-purple-50 border-purple-200 text-purple-800'
      },
      { 
        id: 'evidence_management', 
        label: 'Evidence', 
        icon: FileText,
        description: 'Documentation and chain of custody',
        color: 'bg-gray-50 border-gray-200 text-gray-800'
      },
      { 
        id: 'settings', 
        label: 'Settings', 
        icon: Settings,
        description: 'Access permissions and data retention policies',
        color: 'bg-gray-50 border-gray-200 text-gray-800'
      }
    ],
    metrics: [
      { key: 'total_cases', label: 'Total Cases', icon: Shield, format: 'number' },
      { key: 'active_cases', label: 'Active Cases', icon: Search, format: 'number' },
      { key: 'resolution_rate', label: 'Resolution Rate', icon: CheckCircle, format: 'percentage' },
      { key: 'reports_this_month', label: 'Reports This Month', icon: Calendar, format: 'number' },
      { key: 'high_priority_cases', label: 'High Priority', icon: AlertTriangle, format: 'number' },
      { key: 'total_rewards_offered', label: 'Rewards Offered', icon: DollarSign, format: 'currency' }
    ],
    importExportTypes: ['stolen_reports', 'case_data', 'evidence'],
    dataTypes: ['stolen_reports', 'lost_found_reports', 'devices', 'users']
  },

  ngo: {
    roleName: 'NGO Partnership Department',
    roleIcon: Heart,
    roleColor: 'bg-pink-500',
    description: 'Manage device donation programs, beneficiary tracking, and social impact',
    panels: [
      { 
        id: 'overview', 
        label: 'Overview', 
        icon: BarChart3,
        description: 'Donation statistics and impact metrics',
        color: 'bg-pink-50 border-pink-200 text-pink-800'
      },
      { 
        id: 'donations', 
        label: 'Donations', 
        icon: Heart,
        description: 'Device donation tracking',
        color: 'bg-red-50 border-red-200 text-red-800'
      },
      { 
        id: 'beneficiaries', 
        label: 'Beneficiaries', 
        icon: Users,
        description: 'Recipients of donated devices',
        color: 'bg-green-50 border-green-200 text-green-800'
      },
      { 
        id: 'ngo_partners', 
        label: 'NGO Partners', 
        icon: Building2,
        description: 'Partnered organizations',
        color: 'bg-blue-50 border-blue-200 text-blue-800'
      },
      { 
        id: 'impact_tracking', 
        label: 'Impact Tracking', 
        icon: Target,
        description: 'Social impact metrics and success stories',
        color: 'bg-purple-50 border-purple-200 text-purple-800'
      },
      { 
        id: 'financial', 
        label: 'Financial', 
        icon: DollarSign,
        description: 'Donation values, tax receipts, and program costs',
        color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
      },
      { 
        id: 'settings', 
        label: 'Settings', 
        icon: Settings,
        description: 'Program criteria and eligibility rules',
        color: 'bg-gray-50 border-gray-200 text-gray-800'
      }
    ],
    metrics: [
      { key: 'total_donations', label: 'Total Donations', icon: Heart, format: 'number' },
      { key: 'completed_donations', label: 'Completed', icon: CheckCircle, format: 'number' },
      { key: 'total_beneficiaries', label: 'Beneficiaries', icon: Users, format: 'number' },
      { key: 'impact_score', label: 'Impact Score', icon: Target, format: 'number' },
      { key: 'total_donation_value', label: 'Total Value', icon: DollarSign, format: 'currency' },
      { key: 'devices_awaiting_distribution', label: 'Awaiting Distribution', icon: Package, format: 'number' }
    ],
    importExportTypes: ['device_donations', 'beneficiaries', 'ngo_partners'],
    dataTypes: ['device_donations', 'devices', 'users']
  }
};

// Helper function to get department config
export const getDepartmentConfig = (role: string): DepartmentConfig | null => {
  return DEPARTMENT_CONFIGS[role] || null;
};

// Helper function to get all department roles
export const getDepartmentRoles = (): string[] => {
  return Object.keys(DEPARTMENT_CONFIGS);
};

// Helper function to check if role is a department role
export const isDepartmentRole = (role: string): boolean => {
  return role in DEPARTMENT_CONFIGS;
};
