"use client";

import { useState } from "react";

import { asJson } from "@/components/dashboard/dashboardApi";
import { FeatureWorkspace } from "@/components/dashboard/FeatureWorkspace";
import { apiFetch } from "@/lib/apiClient";

type ResourcesResult = {
  summary: string;
  cheatSheet: string;
  quiz: Array<unknown>;
};

export function SummaryFeaturePage() {
  const [summary, setSummary] = useState("");

  return (
    <FeatureWorkspace
      title="Quick Summary"
      description="Get the most important points from your lecture in seconds."
    >
      {({ selectedDoc, selectedDocIds, busy, setBusy, setStatus }) => (
        <div>
          <h3>Lecture Summary</h3>
          <p className="small">
            Great for revision before class, quizzes, or exams.
          </p>
          <button
            className="ctaButton"
            disabled={busy || !selectedDoc}
            onClick={async () => {
              if (!selectedDoc) return;
              setBusy(true);
              setStatus("Creating summary...");
              try {
                const response = await asJson<ResourcesResult>(
                  await apiFetch("/api/resources", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ documentIds: selectedDocIds })
                  })
                );
                setSummary(response.summary);
                setStatus("Summary ready.");
              } catch (error) {
                setStatus(
                  error instanceof Error ? error.message : "Summary generation could not be completed."
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            Generate Summary
          </button>
          {summary ? (
            <div className="resultCard">
              <h4>Your Summary</h4>
              <pre>{summary}</pre>
            </div>
          ) : null}
        </div>
      )}
    </FeatureWorkspace>
  );
}
