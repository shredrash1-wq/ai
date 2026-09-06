import React, { useRef, useState } from "react";
import {
  RotateCw,
  ExternalLink,
  Download,
  Sparkles,
  ArrowRight,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  Code
} from "lucide-react";
import { ViewportMode } from "./types";

interface StudioPreviewProps {
  htmlCode: string;
  viewport: ViewportMode;
  onSelectPromptSuggestion: (prompt: string) => void;
  quickSuggestions: { title: string; desc: string; prompt: string }[];
  projectTitle: string;
}

export const StudioPreview: React.FC<StudioPreviewProps> = ({
  htmlCode,
  viewport,
  onSelectPromptSuggestion,
  quickSuggestions,
  projectTitle
}) => {
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleOpenInNewWindow = () => {
    if (!htmlCode) return;
    const blob = new Blob([htmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleDownloadHtml = () => {
    if (!htmlCode) return;
    const blob = new Blob([htmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeTitle = (projectTitle || "website").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.download = `${safeTitle}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!htmlCode || htmlCode.trim().length < 10) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center p-6 text-center overflow-y-auto bg-[#0a0b0e]">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white mb-4 shadow-2xl shadow-blue-500/25 ring-1 ring-white/10">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/80 text-blue-400 text-xs font-semibold mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          AETHER STUDIO • LIVE WORKSPACE
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Preview will appear here
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
          Type your idea in the chat on the left to auto-generate your web app, or choose a prompt starter below.
        </p>

        {/* PROMPT STARTER CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-4xl text-left">
          {quickSuggestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSelectPromptSuggestion(item.prompt)}
              className="p-3.5 rounded-2xl bg-[#121318] hover:bg-[#181922] border border-zinc-800/80 hover:border-blue-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-xs text-white group-hover:text-blue-400 transition">
                    {item.title}
                  </h4>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-blue-400 font-semibold">
                <span>⚡ Auto Build</span>
                <span className="text-slate-500">~1s</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-[#0a0b0e] overflow-hidden">
      {/* PREVIEW SUB-HEADER */}
      <div className="h-9 px-3 bg-[#111216] border-b border-zinc-800 flex items-center justify-between text-xs text-slate-400 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-medium text-[11px] text-slate-300">Live Preview</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Reload iframe */}
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            title="Reload preview"
            className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition text-slate-400"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Open in new window */}
          <button
            onClick={handleOpenInNewWindow}
            title="Open in new window"
            className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition text-slate-400"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Download HTML */}
          <button
            onClick={handleDownloadHtml}
            title="Download preview HTML"
            className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition text-slate-400"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
          </button>
        </div>
      </div>

      {/* PREVIEW CANVAS CONTAINER WITH VIEWPORT FRAMING */}
      <div className="flex-1 overflow-hidden p-2 sm:p-4 flex items-center justify-center">
        <div
          className={`h-full transition-all duration-300 flex flex-col items-center justify-center ${
            viewport === "desktop"
              ? "w-full max-w-full"
              : viewport === "tablet"
              ? "w-[768px] max-w-full"
              : "w-[375px] max-w-full"
          }`}
        >
          <div
            className={`w-full h-full rounded-2xl overflow-hidden bg-white shadow-2xl flex flex-col border ${
              viewport === "mobile"
                ? "border-zinc-700 ring-8 ring-zinc-900 rounded-[36px]"
                : viewport === "tablet"
                ? "border-zinc-700 ring-4 ring-zinc-900 rounded-3xl"
                : "border-zinc-800"
            }`}
          >
            {viewport === "mobile" && (
              <div className="h-6 bg-zinc-900 flex items-center justify-center shrink-0">
                <div className="w-20 h-3 bg-black rounded-full"></div>
              </div>
            )}

            <iframe
              key={reloadKey}
              ref={iframeRef}
              srcDoc={htmlCode}
              title="Aether Studio Preview"
              sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
              className="w-full flex-1 border-0 bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
