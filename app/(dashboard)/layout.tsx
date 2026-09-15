import { AuthGate } from "@/components/auth/auth-gate";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGate>
      <DashboardShell>{children}</DashboardShell>
    </AuthGate>
  );
};

export default DashboardLayout;
