export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  avatarLetter: string;
  plan: string;
  hasRecoveryPhone: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "file" | "drive" | "notebook";
  url?: string;
  base64?: string;
  size?: string;
}

export interface MessageAction {
  liked?: boolean;
  disliked?: boolean;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  model?: string;
  attachments?: Attachment[];
  actions?: MessageAction;
  mode?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
  isPinned?: boolean;
  temporary?: boolean;
}

export interface Notebook {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  sourcesCount: number;
  tags: string[];
}

export type ThemeMode = "system" | "light" | "dark";

export interface AIModel {
  id: string;
  name: string;
  badge: string;
  description: string;
  category: "free" | "flash" | "pro" | "openai";
  isFree: boolean;
  provider?: "bazaarlink" | "gemini" | "openai";
}

export interface MemoryItem {
  id: string;
  text: string;
  dateAdded: string;
}

export interface UserLocation {
  city: string;
  region: string;
  country: string;
  ip: string;
  updatedAt: string;
}

export interface ProjectFile {
  name: string;
  content: string;
  language?: string;
  isEntry?: boolean;
}

export interface WebsiteVersion {
  version: number;
  prompt: string;
  code: string;
  timestamp: number;
}

export interface WebsiteProject {
  id: string;
  title: string;
  prompt: string;
  code: string;
  files?: ProjectFile[];
  createdAt: number;
  updatedAt: number;
  category?: string;
  versions: WebsiteVersion[];
}
