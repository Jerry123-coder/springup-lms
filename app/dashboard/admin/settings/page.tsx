import { Settings } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function AdminSettingsPage() {
  return (
    <>
      <DashboardHeader heading="Settings" />
      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center">
          <Settings className="mb-3 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Settings</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform settings and configuration options will be available here
            in a future update.
          </p>
        </div>
      </div>
    </>
  );
}
