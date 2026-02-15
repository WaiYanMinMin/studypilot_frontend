declare module "pdf-parse-debugging-disabled" {
  import type { Buffer } from "node:buffer";

  type PdfParseItem = { str?: string };
  type PdfParseTextContent = { items: PdfParseItem[] };
  type PdfParsePageData = {
    pageIndex: number;
    getTextContent: () => Promise<PdfParseTextContent>;
  };

  interface PdfParseOptions {
    pagerender?: (pageData: PdfParsePageData) => Promise<string>;
  }

  function pdfParse(dataBuffer: Buffer, options?: PdfParseOptions): Promise<unknown>;
  export default pdfParse;
}
