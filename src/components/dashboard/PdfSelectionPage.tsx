"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  asDocumentList,
  asJson,
  type DocumentListItem
} from "@/components/dashboard/dashboardApi";
import { apiFetch } from "@/lib/apiClient";

export function PdfSelectionPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<DocumentListItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [busy, setBusy] = useState(false);
  const [docsLoading, setDocsLoading] = useState(true);
  const [status, setStatus] = useState("Select a source document to continue.");

  async function loadDocuments() {
    setDocsLoading(true);
    try {
      const result = asDocumentList(await asJson<unknown>(await apiFetch("/api/documents")));
      setDocs(result);
      if (!selectedDocId && result[0]) {
        setSelectedDocId(result[0].id);
      }
    } finally {
      setDocsLoading(false);
    }
  }

  async function uploadPdf(file: File) {
    setBusy(true);
    setStatus("Uploading and processing document...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      await asJson(await apiFetch("/api/upload", { method: "POST", body: formData }));
      await loadDocuments();
      setStatus("Upload complete. You can proceed to workflow selection.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteDocument(docId: string) {
    setBusy(true);
    setStatus("Removing selected document...");
    try {
      await asJson(await apiFetch(`/api/documents/${docId}`, { method: "DELETE" }));
      const remaining = docs.filter((doc) => doc.id !== docId);
      setDocs(remaining);
      if (selectedDocId === docId) {
        setSelectedDocId(remaining[0]?.id || "");
      }
      setStatus("Document removed successfully.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Document removal failed.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void loadDocuments();
  }, []);

  return (
    <main className="dashboardWrap">
      <header className="dashboardTopbar">
        <div>
          <p className="smallTag">Step 1 of 3</p>
          <h1>Select Your Source Document</h1>
          <p className="small">
            Upload a lecture PDF or choose a previously processed document.
          </p>
        </div>
        <div className="row">
          <Link href="/" className="ghostButton">
            Back to Landing
          </Link>
          <button
            className="ghostButton"
            onClick={async () => {
              await apiFetch("/api/auth/signout", { method: "POST" });
              window.location.href = "/";
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <section className="panel stepPanel">
        <h3>Upload New Lecture File</h3>
        <input
          type="file"
          accept="application/pdf"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadPdf(file);
          }}
        />

        <h3 style={{ marginTop: 20 }}>Or Select Existing File</h3>
        {docsLoading ? (
          <div className="inlineLoaderWrap">
            <div className="loaderRing" aria-label="Loading documents" />
          </div>
        ) : (
          <div className="documentList">
            {docs.map((doc) => (
              <div key={doc.id} className="docItemRow">
                <button
                  className={`docItem ${selectedDocId === doc.id ? "active" : ""}`}
                  onClick={() => setSelectedDocId(doc.id)}
                >
                  <strong>{doc.title}</strong>
                  <span>
                    {doc.pageCount || 0} pages • {doc.chunkCount || 0} chunks
                  </span>
                </button>
                <button
                  className="ghostButton danger docDeleteButton"
                  disabled={busy}
                  onClick={() => void deleteDocument(doc.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="row" style={{ marginTop: 14 }}>
          <button
            className="ctaButton"
            disabled={!selectedDocId}
            onClick={() =>
              router.push(`/dashboard/choose?doc=${encodeURIComponent(selectedDocId)}`)
            }
          >
            Continue to Workflow Selection
          </button>
        </div>
        <p className="small">Status: {status}</p>
      </section>
    </main>
  );
}
