"use client";

import { useState } from "react";

import { asJson } from "@/components/dashboard/dashboardApi";
import { FeatureWorkspace } from "@/components/dashboard/FeatureWorkspace";
import { apiFetch } from "@/lib/apiClient";

type AskResult = {
  answer: string;
};

export function HighlightFeaturePage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResult | null>(null);

  return (
    <FeatureWorkspace
      title="Highlight Analysis"
      description="Investigate specific excerpts with precision, context-aware analysis."
    >
      {({
        selectedDoc,
        selectedDocIds,
        highlightText,
        busy,
        setBusy,
        setStatus
      }) => (
        <div>
          <h3>Analyze a Highlighted Excerpt</h3>
          <p className="small">
            Select text in the document viewer, then request a focused explanation.
          </p>
          <textarea
            placeholder="What would you like clarified about the highlighted section?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            className="ctaButton"
            disabled={busy || !selectedDoc || !highlightText || !question.trim()}
            onClick={async () => {
              if (!selectedDoc || !highlightText || !question.trim()) return;
              setBusy(true);
              setStatus("Generating highlight-based analysis...");
              try {
                const response = await asJson<AskResult>(
                  await apiFetch("/api/ask-highlight", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      question,
                      highlightText,
                      documentIds: selectedDocIds
                    })
                  })
                );
                setResult(response);
                setStatus("Analysis generated.");
              } catch (error) {
                setStatus(
                  error instanceof Error ? error.message : "Highlight analysis failed."
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            Analyze Highlight
          </button>
          {highlightText ? (
            <div className="highlightBox">
              <strong>Selected Excerpt</strong>
              <p>{highlightText}</p>
            </div>
          ) : null}
          {result ? (
            <div className="resultCard">
              <h4>AI Response</h4>
              <p>{result.answer}</p>
            </div>
          ) : null}
        </div>
      )}
    </FeatureWorkspace>
  );
}
