export type Framework = "html-css-js" | "react" | "nextjs" | "vue";

export interface ProjectFile {
  path: string;
  content: string;
}

export interface Project {
  id: string;
  ownerUid: string;
  name: string;
  description: string;
  framework: Framework;
  files: ProjectFile[];
  createdAt: number;
  updatedAt: number;
  templateId?: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  framework: Framework;
  prompt: string;
}

export interface AIResponse {
  summary: string;
  files: ProjectFile[];
  explanation?: string;
}
