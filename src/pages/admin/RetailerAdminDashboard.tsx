/**
 * Retailer Admin Dashboard
 * 8-panel admin interface for retailer stakeholders
 * Shows only retailer-specific data (their listings, sales, customers)
 */

import { Store } from "lucide-react";
import StakeholderAdminDashboard from "./StakeholderAdminDashboard";

const RetailerAdminDashboard = () => {
  return (
    <StakeholderAdminDashboard
      roleType="retailer"
      roleName="Retailer"
      roleIcon={Store}
      roleColor="blue"
    />
  );
};

export default RetailerAdminDashboard;

