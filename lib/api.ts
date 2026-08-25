export interface AnalysisResponseData {
  success: boolean;
  task: string;
  answer: string;
  confidence: number | null;
  evidence: string[];
  visual_evidence?: string[];
  execution_trace: string[];
  model: string;
  metadata: Record<string, any>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function analyzeImage(
  file: File,
  query: string
): Promise<AnalysisResponseData> {
  return analyzeImages([file], query);
}

export async function analyzeImages(
  files: File[],
  query: string
): Promise<AnalysisResponseData> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  formData.append("query", query);

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Analysis failed with status ${response.status}`);
  }

  return response.json();
}

