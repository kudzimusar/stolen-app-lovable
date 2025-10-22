/**
 * NGO Admin Dashboard
 * 8-panel admin interface for NGO stakeholders
 * Shows only NGO-specific data (donations, beneficiaries, programs)
 */

import { Heart } from "lucide-react";
import StakeholderAdminDashboard from "./StakeholderAdminDashboard";

const NGOAdminDashboard = () => {
  return (
    <StakeholderAdminDashboard
      roleType="ngo"
      roleName="NGO"
      roleIcon={Heart}
      roleColor="pink"
    />
  );
};

export default NGOAdminDashboard;

