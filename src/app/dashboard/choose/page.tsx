import { Suspense } from "react";
import { DashboardHome } from "@/components/dashboard/DashboardHome";

export default function DashboardChoosePage() {
  return (
    <Suspense fallback={<main className="dashboardWrap pageLoadingWrap"><div className="loaderRing" aria-label="Loading workflow selection page" /></main>}>
      <DashboardHome />
    </Suspense>
  );
}
