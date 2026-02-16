"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import {
  asDocumentList,
  asJson,
  type DocumentListItem
} from "@/components/dashboard/dashboardApi";
import { apiFetch } from "@/lib/apiClient";
import { getAiConfig, isAiSetupComplete } from "@/lib/aiConfigApi";
import { ApiError } from "@/lib/apiClient";

const PdfSelectionViewer = dynamic(
  () =>
    import("@/components/pdf/PdfSelectionViewer").then(
      (module) => module.PdfSelectionViewer
    ),
  { ssr: false }
);

export type FeatureWorkspaceRenderProps = {
  selectedDoc: DocumentListItem;
  selectedDocIds: string[];
  highlightText: string;
  busy: boolean;
  setBusy: (value: boolean) => void;
  status: string;
  setStatus: (value: string) => void;
};

export function FeatureWorkspace({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: (props: FeatureWorkspaceRenderProps) => ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const queryDocId = searchParams.get("doc") || "";

  const [docs, setDocs] = useState<DocumentListItem[]>([]);
  const [highlightText, setHighlightText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Ready to study.");
  const [aiReady, setAiReady] = useState(false);
  const [aiLoading, setAiLoading] = useState(true);

  const selectedDoc = useMemo(
    () => docs.find((doc) => doc.id === queryDocId) || null,
    [docs, queryDocId]
  );

  useEffect(() => {
    async function loadDocs() {
      try {
        const [docsPayload, aiConfig] = await Promise.all([
          asJson<unknown>(await apiFetch("/api/documents")),
          getAiConfig(),
        ]);
        const result = asDocumentList(docsPayload);
        setDocs(result);
        setAiReady(isAiSetupComplete(aiConfig));
        if (!queryDocId) {
          router.replace("/dashboard/select");
          return;
        }
        if (!result.some((doc) => doc.id === queryDocId)) {
          router.replace("/dashboard/select");
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          const callbackUrl = `${pathname}${searchParamsString ? `?${searchParamsString}` : ""}`;
          router.replace(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        }
      } finally {
        setAiLoading(false);
      }
    }
    void loadDocs();
  }, [queryDocId, router, pathname, searchParamsString]);

  if (aiLoading || !selectedDoc) {
    return (
      <main className="dashboardWrap">
        <section className="panel stepPanel">
          <p className="small">{aiLoading ? "Checking AI setup..." : "Loading selected PDF..."}</p>
        </section>
      </main>
    );
  }

  if (!aiReady) {
    return (
      <main className="dashboardWrap">
        <section className="panel stepPanel">
          <h2>OpenAI Setup Needed</h2>
          <p className="small">
            Add your OpenAI API key and choose a model before using AI study tools.
          </p>
          <div className="row" style={{ marginTop: 12 }}>
            <Link href="/profile" className="ctaButton">
              Open AI Settings
            </Link>
            <Link
              href={`/dashboard/choose?doc=${encodeURIComponent(selectedDoc.id)}`}
              className="ghostButton"
            >
              Back to Tools
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboardWrap">
      <header className="dashboardTopbar">
        <div>
          <p className="smallTag">Step 3 of 3</p>
          <h1>{title}</h1>
          <p className="small">{description}</p>
        </div>
        <div className="row">
          <Link href="/dashboard/select" className="ghostButton">
            Change File
          </Link>
          <Link
            href={`/dashboard/choose?doc=${encodeURIComponent(selectedDoc.id)}`}
            className="ghostButton"
          >
            Change Tool
          </Link>
          <Link href="/" className="ghostButton">
            Back Home
          </Link>
        </div>
      </header>

      <div className="featurePageGrid">
        <section className="panel">
          {children({
            selectedDoc,
            selectedDocIds: [selectedDoc.id],
            highlightText,
            busy,
            setBusy,
            status,
            setStatus
          })}
          <p className="small">Status: {status}</p>
        </section>
        <section className="panel">
          <h3>PDF Viewer</h3>
          <div className="pdfWrap largePdf">
            <PdfSelectionViewer
              file={selectedDoc.fileUrl}
              onHighlightChange={setHighlightText}
              width={820}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
