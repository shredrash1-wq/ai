import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Zap,
  Loader2,
  Trash2,
  CornerDownLeft,
  Bot,
  User,
  ArrowRight,
  ChevronDown,
  Layers,
  Code,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { StudioChatMessage, AIModelEngine } from "./types";

interface StudioChatProps {
  messages: StudioChatMessage[];
  isGenerating: boolean;
  generationStep: number;
  generationSteps: string[];
  selectedEngine: AIModelEngine;
  onSelectEngine: (engine: AIModelEngine) => void;
  onSendMessage: (prompt: string) => void;
  onClearChat: () => void;
  quickSuggestions: { title: string; desc: string; prompt: string }[];
}

export const StudioChat: React.FC<StudioChatProps> = ({
  messages,
  isGenerating,
  generationStep,
  generationSteps,
  selectedEngine,
  onSelectEngine,
  onSendMessage,
  onClearChat,
  quickSuggestions
}) => {
  const [inputPrompt, setInputPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll on new messages or generation progress
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating, generationStep]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputPrompt.trim();
    if (!trimmed || isGenerating) return;
    onSendMessage(trimmed);
    setInputPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111216] border-r border-zinc-800/80 select-text overflow-hidden">
      {/* CHAT HEADER */}
      <div className="h-12 px-3.5 bg-[#14151a] border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs text-white tracking-wide truncate">
              AI Chat & Builder
            </span>
            <span className="text-[10px] text-indigo-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Crazy AI Architect • Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              title="Clear chat history"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-zinc-800/60 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* CHAT MESSAGES FEED */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {messages.length === 0 ? (
          /* EMPTY STATE WITH QUICK SUGGESTIONS */
          <div className="h-full flex flex-col justify-center text-center px-2 py-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-white mb-1">
              What do you want to build?
            </h3>
            <p className="text-xs text-slate-400 mb-4 max-w-xs mx-auto leading-relaxed">
              Describe your website or app idea. The AI will generate all code files and display the live preview on the right.
            </p>

            <div className="space-y-2 text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
                Prompt Starters
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {quickSuggestions.slice(0, 4).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(item.prompt)}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/90 text-left transition group flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-xs text-white group-hover:text-blue-400 transition truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {item.desc}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 shrink-0 transition" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* MESSAGE HISTORY */
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1.5 ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 px-1">
                {msg.role === "user" ? (
                  <>
                    <span>You</span>
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    <span className="text-blue-400 font-semibold">Aether Studio AI</span>
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </>
                )}
              </div>

              <div
                className={`max-w-[95%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-xs shadow-md"
                    : "bg-zinc-900 border border-zinc-800 text-slate-200 rounded-bl-xs shadow-md"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Followup suggestion chips */}
                {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-wrap gap-1.5">
                    {msg.suggestedPrompts.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => onSendMessage(sug)}
                        className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] text-blue-300 hover:text-white border border-zinc-700/60 transition text-left"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* ACTIVE GENERATING INDICATOR */}
        {isGenerating && (
          <div className="flex flex-col gap-1.5 items-start animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-semibold px-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Building website...</span>
            </div>
            <div className="w-full rounded-2xl p-3 bg-zinc-900/90 border border-blue-800/60 text-xs shadow-md">
              <div className="flex items-center gap-2 mb-2 text-blue-300 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400 shrink-0" />
                <span>{generationSteps[generationStep] || "Synthesizing web app..."}</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, ((generationStep + 1) / generationSteps.length) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* BOTTOM PROMPT INPUT CONTAINER */}
      <div className="p-3 bg-[#131419] border-t border-zinc-800/80 shrink-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {/* AI ENGINE SELECTOR STRIP */}
          <div className="flex items-center justify-between px-1">
            <div className="relative inline-flex items-center">
              <select
                value={selectedEngine}
                onChange={(e) => onSelectEngine(e.target.value as AIModelEngine)}
                className="text-[11px] font-medium bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 pr-6 text-slate-300 hover:text-white cursor-pointer focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="claude-3.5-sonnet">🧠 Claude 3.5 Sonnet (Free AI / Anthropic)</option>
                <option value="gemini-3.8-flash">⚡ Gemini 3.8 Flash (Studio Flagship AI)</option>
                <option value="gemini-3.1-pro">🧠 Gemini 3.1 Pro (Deep Architect)</option>
                <option value="qwen-coder">🚀 Qwen 2.5 Coder 32B (Crazy Free Coder)</option>
                <option value="deepseek-coder">⚡ DeepSeek V3 (Crazy AI Free)</option>
                <option value="gpt-4o">🔮 GPT-4o Omni (Free Web Architect)</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
            </div>

            <span className="text-[10px] text-slate-500 hidden sm:inline">
              Shift + Enter for new line
            </span>
          </div>

          {/* INPUT TEXTAREA & SEND BUTTON */}
          <div className="relative flex items-end bg-[#181920] border border-zinc-700/80 rounded-2xl p-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30 transition">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder="Describe your dream website or changes... (e.g. 'Build a crypto trading app with real charts and animated dark theme')"
              className="flex-1 bg-transparent px-2.5 py-1 text-xs text-slate-100 placeholder-slate-500 resize-none focus:outline-none leading-relaxed"
            />

            <button
              type="submit"
              disabled={isGenerating || !inputPrompt.trim()}
              className={`p-2.5 rounded-xl font-semibold flex items-center justify-center transition shrink-0 ${
                isGenerating || !inputPrompt.trim()
                  ? "bg-zinc-800 text-slate-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 cursor-pointer active:scale-95"
              }`}
              title="Send prompt to generate website"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
