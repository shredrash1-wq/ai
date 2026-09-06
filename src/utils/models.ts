import { AIModel } from "../types";

export const AI_MODELS: AIModel[] = [
  // --- GOOGLE GEMINI (PRIMARY & PRODUCTION-GRADE) ---
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    badge: "Recommended",
    description: "Google's latest flagship multimodal model delivering cutting-edge speed, reasoning, and comprehensive knowledge.",
    category: "flash",
    isFree: true,
    provider: "gemini"
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini Flash Lite",
    badge: "Ultra Fast",
    description: "Google's ultra-efficient low-latency model for instantaneous replies and coding tips.",
    category: "flash",
    isFree: true,
    provider: "gemini"
  },
  {
    id: "gemini-3.1-flash-image",
    name: "Gemini Flash Image",
    badge: "Image Studio",
    description: "Google's dedicated multimodal visual generation model for creating high-resolution artwork and graphics.",
    category: "flash",
    isFree: true,
    provider: "gemini"
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    badge: "Deep Reasoning",
    description: "High-intelligence model designed for complex multi-step reasoning, mathematical proofs, and system architecture.",
    category: "pro",
    isFree: false,
    provider: "gemini"
  },

  // --- SMART AUTO ROUTER ---
  {
    id: "auto:free",
    name: "Aetheris Auto",
    badge: "Smart Free",
    description: "Automatic high-availability engine selecting the best available model with zero downtime.",
    category: "free",
    isFree: true,
    provider: "gemini"
  },

  // --- OPENAI CHATGPT ---
  {
    id: "gpt-4o-mini",
    name: "ChatGPT 4o Mini",
    badge: "OpenAI",
    description: "Fast, intelligent, and flexible model from OpenAI for everyday conversations.",
    category: "openai",
    isFree: true,
    provider: "openai"
  },
  {
    id: "gpt-4o",
    name: "ChatGPT 4o",
    badge: "OpenAI Flagship",
    description: "Advanced intelligence flagship model from OpenAI for in-depth analysis.",
    category: "openai",
    isFree: false,
    provider: "openai"
  }
];
