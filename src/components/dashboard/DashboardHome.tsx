"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/lib/apiClient";
import {
  asDocumentList,
  asJson,
  type DocumentListItem,
} from "@/components/dashboard/dashboardApi";

const featureCards = [
  {
    title: "Executive Summary",
    desc: "Produce a structured overview of the selected lecture deck for rapid review.",
    path: "/dashboard/summary",
  },
  {
    title: "Contextual Q&A",
    desc: "Ask domain-specific questions and receive evidence-grounded responses.",
    path: "/dashboard/ask",
  },
  {
    title: "Highlight Analysis",
    desc: "Investigate selected PDF excerpts with focused, context-aware clarification.",
    path: "/dashboard/highlight",
  },
  {
    title: "Revision Brief",
    desc: "Generate a polished study brief with key concepts, formulas, and takeaways.",
    path: "/dashboard/cheatsheet",
  },
  {
    title: "Mastery Check",
    desc: "Assess comprehension through an interactive quiz with immediate feedback.",
    path: "/dashboard/quiz",
  },
];

export function DashboardHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDocId = searchParams.get("doc") || "";

  const [docs, setDocs] = useState<DocumentListItem[]>([]);

  const selectedDoc = useMemo(
    () => docs.find((doc) => doc.id === selectedDocId) || null,
    [docs, selectedDocId],
  );

  useEffect(() => {
    async function loadDocs() {
      const result = asDocumentList(await asJson<unknown>(await apiFetch("/api/documents")));
      setDocs(result);
      if (!selectedDocId && result[0]) {
        router.replace(
          `/dashboard/choose?doc=${encodeURIComponent(result[0].id)}`,
        );
        return;
      }
      if (selectedDocId && !result.some((doc) => doc.id === selectedDocId)) {
        router.replace("/dashboard/select");
      }
    }
    void loadDocs();
  }, [selectedDocId, router]);

  return (
    <main className="dashboardWrap">
      <header className="dashboardTopbar">
        <div>
          <p className="smallTag">Step 2 of 3</p>
          <h1>Select Your Study Workflow</h1>
          <p className="small">
            Choose the experience you want to run for this document. The next
            screen opens the full study workspace.
          </p>
        </div>
        <div className="row">
          <Link href="/dashboard/select" className="ghostButton">
            Change PDF
          </Link>
          <Link href="/" className="ghostButton">
            Back to Landing
          </Link>
        </div>
      </header>

      <section className="panel stepPanel">
        <h3>Active Document</h3>
        <p className="small">
          {selectedDoc ? selectedDoc.title : "Loading document selection..."}
        </p>
        <div className="featureChoiceGrid">
          {featureCards.map((feature) => (
            <Link
              key={feature.title}
              href={
                selectedDoc
                  ? `${feature.path}?doc=${encodeURIComponent(selectedDoc.id)}`
                  : "/dashboard/select"
              }
              className={`featureChoiceCard ${selectedDoc ? "" : "disabled"}`}
            >
              <h4>{feature.title}</h4>
              <p>{feature.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
