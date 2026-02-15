"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import {
  asDocumentList,
  asJson,
  type DocumentListItem
} from "@/components/dashboard/dashboardApi";
import { apiFetch } from "@/lib/apiClient";

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
  const searchParams = useSearchParams();
  const queryDocId = searchParams.get("doc") || "";

  const [docs, setDocs] = useState<DocumentListItem[]>([]);
  const [highlightText, setHighlightText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Workspace ready.");

  const selectedDoc = useMemo(
    () => docs.find((doc) => doc.id === queryDocId) || null,
    [docs, queryDocId]
  );

  useEffect(() => {
    async function loadDocs() {
      const result = asDocumentList(await asJson<unknown>(await apiFetch("/api/documents")));
      setDocs(result);
      if (!queryDocId) {
        router.replace("/dashboard/select");
        return;
      }
      if (!result.some((doc) => doc.id === queryDocId)) {
        router.replace("/dashboard/select");
      }
    }
    void loadDocs();
  }, [queryDocId, router]);

  if (!selectedDoc) {
    return (
      <main className="dashboardWrap">
        <section className="panel stepPanel">
          <p className="small">Loading selected PDF...</p>
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
            Switch Document
          </Link>
          <Link
            href={`/dashboard/choose?doc=${encodeURIComponent(selectedDoc.id)}`}
            className="ghostButton"
          >
            Switch Workflow
          </Link>
          <Link href="/" className="ghostButton">
            Return to Landing
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
          <h3>Document Viewer</h3>
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
