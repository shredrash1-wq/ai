import React, { useState } from "react";
import {
  X,
  Search,
  Plus,
  Trash2,
  Copy,
  Download,
  ExternalLink,
  Code,
  Globe,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { WebsiteProject } from "../types";

interface SavedWebsitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  websites: WebsiteProject[];
  currentProjectId: string;
  onSelectProject: (project: WebsiteProject) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (project: WebsiteProject) => void;
}

export const SavedWebsitesModal: React.FC<SavedWebsitesModalProps> = ({
  isOpen,
  onClose,
  websites,
  currentProjectId,
  onSelectProject,
  onNewProject,
  onDeleteProject,
  onDuplicateProject
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filtered = websites.filter(
    (w) =>
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.category && w.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDownload = (site: WebsiteProject, e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([site.code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${site.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "website"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenNewWindow = (site: WebsiteProject, e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([site.code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#18191c] text-slate-900 dark:text-slate-100 w-full max-w-4xl h-[85vh] max-h-[750px] rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg leading-tight">My Saved Websites</h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                  {websites.length} projects
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Web applications generated and customized in Aether Studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNewProject();
                onClose();
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create New App</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-3 sm:px-5 sm:py-3 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18191c] flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search websites by title, prompt, or category..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:border-blue-500 text-slate-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => {
              onNewProject();
              onClose();
            }}
            className="sm:hidden px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Grid of Saved Websites */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 mb-4">
                <Code className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-base mb-1">0 Websites Saved</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                {searchQuery
                  ? "No saved websites match your search query."
                  : "You currently have 0 saved websites. Enter a prompt in Aether Studio to auto-generate your first one!"}
              </p>
              <button
                onClick={() => {
                  onNewProject();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
              >
                <Sparkles className="w-3.5 h-3.5" /> Start Building
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((site) => {
                const isCurrent = site.id === currentProjectId;
                const dateStr = new Date(site.updatedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                });

                return (
                  <div
                    key={site.id}
                    onClick={() => {
                      onSelectProject(site);
                      onClose();
                    }}
                    className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between bg-white dark:bg-zinc-900/70 hover:shadow-lg ${
                      isCurrent
                        ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md shadow-blue-500/10"
                        : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div>
                      {/* Badge and Active Indicator */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold tracking-wide uppercase">
                          {site.category || "Web App"}
                        </span>
                        {isCurrent && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            Active
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {site.title}
                      </h3>

                      {/* Prompt preview */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {site.prompt}
                      </p>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {dateStr}
                        </span>
                        {site.versions?.length > 1 && (
                          <span className="flex items-center gap-0.5 text-slate-500 font-mono">
                            <Layers className="w-3 h-3" />
                            v{site.versions.length}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => handleOpenNewWindow(site, e)}
                          title="Open live preview in new tab"
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDownload(site, e)}
                          title="Download single-file HTML"
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateProject(site);
                          }}
                          title="Duplicate app"
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${site.title}"?`)) {
                              onDeleteProject(site.id);
                            }
                          }}
                          title="Delete app"
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
