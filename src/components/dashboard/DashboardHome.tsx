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
import { getAiConfig, isAiSetupComplete } from "@/lib/aiConfigApi";
import { ApiError } from "@/lib/apiClient";

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
  const [aiReady, setAiReady] = useState(false);
  const [aiLoading, setAiLoading] = useState(true);

  const selectedDoc = useMemo(
    () => docs.find((doc) => doc.id === selectedDocId) || null,
    [docs, selectedDocId],
  );

  useEffect(() => {
    async function loadDocs() {
      try {
        const [docsPayload, aiConfig] = await Promise.all([
          asJson<unknown>(await apiFetch("/api/documents")),
          getAiConfig()
        ]);
        const result = asDocumentList(docsPayload);
        setDocs(result);
        setAiReady(isAiSetupComplete(aiConfig));
        if (!selectedDocId && result[0]) {
          router.replace(
            `/dashboard/choose?doc=${encodeURIComponent(result[0].id)}`,
          );
          return;
        }
        if (selectedDocId && !result.some((doc) => doc.id === selectedDocId)) {
          router.replace("/dashboard/select");
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/signin?callbackUrl=/dashboard/choose");
        }
      } finally {
        setAiLoading(false);
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
        {!aiLoading && !aiReady ? (
          <div className="resultCard">
            <h4>Set Up OpenAI to Continue</h4>
            <p>
              Add your OpenAI API key and choose a model in Profile to unlock
              AI tools.
            </p>
            <div className="row">
              <Link href="/profile" className="ctaButton">
                Open AI Settings
              </Link>
            </div>
          </div>
        ) : null}
        <div className="featureChoiceGrid">
          {featureCards.map((feature) => (
            <Link
              key={feature.title}
              href={
                selectedDoc && aiReady
                  ? `${feature.path}?doc=${encodeURIComponent(selectedDoc.id)}`
                  : aiReady
                    ? "/dashboard/select"
                    : "/profile"
              }
              className={`featureChoiceCard ${selectedDoc && aiReady ? "" : "disabled"}`}
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
