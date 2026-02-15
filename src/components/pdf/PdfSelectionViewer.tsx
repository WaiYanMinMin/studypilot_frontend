"use client";

import { useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

export function PdfSelectionViewer({
  file,
  width,
  onHighlightChange
}: {
  file: string;
  width: number;
  onHighlightChange: (text: string) => void;
}) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadError, setLoadError] = useState("");
  const documentOptions = useMemo(() => ({ withCredentials: true } as const), []);

  return (
    <div>
      <div className="row" style={{ marginBottom: 10 }}>
        <button
          className="ghostButton"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <span className="small">
          Page {currentPage} / {numPages || "?"}
        </span>
        <button
          className="ghostButton"
          onClick={() => setCurrentPage((p) => Math.min(numPages || 1, p + 1))}
        >
          Next
        </button>
      </div>
      <div
        onMouseUp={() => {
          const selected = window.getSelection()?.toString().trim() || "";
          if (selected.length > 1) onHighlightChange(selected);
        }}
      >
        {loadError ? <p className="pdfError">{loadError}</p> : null}
        <Document
          file={file}
          options={documentOptions}
          onLoadSuccess={({ numPages: pages }) => {
            setNumPages(pages);
            setCurrentPage(1);
            setLoadError("");
          }}
          onLoadError={(error) => {
            const message =
              error instanceof Error ? error.message : "Failed to load PDF.";
            setLoadError(
              `Could not load this PDF. ${message} Re-upload the document from Step 1 if it was deleted.`
            );
          }}
          loading={<p className="small">Loading PDF...</p>}
        >
          <Page
            pageNumber={currentPage}
            renderAnnotationLayer
            renderTextLayer
            width={width}
          />
        </Document>
      </div>
    </div>
  );
}
