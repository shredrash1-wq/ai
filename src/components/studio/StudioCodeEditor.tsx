import React, { useState, useEffect, useRef } from "react";
import {
  Copy,
  Check,
  Download,
  FileCode,
  Save,
  RotateCcw,
  CheckCircle2,
  FileText
} from "lucide-react";
import { ProjectFile } from "../../types";
import { downloadSingleFile, getFileLanguage } from "./bundleUtils";

interface StudioCodeEditorProps {
  file: ProjectFile | null;
  onCodeChange: (newContent: string) => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export const StudioCodeEditor: React.FC<StudioCodeEditorProps> = ({
  file,
  onCodeChange,
  onSave,
  isSaved = true
}) => {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const content = file?.content || "";
  const linesCount = Math.max(1, content.split("\n").length);

  // Sync scroll between line numbers gutter and textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Support Tab indentation
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newContent = content.substring(0, start) + "  " + content.substring(end);
      onCodeChange(newContent);

      // restore cursor
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  if (!file) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center text-slate-500 bg-[#0e0f14] p-6 text-center">
        <FileCode className="w-10 h-10 mb-2 opacity-40" />
        <p className="text-xs">No file selected. Click a file from the explorer on the left to edit.</p>
      </div>
    );
  }

  const lang = getFileLanguage(file.name);

  return (
    <div className="flex-1 h-full flex flex-col bg-[#0d0e13] overflow-hidden">
      {/* EDITOR TOOLBAR */}
      <div className="h-10 px-3 bg-[#13141a] border-b border-zinc-800 flex items-center justify-between text-xs shrink-0 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="font-mono text-white font-semibold text-xs truncate">
            {file.name}
          </span>
          <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] text-slate-400 uppercase font-mono">
            {lang}
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            ({linesCount} lines, {content.length.toLocaleString()} chars)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Saved status */}
          <span className="text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-slate-400">
            {isSaved ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 text-[10px]">Saved</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300 text-[10px]">Unsaved</span>
              </>
            )}
          </span>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            title="Copy file contents"
            className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-slate-300 hover:text-white transition text-[11px]"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          {/* Download File Button */}
          <button
            onClick={() => downloadSingleFile(file)}
            title="Download this file"
            className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-slate-300 hover:text-white transition text-[11px]"
          >
            <Download className="w-3 h-3 text-blue-400" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* CODE EDITOR TEXTAREA WITH LINE NUMBERS */}
      <div className="flex-1 flex overflow-hidden relative font-mono text-xs sm:text-[13px] leading-6">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          className="w-10 sm:w-12 py-3 bg-[#0a0b0e] border-r border-zinc-800/80 text-right pr-2 text-slate-600 select-none overflow-hidden shrink-0"
        >
          {Array.from({ length: linesCount }, (_, i) => (
            <div key={i + 1} className="h-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Input Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onCodeChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          className="flex-1 h-full p-3 bg-transparent text-slate-200 resize-none focus:outline-none overflow-auto whitespace-pre selection:bg-blue-600/40 tab-size-2"
          placeholder="Type code here..."
        />
      </div>
    </div>
  );
};
