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
      title="Explain My Highlight"
      description="Highlight any text in the PDF and ask for a simple explanation."
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
          <h3>Ask About Highlighted Text</h3>
          <p className="small">
            Highlight text in the PDF, then ask what it means.
          </p>
          <textarea
            placeholder="What is confusing here?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            className="ctaButton"
            disabled={busy || !selectedDoc || !highlightText || !question.trim()}
            onClick={async () => {
              if (!selectedDoc || !highlightText || !question.trim()) return;
              setBusy(true);
              setStatus("Explaining your highlight...");
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
                setStatus("Explanation ready.");
              } catch (error) {
                setStatus(
                  error instanceof Error ? error.message : "Highlight analysis failed."
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            Explain Highlight
          </button>
          {highlightText ? (
            <div className="highlightBox">
              <strong>Your Highlight</strong>
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
