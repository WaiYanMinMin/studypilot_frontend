import { Suspense } from "react";
import { QuizFeaturePage } from "@/components/dashboard/QuizFeaturePage";

export default function DashboardQuizPage() {
  return (
    <Suspense fallback={<main className="dashboardWrap pageLoadingWrap"><div className="loaderRing" aria-label="Loading quiz page" /></main>}>
      <QuizFeaturePage />
    </Suspense>
  );
}
