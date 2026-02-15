export interface PageText {
  pageNumber: number;
  text: string;
}

export interface TextChunk {
  chunkId: string;
  pageNumber: number;
  text: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  filePath: string;
  uploadedAt: string;
  pages: PageText[];
  chunks: TextChunk[];
}

export interface Citation {
  documentId: string;
  title: string;
  pageNumber: number;
  chunkId: string;
  excerpt: string;
}

export interface AskRequest {
  question: string;
  documentIds: string[];
}

export interface HighlightAskRequest {
  question: string;
  highlightText: string;
  documentIds: string[];
}

export interface AskResponse {
  answer: string;
  citations: Citation[];
}

export interface StudyResourcesRequest {
  documentIds: string[];
}

export interface StudyResourcesResponse {
  summary: string;
  cheatSheet: string;
  quiz: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}
