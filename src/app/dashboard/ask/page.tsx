import { Suspense } from "react";
import { AskFeaturePage } from "@/components/dashboard/AskFeaturePage";

export default function DashboardAskPage() {
  return (
    <Suspense fallback={<main className="dashboardWrap pageLoadingWrap"><div className="loaderRing" aria-label="Loading ask page" /></main>}>
      <AskFeaturePage />
    </Suspense>
  );
}
