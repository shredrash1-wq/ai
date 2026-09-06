import { User, Chat, Notebook, MemoryItem, UserLocation } from "../types";

export const DEFAULT_USER: User = {
  id: "guest-user",
  name: "Guest User",
  email: "guest@aetheris.ai",
  avatarColor: "bg-[#0b57d0]",
  avatarLetter: "G",
  plan: "Guest Account",
  hasRecoveryPhone: false
};

const STORAGE_KEYS = {
  USER: "aetheris_user_v2",
  CHATS: "aetheris_chats_v2",
  NOTEBOOKS: "aetheris_notebooks_v2",
  MEMORIES: "aetheris_memories_v2",
  THEME: "aetheris_theme",
  TEMP_CHAT: "aetheris_temp_chat",
  ACTIVE_CHAT_ID: "aetheris_active_chat_id"
};

// No pre-created chats, notes, or memories for new visitors
export const INITIAL_CHATS: Chat[] = [];
export const INITIAL_NOTEBOOKS: Notebook[] = [];
export const INITIAL_MEMORIES: MemoryItem[] = [];

export function getStoredUser(): User {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_USER;
}

export function saveStoredUser(user: User): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredChats(): Chat[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHATS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_CHATS;
}

export function saveStoredChats(chats: Chat[]): void {
  try {
    // Only persist non-temporary chats
    const persistable = chats.filter(c => !c.temporary);
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(persistable));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredNotebooks(): Notebook[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTEBOOKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_NOTEBOOKS;
}

export function saveStoredNotebooks(notebooks: Notebook[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTEBOOKS, JSON.stringify(notebooks));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredMemories(): MemoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMORIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_MEMORIES;
}

export function saveStoredMemories(memories: MemoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredLocation(): UserLocation {
  return {
    city: "San Francisco",
    region: "California",
    country: "United States",
    ip: "192.168.1.1",
    updatedAt: "Just now"
  };
}

// Text to speech helpers
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(text: string, onEnd?: () => void): void {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  // Strip markdown formatting for cleaner audio
  const clean = text
    .replace(/```[\s\S]*?```/g, "Code snippet omitted.")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~#]/g, "")
    .trim();

  currentUtterance = new SpeechSynthesisUtterance(clean);
  currentUtterance.rate = 1.05;
  currentUtterance.pitch = 1.0;

  if (onEnd) {
    currentUtterance.onend = onEnd;
    currentUtterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(currentUtterance);
}

export function stopSpeaking(): void {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
