import { auth } from "../firebase/config";
import { AIResponse, Framework, ProjectFile } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function authedFetch(path: string, body: unknown) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  if (!token) throw new Error("You must be signed in to do that.");

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  generateProject: (projectName: string, framework: Framework, description: string): Promise<AIResponse> =>
    authedFetch("/api/ai/generate", { projectName, framework, description }),

  editProject: (instruction: string, framework: Framework, currentFiles: ProjectFile[]): Promise<AIResponse> =>
    authedFetch("/api/ai/edit", { instruction, framework, currentFiles }),

  fixProject: (framework: Framework, currentFiles: ProjectFile[], errorContext?: string): Promise<AIResponse> =>
    authedFetch("/api/ai/fix", { framework, currentFiles, errorContext }),

  redesignProject: (instruction: string, framework: Framework, currentFiles: ProjectFile[]): Promise<AIResponse> =>
    authedFetch("/api/ai/redesign", { instruction, framework, currentFiles }),
};
