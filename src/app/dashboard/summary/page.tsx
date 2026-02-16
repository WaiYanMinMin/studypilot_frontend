import { Suspense } from "react";
import { SummaryFeaturePage } from "@/components/dashboard/SummaryFeaturePage";

export default function DashboardSummaryPage() {
  return (
    <Suspense fallback={<main className="dashboardWrap pageLoadingWrap"><div className="loaderRing" aria-label="Loading summary page" /></main>}>
      <SummaryFeaturePage />
    </Suspense>
  );
}
