import { Suspense } from "react";
import { HighlightFeaturePage } from "@/components/dashboard/HighlightFeaturePage";

export default function DashboardHighlightPage() {
  return (
    <Suspense fallback={<main className="dashboardWrap pageLoadingWrap"><div className="loaderRing" aria-label="Loading highlight page" /></main>}>
      <HighlightFeaturePage />
    </Suspense>
  );
}
