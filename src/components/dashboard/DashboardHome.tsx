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
    title: "Quick Summary",
    desc: "Get the key ideas from your lecture quickly before deep review.",
    path: "/dashboard/summary",
  },
  {
    title: "Ask Anything",
    desc: "Ask questions about your slides and get clear, context-based answers.",
    path: "/dashboard/ask",
  },
  {
    title: "Explain My Highlight",
    desc: "Highlight confusing text and get a simple explanation right away.",
    path: "/dashboard/highlight",
  },
  {
    title: "Cheat Sheet Builder",
    desc: "Create a clean revision sheet with formulas, terms, and key points.",
    path: "/dashboard/cheatsheet",
  },
  {
    title: "Practice Quiz",
    desc: "Test yourself with instant feedback and learn from mistakes.",
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
          <h1>Pick a Study Tool</h1>
          <p className="small">
            Choose what you want to do with this PDF. You'll move into a full
            workspace in the next step.
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
        <h3>Selected File</h3>
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
