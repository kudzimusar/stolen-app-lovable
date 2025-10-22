/**
 * Law Enforcement Admin Dashboard
 * 8-panel admin interface for law enforcement stakeholders
 * Shows only law enforcement-specific data (cases, reports, investigations)
 */

import { Shield } from "lucide-react";
import StakeholderAdminDashboard from "./StakeholderAdminDashboard";

const LawEnforcementAdminDashboard = () => {
  return (
    <StakeholderAdminDashboard
      roleType="law_enforcement"
      roleName="Law Enforcement"
      roleIcon={Shield}
      roleColor="red"
    />
  );
};

export default LawEnforcementAdminDashboard;

