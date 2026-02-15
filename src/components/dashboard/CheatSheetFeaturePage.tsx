"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { asJson } from "@/components/dashboard/dashboardApi";
import { FeatureWorkspace } from "@/components/dashboard/FeatureWorkspace";
import { apiFetch } from "@/lib/apiClient";

type ResourcesResult = {
  summary: string;
  cheatSheet: string;
  quiz: Array<unknown>;
};

function normalizeFormulaExpression(expression: string) {
  let out = expression.trim();

  if (out.startsWith("(") && out.endsWith(")")) {
    out = out.slice(1, -1).trim();
  }

  // Remove obvious trailing unmatched right parenthesis from model output.
  while (out.endsWith(")")) {
    const openCount = out.match(/\(/g)?.length || 0;
    const closeCount = out.match(/\)/g)?.length || 0;
    if (openCount >= closeCount) {
      break;
    }
    out = out.slice(0, -1).trim();
  }

  return out;
}

function looksLikeMath(line: string) {
  return (
    /\\[a-zA-Z]+/.test(line) ||
    /[_^]\{?[\w\\+-]+\}?/.test(line) ||
    /[A-Za-z]\s*=\s*[A-Za-z0-9\\]/.test(line) ||
    /\\cdot|\\times|\\frac|\\sum|\\int/.test(line)
  );
}

function normalizeCheatSheetMarkdown(raw: string) {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const normalized: string[] = [];

  for (const originalLine of lines) {
    const trimmed = originalLine.trim();
    if (!trimmed) {
      normalized.push("");
      continue;
    }

    if (trimmed.startsWith("$$") || trimmed.startsWith("$")) {
      normalized.push(originalLine);
      continue;
    }

    // Convert "Label: ( formula )" into prose + display equation.
    const labeledFormula = trimmed.match(/^([^:]+):\s*\((.+)\)\s*$/);
    if (labeledFormula && looksLikeMath(labeledFormula[2])) {
      normalized.push(`${labeledFormula[1].trim()}:`);
      normalized.push(`$$${normalizeFormulaExpression(labeledFormula[2])}$$`);
      continue;
    }

    // Convert plain formula-like lines into display equations.
    if (looksLikeMath(trimmed)) {
      normalized.push(`$$${normalizeFormulaExpression(trimmed)}$$`);
      continue;
    }

    normalized.push(originalLine);
  }

  return normalized.join("\n");
}

async function downloadCheatSheetPdfFromPreview(previewEl: HTMLElement) {
  const pdf = new jsPDF();
  const pageWidthMm = pdf.internal.pageSize.getWidth();
  const pageHeightMm = pdf.internal.pageSize.getHeight();
  const marginMm = 10;
  const printableWidthMm = pageWidthMm - marginMm * 2;
  const printableHeightMm = pageHeightMm - marginMm * 2;

  await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

  const canvas = await html2canvas(previewEl, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true
  });

  const pxPerMm = canvas.width / printableWidthMm;
  const pageSliceHeightPx = Math.floor(printableHeightMm * pxPerMm);
  let renderedHeightPx = 0;

  while (renderedHeightPx < canvas.height) {
    const remainingHeightPx = canvas.height - renderedHeightPx;
    const sliceHeightPx = Math.min(pageSliceHeightPx, remainingHeightPx);

    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeightPx;
    const context = sliceCanvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to render PDF preview.");
    }

    context.drawImage(
      canvas,
      0,
      renderedHeightPx,
      canvas.width,
      sliceHeightPx,
      0,
      0,
      canvas.width,
      sliceHeightPx
    );

    const imageData = sliceCanvas.toDataURL("image/png");
    const imageHeightMm = sliceHeightPx / pxPerMm;

    if (renderedHeightPx > 0) {
      pdf.addPage();
    }
    pdf.addImage(
      imageData,
      "PNG",
      marginMm,
      marginMm,
      printableWidthMm,
      imageHeightMm,
      undefined,
      "FAST"
    );

    renderedHeightPx += sliceHeightPx;
  }

  pdf.save("study-cheatsheet.pdf");
}

export function CheatSheetFeaturePage() {
  const [cheatSheet, setCheatSheet] = useState("");
  const [exportingPdf, setExportingPdf] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const normalizedCheatSheet = normalizeCheatSheetMarkdown(cheatSheet);

  return (
    <FeatureWorkspace
      title="Revision Brief"
      description="Create a polished study brief with formulas, concepts, and practical cues."
    >
      {({ selectedDoc, selectedDocIds, busy, setBusy, setStatus }) => (
        <div>
          <h3>Structured Revision Brief</h3>
          <p className="small">
            Produce a clean, exam-ready brief from your selected lecture source.
          </p>
          <div className="row">
            <button
              className="ctaButton"
              disabled={busy || !selectedDoc}
              onClick={async () => {
                if (!selectedDoc) return;
                setBusy(true);
                setStatus("Generating revision brief...");
                try {
                  const response = await asJson<ResourcesResult>(
                    await apiFetch("/api/resources", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ documentIds: selectedDocIds })
                    })
                  );
                  setCheatSheet(response.cheatSheet);
                  setStatus("Revision brief generated.");
                } catch (error) {
                  setStatus(
                    error instanceof Error
                      ? error.message
                      : "Revision brief generation failed."
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              Generate Brief
            </button>
            <button
              className="ghostButton"
              disabled={!cheatSheet || exportingPdf}
              onClick={async () => {
                if (!previewRef.current) return;
                setExportingPdf(true);
                try {
                  await downloadCheatSheetPdfFromPreview(previewRef.current);
                  setStatus("Formatted PDF downloaded successfully.");
                } catch (error) {
                  setStatus(
                    error instanceof Error ? error.message : "PDF download failed."
                  );
                } finally {
                  setExportingPdf(false);
                }
              }}
            >
              {exportingPdf ? "Preparing PDF..." : "Download PDF"}
            </button>
          </div>
          {cheatSheet ? (
            <div className="resultCard">
              <h4>Revision Brief Preview</h4>
              <div ref={previewRef} className="cheatSheetPreview">
                <article className="cheatSheetPreviewBody markdownPreview">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {normalizedCheatSheet}
                  </ReactMarkdown>
                </article>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </FeatureWorkspace>
  );
}
