import { LucideIcon } from "lucide-react";

export interface PanelConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  color?: string;
}

export interface MetricConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  value?: number;
  trend?: 'up' | 'down' | 'stable';
  format?: 'number' | 'currency' | 'percentage';
}

export interface DepartmentConfig {
  roleName: string;
  roleIcon: LucideIcon;
  roleColor: string;
  panels: PanelConfig[];
  metrics: MetricConfig[];
  importExportTypes: string[];
  dataTypes: string[];
  description: string;
}

export interface DepartmentStats {
  [key: string]: any;
}

export interface DepartmentDashboardProps {
  roleType: string;
  roleName: string;
  roleIcon: LucideIcon;
  roleColor: string;
  departmentConfig: DepartmentConfig;
}
