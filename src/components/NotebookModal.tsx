import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import {
  X,
  Plus,
  BookOpen,
  Sparkles,
  Save,
  Trash2,
  Share2,
  FileText,
  UploadCloud,
  Check
} from "lucide-react";
import { Notebook } from "../types";

interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebooks: Notebook[];
  activeNotebook: Notebook | null;
  onSaveNotebook: (nb: Notebook) => void;
  onDeleteNotebook: (id: string) => void;
  onSynthesizeWithAI: (content: string) => void;
}

export const NotebookModal: React.FC<NotebookModalProps> = ({
  isOpen,
  onClose,
  notebooks,
  activeNotebook,
  onSaveNotebook,
  onDeleteNotebook,
  onSynthesizeWithAI
}) => {
  const [selectedId, setSelectedId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourcesCount, setSourcesCount] = useState(0);
  const [savedToast, setSavedToast] = useState(false);

  // Define handleCreateNew before useEffect to eliminate any TDZ ReferenceError
  const handleCreateNew = () => {
    const newId = `nb-${Date.now()}`;
    const newNb: Notebook = {
      id: newId,
      title: "Untitled Notebook",
      content: "# New Project Notes\n\nAdd research sources, bullet points, or paste documentation here to synthesize with Aetheris AI.",
      updatedAt: Date.now(),
      sourcesCount: 0,
      tags: ["Research"]
    };
    setSelectedId(newId);
    setTitle(newNb.title);
    setContent(newNb.content);
    setSourcesCount(0);
    onSaveNotebook(newNb);
  };

  const handleSave = () => {
    const targetId = selectedId || `nb-${Date.now()}`;
    const updated: Notebook = {
      id: targetId,
      title: title.trim() || "Untitled Notebook",
      content: content,
      updatedAt: Date.now(),
      sourcesCount: sourcesCount,
      tags: ["Research"]
    };
    setSelectedId(targetId);
    onSaveNotebook(updated);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1500);
  };

  // Synchronize modal state with activeNotebook or selected notebook
  useEffect(() => {
    if (!isOpen) return;

    if (activeNotebook) {
      setSelectedId(activeNotebook.id);
      setTitle(activeNotebook.title);
      setContent(activeNotebook.content);
      setSourcesCount(activeNotebook.sourcesCount || 0);
    } else if (notebooks.length > 0) {
      const match = notebooks.find((n) => n.id === selectedId) || notebooks[0];
      setSelectedId(match.id);
      setTitle(match.title);
      setContent(match.content);
      setSourcesCount(match.sourcesCount || 0);
    } else {
      setSelectedId("");
      setTitle("");
      setContent("");
      setSourcesCount(0);
    }
  }, [isOpen, activeNotebook, notebooks, selectedId]);

  if (!isOpen) return null;

  return (
    <div
      id="notebook-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="notebook-modal-container"
        className="bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-zinc-800 rounded-3xl w-full max-w-5xl h-[650px] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Aetheris Notebook Studio
              </h2>
              <p className="text-[11px] text-gray-500">
                Grounded multimodal synthesis & source analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              {savedToast ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedToast ? "Saved" : "Save"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Notebooks List */}
          <div className="w-64 border-r border-gray-200 dark:border-zinc-800 p-3 flex flex-col justify-between bg-gray-50/50 dark:bg-zinc-900/30">
            <div className="space-y-1 overflow-y-auto">
              <div className="flex items-center justify-between px-2 py-1 mb-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Your Notebooks
                </span>
                <button
                  onClick={handleCreateNew}
                  className="p-1 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                  title="New notebook"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {notebooks.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  <p className="mb-2">No notebooks yet</p>
                  <button
                    onClick={handleCreateNew}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium inline-flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create one</span>
                  </button>
                </div>
              ) : (
                notebooks.map((nb) => (
                  <button
                    key={nb.id}
                    onClick={() => {
                      setSelectedId(nb.id);
                      setTitle(nb.title);
                      setContent(nb.content);
                      setSourcesCount(nb.sourcesCount);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition ${
                      selectedId === nb.id
                        ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span className="truncate">{nb.title}</span>
                  </button>
                ))
              )}
            </div>

            {/* AI Synthesize Action */}
            <div className="pt-2 border-t border-gray-200 dark:border-zinc-800">
              <button
                disabled={!content.trim()}
                onClick={() => {
                  onSynthesizeWithAI(`Synthesize and analyze this notebook: \n\n# ${title}\n\n${content}`);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Synthesize with AI</span>
              </button>
            </div>
          </div>

          {/* Right Editor */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-white dark:bg-[#1e1f20]">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notebook Title"
              className="text-xl font-bold text-gray-900 dark:text-white bg-transparent border-0 focus:outline-none mb-4"
            />

            <textarea
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write or paste your markdown research notes here..."
              className="w-full flex-1 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40 text-sm font-mono text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />

            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>{content.split(/\s+/).filter(Boolean).length} words • {content.length} characters</span>
              {selectedId && (
                <button
                  onClick={() => {
                    if (confirm("Delete this notebook?")) {
                      onDeleteNotebook(selectedId);
                    }
                  }}
                  className="text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete notebook</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
