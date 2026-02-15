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
      title="Executive Summary"
      description="Generate a concise, structured briefing from your selected lecture document."
    >
      {({ selectedDoc, selectedDocIds, busy, setBusy, setStatus }) => (
        <div>
          <h3>Lecture Briefing</h3>
          <p className="small">
            Synthesize key concepts, frameworks, and important takeaways.
          </p>
          <button
            className="ctaButton"
            disabled={busy || !selectedDoc}
            onClick={async () => {
              if (!selectedDoc) return;
              setBusy(true);
              setStatus("Generating executive summary...");
              try {
                const response = await asJson<ResourcesResult>(
                  await apiFetch("/api/resources", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ documentIds: selectedDocIds })
                  })
                );
                setSummary(response.summary);
                setStatus("Executive summary generated.");
              } catch (error) {
                setStatus(
                  error instanceof Error ? error.message : "Summary generation could not be completed."
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            Generate Briefing
          </button>
          {summary ? (
            <div className="resultCard">
              <h4>Summary Output</h4>
              <pre>{summary}</pre>
            </div>
          ) : null}
        </div>
      )}
    </FeatureWorkspace>
  );
}
