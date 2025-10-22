/**
 * Repair Shop Admin Dashboard
 * 8-panel admin interface for repair shop stakeholders
 * Shows only repair shop-specific data (their repairs, customers, inventory)
 */

import { Wrench } from "lucide-react";
import StakeholderAdminDashboard from "./StakeholderAdminDashboard";

const RepairShopAdminDashboard = () => {
  return (
    <StakeholderAdminDashboard
      roleType="repair_shop"
      roleName="Repair Shop"
      roleIcon={Wrench}
      roleColor="orange"
    />
  );
};

export default RepairShopAdminDashboard;

