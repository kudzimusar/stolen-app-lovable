/**
 * Insurance Admin Dashboard
 * 8-panel admin interface for insurance company stakeholders
 * Shows only insurance-specific data (policies, claims, payouts)
 */

import { Scale } from "lucide-react";
import StakeholderAdminDashboard from "./StakeholderAdminDashboard";

const InsuranceAdminDashboard = () => {
  return (
    <StakeholderAdminDashboard
      roleType="insurance"
      roleName="Insurance"
      roleIcon={Scale}
      roleColor="purple"
    />
  );
};

export default InsuranceAdminDashboard;

