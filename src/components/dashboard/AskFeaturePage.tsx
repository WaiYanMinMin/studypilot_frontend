"use client";

import { useState } from "react";

import { asJson } from "@/components/dashboard/dashboardApi";
import { FeatureWorkspace } from "@/components/dashboard/FeatureWorkspace";
import { apiFetch } from "@/lib/apiClient";

type AskResult = {
  answer: string;
  citations: Array<{
    documentId: string;
    title: string;
    pageNumber: number;
    chunkId: string;
    excerpt: string;
  }>;
};

export function AskFeaturePage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResult | null>(null);

  return (
    <FeatureWorkspace
      title="Contextual Q&A"
      description="Receive evidence-based answers grounded in your selected lecture material."
    >
      {({ selectedDocIds, selectedDoc, busy, setBusy, setStatus }) => (
        <div>
          <h3>Ask a Content-Aware Question</h3>
          <p className="small">
            {selectedDoc
              ? `Current document: ${selectedDoc.title}`
              : "Select a document from the left panel first."}
          </p>
          <textarea
            placeholder="Enter a specific concept, topic, or problem you want clarified..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            className="ctaButton"
            disabled={busy || !selectedDoc || !question.trim()}
            onClick={async () => {
              if (!selectedDoc || !question.trim()) return;
              setBusy(true);
              setStatus("Generating contextual response...");
              try {
                const response = await asJson<AskResult>(
                  await apiFetch("/api/ask", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      question,
                      documentIds: selectedDocIds
                    })
                  })
                );
                setResult(response);
                setStatus("Response generated.");
              } catch (error) {
                setStatus(error instanceof Error ? error.message : "Response generation failed.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Generate Response
          </button>
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
