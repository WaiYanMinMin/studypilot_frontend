import { Suspense } from "react";
import { CheatSheetFeaturePage } from "@/components/dashboard/CheatSheetFeaturePage";

export default function DashboardCheatSheetPage() {
  return (
    <Suspense fallback={<main className="dashboardWrap pageLoadingWrap"><div className="loaderRing" aria-label="Loading cheatsheet page" /></main>}>
      <CheatSheetFeaturePage />
    </Suspense>
  );
}
