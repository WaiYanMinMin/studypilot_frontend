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
      title="Ask Anything"
      description="Ask questions about your lecture slides and get clear answers."
    >
      {({ selectedDocIds, selectedDoc, busy, setBusy, setStatus }) => (
        <div>
          <h3>Ask Your Question</h3>
          <p className="small">
            {selectedDoc
              ? `Current document: ${selectedDoc.title}`
              : "Select a document from the left panel first."}
          </p>
          <textarea
            placeholder="Example: Can you explain this concept in simple terms?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            className="ctaButton"
            disabled={busy || !selectedDoc || !question.trim()}
            onClick={async () => {
              if (!selectedDoc || !question.trim()) return;
              setBusy(true);
              setStatus("Thinking...");
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
                setStatus("Answer ready.");
              } catch (error) {
                setStatus(error instanceof Error ? error.message : "Response generation failed.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Get Answer
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
