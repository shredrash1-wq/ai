import React, { useState } from "react";
import { X, Library, Bookmark, Code2, FileText, Copy, Trash2, ArrowRight } from "lucide-react";

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt
}) => {
  const [activeTab, setActiveTab] = useState<"prompts" | "code" | "docs">("prompts");

  const [savedItems, setSavedItems] = useState([
    {
      id: "lib-1",
      category: "prompts",
      title: "System Architect Persona",
      content: "Act as a Principal Cloud Architect. Review the following microservices architecture for scalability, latency, resilience, and failover design patterns."
    },
    {
      id: "lib-2",
      category: "prompts",
      title: "Executive Summarizer",
      content: "Read the provided document and produce a 3-bullet executive briefing, followed by key metrics, identified risks, and recommended action items."
    },
    {
      id: "lib-3",
      category: "code",
      title: "Vite + Express Proxy Endpoint",
      content: "import express from 'express';\nconst app = express();\napp.post('/api/stream', async (req, res) => {\n  // Streaming Gemini pipeline\n});"
    },
    {
      id: "lib-4",
      category: "docs",
      title: "Research Synthesis Template",
      content: "## Overview\n### Methodology\n### Empirical Findings\n### Recommendations"
    }
  ]);

  if (!isOpen) return null;

  const filtered = savedItems.filter((i) => i.category === activeTab);

  return (
    <div
      id="library-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="library-modal-container"
        className="bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl h-[580px] flex flex-col shadow-2xl overflow-hidden text-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Library className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Aetheris Library
              </h2>
              <p className="text-[11px] text-gray-500">
                Saved prompt templates, code references, and research drafts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-gray-200 dark:border-zinc-800">
          {[
            { id: "prompts", label: "Saved Prompts", icon: Bookmark },
            { id: "code", label: "Code Snippets", icon: Code2 },
            { id: "docs", label: "Templates", icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition ${
                  isActive
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-900/30 hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition flex flex-col justify-between"
            >
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono line-clamp-3 whitespace-pre-wrap">
                  {item.content}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-200/60 dark:border-zinc-800/60">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(item.content);
                    alert("Copied to clipboard!");
                  }}
                  className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>

                <button
                  onClick={() => {
                    onSelectPrompt(item.content);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <span>Use in Chat</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
