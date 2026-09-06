import { ProjectFile, WebsiteProject, WebsiteVersion } from "../../types";

export interface StudioChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  steps?: string[];
  suggestedPrompts?: string[];
}

export type ViewportMode = "desktop" | "tablet" | "mobile";

export type StudioTabMode = "preview" | "code" | "split";

export type AIModelEngine =
  | "claude-3.5-sonnet"
  | "gemini-3.8-flash"
  | "gemini-3.1-pro"
  | "qwen-coder"
  | "deepseek-coder"
  | "gpt-4o";
