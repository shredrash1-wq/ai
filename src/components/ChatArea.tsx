import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import {
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Copy,
  MoreHorizontal,
  GitFork,
  Volume2,
  VolumeX,
  FileText,
  Mail,
  Pencil,
  Check,
  Sparkles,
  ShieldAlert,
  Ghost,
  Share2,
  Code2,
  Compass,
  Lightbulb,
  FileCode,
  Download,
  Maximize2,
  X,
  Menu,
  ChevronDown,
  Plus,
  Code
} from "lucide-react";
import { Message, User, Chat } from "../types";
import { speakText, stopSpeaking } from "../utils/storage";
import { AI_MODELS } from "../utils/models";
import { CodeBlock } from "./CodeBlock";

const ChatGeneratedImage: React.FC<{ src?: string; alt?: string }> = ({ src, alt }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!src) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${(alt || "gemini_generated_image").slice(0, 24).replace(/\s+/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(src, "_blank");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(src);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 not-prose">
      <div className="group relative rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 shadow-md max-w-xl transition hover:shadow-lg">
        {!hasLoaded && (
          <div className="aspect-square w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-zinc-800 text-gray-400 animate-pulse">
            <Sparkles className="w-6 h-6 text-purple-500 animate-spin mb-2" />
            <span className="text-xs">Loading visual render...</span>
          </div>
        )}
        <img
          src={src}
          alt={alt || "Generated Image"}
          referrerPolicy="no-referrer"
          onLoad={() => setHasLoaded(true)}
          className={`w-full h-auto object-cover max-h-[500px] cursor-pointer transition-all duration-300 ${hasLoaded ? "opacity-100" : "opacity-0 absolute"}`}
          onClick={() => setIsZoomed(true)}
        />

        {/* Hover Actions Toolbar */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md p-1 rounded-xl">
          <button
            type="button"
            onClick={handleCopyLink}
            title="Copy image link"
            className="p-1.5 rounded-lg text-white hover:bg-white/20 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            title="Download image"
            className="p-1.5 rounded-lg text-white hover:bg-white/20 transition"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsZoomed(true)}
            title="View Fullscreen"
            className="p-1.5 rounded-lg text-white hover:bg-white/20 transition"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Footer info pill */}
        <div className="px-3.5 py-2 bg-white/90 dark:bg-zinc-900/90 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          <span className="truncate max-w-[70%] italic">{alt || "Visual Generation"}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
            Gemini Vision
          </span>
        </div>
      </div>

      {/* Lightbox */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={src}
              alt={alt || "Fullscreen view"}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] w-auto rounded-2xl shadow-2xl border border-white/10"
            />
            <div className="mt-3 flex items-center justify-between w-full text-white px-2">
              <span className="text-xs text-gray-300 truncate max-w-md">{alt}</span>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-medium text-white flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ChatAreaProps {
  chat: Chat;
  user: User;
  isLoading: boolean;
  onRedo: (messageId: string) => void;
  onEditPrompt: (text: string) => void;
  onBranchChat: (messageIndex: number) => void;
  isTemporaryChat: boolean;
  onToggleTemporaryChat: () => void;
  onSelectSuggestion: (text: string) => void;
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  onOpenSettings?: () => void;
  onToggleProfilePopup?: () => void;
  selectedModel?: string;
  onOpenModelSelector?: () => void;
  onOpenCodeStudio?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  chat,
  user,
  isLoading,
  onRedo,
  onEditPrompt,
  onBranchChat,
  isTemporaryChat,
  onToggleTemporaryChat,
  onSelectSuggestion,
  onToggleSidebar,
  onNewChat,
  onOpenSettings,
  onToggleProfilePopup,
  selectedModel = "auto:free",
  onOpenModelSelector,
  onOpenCodeStudio
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [activeMoreMenuId, setActiveMoreMenuId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<{ [msgId: string]: "like" | "dislike" }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: "end" });
    }
  };

  useEffect(() => {
    scrollToBottom("smooth");
  }, [chat.messages, isLoading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string, id: string) => {
    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      stopSpeaking();
      setSpeakingId(id);
      speakText(text, () => setSpeakingId(null));
    }
  };

  const handleExportToDocs = (content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aetheris-export-${Date.now()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    setActiveMoreMenuId(null);
  };

  const handleDraftInGmail = (content: string) => {
    const subject = encodeURIComponent("Drafted via Aetheris AI");
    const body = encodeURIComponent(content.slice(0, 1500));
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, "_blank");
    setActiveMoreMenuId(null);
  };

  const suggestions = [
    { title: "Brainstorm concepts", desc: "Generate innovative ideas for a new product", icon: Lightbulb },
    { title: "Write code", desc: "Build a TypeScript component with clean architecture", icon: Code2 },
    { title: "Deep research", desc: "Synthesize latest findings on quantum computing", icon: Compass },
    { title: "Draft document", desc: "Compose an executive brief for team review", icon: FileText }
  ];

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel) || AI_MODELS[0];

  return (
    <div className="flex-1 flex flex-col h-full w-full max-w-full min-w-0 overflow-hidden bg-white dark:bg-[#131314] text-[#1F1F1F] dark:text-gray-100 relative">
      {/* Mobile Top Navigation Bar (Shown on small screens) */}
      <header className="flex md:hidden items-center justify-between px-3 py-2 border-b border-[#E3E3E3] dark:border-zinc-800 bg-[#F0F4F9]/90 dark:bg-[#141517]/90 backdrop-blur-md shrink-0 select-none z-30">
        <div className="flex items-center gap-2">
          {/* Hamburger Drawer Toggle */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={onToggleSidebar}
            title="Open chats & navigation"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#444746] dark:text-gray-300 hover:bg-[#E1E5EA] dark:hover:bg-zinc-800 active:scale-95 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Active Model Engine Chip */}
          <button
            id="mobile-header-model-pill"
            onClick={onOpenModelSelector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-[#E3E3E3] dark:border-zinc-700 text-xs font-semibold text-[#1F1F1F] dark:text-white shadow-2xs active:scale-95 transition"
          >
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                currentModel.provider === "gemini"
                  ? "bg-blue-500"
                  : currentModel.provider === "openai"
                  ? "bg-sky-500"
                  : "bg-emerald-500"
              }`}
            />
            <span className="truncate max-w-[120px]">{currentModel.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Code Option Button (Mobile) */}
          {onOpenCodeStudio && (
            <button
              id="mobile-header-code-studio-btn"
              onClick={onOpenCodeStudio}
              title="Aether Studio: Prompt to Website (Code Option)"
              className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs active:scale-95 transition"
            >
              <Code className="w-4 h-4" />
            </button>
          )}

          {/* Quick New Chat Button */}
          <button
            id="mobile-header-new-chat-btn"
            onClick={onNewChat}
            title="New chat"
            className="w-9 h-9 rounded-full bg-[#D3E3FD] dark:bg-blue-950/80 text-[#041E49] dark:text-blue-200 flex items-center justify-center shadow-xs active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Quick Profile Button */}
          <button
            id="mobile-header-profile-btn"
            onClick={onToggleProfilePopup}
            title="Profile & Settings"
            className="w-8 h-8 rounded-full bg-[#1A73E8] text-white flex items-center justify-center text-xs font-bold shadow-xs active:scale-95 transition"
          >
            {user.avatarLetter}
          </button>
        </div>
      </header>

      {/* Desktop Top Bar (Artistic Flair Header) */}
      <header className="hidden md:flex items-center justify-between p-4 border-b border-transparent shrink-0 select-none">
        <div className="flex items-center gap-2 pl-2">
          <span className="text-sm font-semibold text-[#444746] dark:text-gray-300">
            {chat.title || "Aetheris AI"}
          </span>
          {chat.temporary && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <Ghost className="w-3 h-3" />
              <span>Temporary</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Code Option -> Aether Studio Prompt to Website */}
          {onOpenCodeStudio && (
            <button
              id="top-code-studio-btn"
              onClick={onOpenCodeStudio}
              title="Aether Studio: Prompt to Website (Code Option)"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition active:scale-95"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Aether Studio</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-800 text-[10px] font-bold">STUDIO</span>
            </button>
          )}

          {/* Turn on / off temporary chat button */}
          <button
            id="temp-chat-toggle-btn"
            onClick={onToggleTemporaryChat}
            className={`flex items-center gap-2 px-4 py-2 hover:bg-[#F0F4F9] dark:hover:bg-zinc-800 rounded-full text-xs font-medium transition-colors border ${
              isTemporaryChat
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800"
                : "text-[#444746] dark:text-gray-300 border-[#E3E3E3] dark:border-zinc-800"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isTemporaryChat ? "bg-amber-500" : "bg-green-500"}`} />
            <span className="hidden sm:inline">
              {isTemporaryChat ? "Temporary chat is on" : "Turn on temporary chat"}
            </span>
          </button>

          {/* Upgrade Button */}
          <button
            id="top-upgrade-btn"
            onClick={() => alert("Upgrading gives you unlimited access to Gemini 3.1 Pro and high-definition video synthesis.")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#D3E3FD] dark:bg-blue-950/70 hover:bg-[#c2d7fa] dark:hover:bg-blue-900/70 text-[#041E49] dark:text-blue-200 text-xs font-semibold transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upgrade</span>
          </button>

          {/* More menu */}
          <button
            id="top-more-menu-btn"
            onClick={() => alert("AETHER Studio • Version 2.5 • Powered by Google Gemini")}
            className="p-2 rounded-full text-[#5F6368] hover:text-[#1F1F1F] dark:text-gray-400 dark:hover:text-white hover:bg-[#F0F4F9] dark:hover:bg-zinc-800 transition"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Messages Scroll Area - Highly responsive on mobile and desktop */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-16 pt-3 md:pt-6 pb-2 space-y-6 md:space-y-8 scroll-smooth">
        {chat.messages.length === 0 ? (
          /* Empty State Greeting: "Let's jump in, ( name )" matching Artistic Flair */
          <div className="h-full flex flex-col justify-center items-start max-w-3xl mx-auto my-auto py-6 sm:py-10">
            <div className="mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-[#4285F4] to-[#91B9FF] rounded-full flex items-center justify-center shadow-md mb-4 sm:mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                </svg>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#444746] dark:text-gray-300 leading-tight">
                Let's jump in, <span className="font-medium text-[#1F1F1F] dark:text-white">{user.name}</span>
              </h1>
            </div>

            {/* Aether Studio Code Option Hero Card */}
            {onOpenCodeStudio && (
              <div
                id="welcome-code-studio-hero-card"
                onClick={onOpenCodeStudio}
                className="w-full mb-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900/20 via-indigo-900/20 to-purple-900/20 border border-blue-500/30 hover:border-blue-500/60 dark:bg-zinc-900/80 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0 group-hover:scale-105 transition-transform">
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-500 transition">
                        Aether Studio • Prompt to Website
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                        STUDIO
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Prompt-to-Website IDE with live sandboxed preview, hot-reload code editor, and auto-saved projects
                    </p>
                  </div>
                </div>
                <button className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 shadow transition flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Launch Studio
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full text-left">
              {suggestions.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectSuggestion(s.title + ": " + s.desc)}
                    className="p-3 sm:p-4 rounded-2xl border border-[#E3E3E3] dark:border-zinc-800 bg-[#F0F4F9]/60 dark:bg-zinc-900/40 hover:bg-[#E1E5EA] dark:hover:bg-zinc-800/80 active:scale-[0.98] transition text-left group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-xs text-[#1F1F1F] dark:text-white group-hover:text-[#1A73E8] dark:group-hover:text-blue-400 transition">
                        {s.title}
                      </span>
                      <Icon className="w-4 h-4 text-[#5F6368] group-hover:text-[#1A73E8] transition" />
                    </div>
                    <p className="text-[11px] text-[#5F6368] dark:text-gray-400 line-clamp-2">
                      {s.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Render Messages */
          <div className="max-w-3xl mx-auto space-y-8">
            {chat.messages.map((message, index) => {
              const isUser = message.role === "user";

              if (isUser) {
                return (
                  /* User Message: Artistic Flair Bubble */
                  <div key={message.id} className="flex flex-col items-end gap-1.5 sm:gap-2 group">
                    <div
                      id={`user-msg-${message.id}`}
                      className="bg-[#F0F4F9] dark:bg-[#282a2c] px-4 sm:px-6 py-2.5 sm:py-3 rounded-[20px] sm:rounded-[24px] text-[#1F1F1F] dark:text-gray-100 text-sm leading-relaxed whitespace-pre-wrap max-w-[92%] sm:max-w-[80%] shadow-2xs"
                    >
                      {message.content}

                      {/* Render attachments if any */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.attachments.map((att) => (
                            <div key={att.id} className="p-1 rounded-lg bg-white dark:bg-zinc-800 text-xs flex items-center gap-1.5 border border-[#E3E3E3] dark:border-zinc-700">
                              {att.base64 && att.type === "image" ? (
                                <img src={att.base64} alt={att.name} className="w-16 h-16 object-cover rounded-md" />
                              ) : (
                                <span className="font-medium px-1">{att.name}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions down under user message - touch friendly */}
                    <div className="flex gap-2 sm:gap-3 px-2 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        id={`copy-prompt-btn-${message.id}`}
                        onClick={() => handleCopy(message.content, `p-${message.id}`)}
                        className="p-1.5 text-[#5F6368] hover:bg-[#F0F4F9] dark:hover:bg-zinc-800 rounded-md transition flex items-center gap-1 text-xs active:scale-95"
                      >
                        {copiedId === `p-${message.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 text-[10px]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>

                      <button
                        id={`edit-prompt-btn-${message.id}`}
                        onClick={() => onEditPrompt(message.content)}
                        className="p-1.5 text-[#5F6368] hover:bg-[#F0F4F9] dark:hover:bg-zinc-800 rounded-md transition active:scale-95"
                        title="Edit prompt"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              }

              /* AI Message: Artistic Flair styling */
              return (
                <div key={message.id} className="flex flex-col gap-2 text-left">
                  <div className="flex gap-2.5 sm:gap-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-tr from-[#4285F4] to-[#91B9FF] rounded-full flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                      </svg>
                    </div>

                    <div className="flex-1 text-[#1F1F1F] dark:text-gray-100 leading-relaxed text-sm min-w-0">
                      <div className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed text-[#1F1F1F] dark:text-gray-200">
                        <Markdown
                          components={{
                            p({ node, children, ...props }: any) {
                              const hasBlock =
                                node?.children?.some(
                                  (c: any) =>
                                    c.tagName === "img" ||
                                    c.tagName === "div" ||
                                    c.tagName === "pre" ||
                                    c.type === "image"
                                ) ||
                                React.Children.toArray(children).some((child: any) => {
                                  if (!child || typeof child !== "object") return false;
                                  return (
                                    child.type === ChatGeneratedImage ||
                                    child.type === CodeBlock ||
                                    child.type === "img" ||
                                    child.props?.src !== undefined ||
                                    child.props?.node?.tagName === "img"
                                  );
                                });

                              if (hasBlock) {
                                return (
                                  <div className="mb-4 last:mb-0" {...props}>
                                    {children}
                                  </div>
                                );
                              }

                              return (
                                <p className="mb-4 last:mb-0 leading-relaxed" {...props}>
                                  {children}
                                </p>
                              );
                            },
                            img({ src, alt }) {
                              return (
                                <ChatGeneratedImage
                                  src={src}
                                  alt={alt}
                                />
                              );
                            },
                            pre({ children }) {
                              return <>{children}</>;
                            },
                            code({ node, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || "");
                              const rawString = String(children).replace(/\n$/, "");
                              const isMultiLine = rawString.includes("\n");
                              const isHtmlSnippet = /<[a-zA-Z][\s\S]*>/i.test(rawString);
                              const hasLanguage = !!match;

                              // Only render as inline code badge if it's strictly a short phrase without HTML markup
                              if (!hasLanguage && !isMultiLine && !isHtmlSnippet && rawString.length < 60) {
                                return (
                                  <code
                                    className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 font-mono text-[13px] text-pink-600 dark:text-pink-400 border border-gray-200 dark:border-zinc-700"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              }

                              return (
                                <CodeBlock
                                  language={match ? match[1] : (isHtmlSnippet ? "html" : "")}
                                  code={rawString}
                                />
                              );
                            }
                          }}
                        >
                          {message.content}
                        </Markdown>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons below AI reply */}
                  <div className="flex gap-2 ml-12 items-center relative select-none">
                    {/* Thumbs Up */}
                    <button
                      id={`ai-like-btn-${message.id}`}
                      onClick={() => {
                        setReactions((prev) => ({
                          ...prev,
                          [message.id]: prev[message.id] === "like" ? undefined as any : "like"
                        }));
                      }}
                      title="Good response"
                      className={`p-2 rounded-full transition ${
                        reactions[message.id] === "like"
                          ? "text-[#1A73E8] bg-[#D3E3FD] dark:bg-blue-950/60"
                          : "text-[#5F6368] hover:bg-[#F0F4F9] dark:hover:bg-zinc-800"
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>

                    {/* Thumbs Down */}
                    <button
                      id={`ai-dislike-btn-${message.id}`}
                      onClick={() => {
                        setReactions((prev) => ({
                          ...prev,
                          [message.id]: prev[message.id] === "dislike" ? undefined as any : "dislike"
                        }));
                      }}
                      title="Bad response"
                      className={`p-2 rounded-full transition ${
                        reactions[message.id] === "dislike"
                          ? "text-red-600 bg-red-100 dark:bg-red-950/60"
                          : "text-[#5F6368] hover:bg-[#F0F4F9] dark:hover:bg-zinc-800"
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>

                    {/* Redo */}
                    <button
                      id={`ai-redo-btn-${message.id}`}
                      onClick={() => onRedo(message.id)}
                      title="Regenerate response"
                      className="p-2 text-[#5F6368] hover:bg-[#F0F4F9] dark:hover:bg-zinc-800 rounded-full transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Copy */}
                    <button
                      id={`ai-copy-btn-${message.id}`}
                      onClick={() => handleCopy(message.content, message.id)}
                      title="Copy response"
                      className="p-2 text-[#5F6368] hover:bg-[#F0F4F9] dark:hover:bg-zinc-800 rounded-full transition"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* Listen */}
                    <button
                      id={`ai-listen-btn-${message.id}`}
                      onClick={() => handleSpeak(message.content, message.id)}
                      title={speakingId === message.id ? "Stop reading" : "Listen aloud"}
                      className={`p-2 rounded-full transition ${
                        speakingId === message.id
                          ? "text-[#1A73E8] bg-[#D3E3FD] dark:bg-blue-950/60"
                          : "text-[#5F6368] hover:bg-[#F0F4F9] dark:hover:bg-zinc-800"
                      }`}
                    >
                      {speakingId === message.id ? (
                        <VolumeX className="w-4 h-4 animate-pulse" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>

                    {/* More Menu */}
                    <div className="relative">
                      <button
                        id={`ai-more-btn-${message.id}`}
                        onClick={() => setActiveMoreMenuId(activeMoreMenuId === message.id ? null : message.id)}
                        title="More options"
                        className="p-2 text-[#5F6368] hover:bg-[#F0F4F9] dark:hover:bg-zinc-800 rounded-full transition"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {activeMoreMenuId === message.id && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setActiveMoreMenuId(null)}
                          />
                          <div className="absolute left-0 bottom-10 z-40 w-52 bg-white dark:bg-[#1f2022] border border-[#E3E3E3] dark:border-zinc-800 rounded-2xl shadow-xl p-1.5 space-y-0.5 animate-in fade-in">
                            <button
                              onClick={() => {
                                onBranchChat(index);
                                setActiveMoreMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#444746] dark:text-gray-300 hover:bg-[#F0F4F9] dark:hover:bg-zinc-800 transition text-left"
                            >
                              <GitFork className="w-3.5 h-3.5 text-[#1A73E8]" />
                              <span>Branch in new chat</span>
                            </button>

                            <button
                              onClick={() => {
                                handleSpeak(message.content, message.id);
                                setActiveMoreMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#444746] dark:text-gray-300 hover:bg-[#F0F4F9] dark:hover:bg-zinc-800 transition text-left"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                              <span>Listen</span>
                            </button>

                            <button
                              onClick={() => handleExportToDocs(message.content)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#444746] dark:text-gray-300 hover:bg-[#F0F4F9] dark:hover:bg-zinc-800 transition text-left"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Export to Docs</span>
                            </button>

                            <button
                              onClick={() => handleDraftInGmail(message.content)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#444746] dark:text-gray-300 hover:bg-[#F0F4F9] dark:hover:bg-zinc-800 transition text-left"
                            >
                              <Mail className="w-3.5 h-3.5 text-rose-600" />
                              <span>Draft in Gmail</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Thinking Indicator */}
            {isLoading && (
              <div className="flex gap-4 text-left animate-in fade-in">
                <div className="w-8 h-8 bg-gradient-to-tr from-[#4285F4] to-[#91B9FF] rounded-full flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#5F6368] dark:text-gray-400 py-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#4285F4] animate-bounce" />
                  <span className="inline-block w-2 h-2 rounded-full bg-[#91B9FF] animate-bounce [animation-delay:0.2s]" />
                  <span className="inline-block w-2 h-2 rounded-full bg-[#1A73E8] animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 font-medium">AETHER is thinking...</span>
                </div>
              </div>
            )}

            {/* Auto scroll anchor */}
            <div ref={messagesEndRef} className="h-4 shrink-0" />
          </div>
        )}
      </div>

      {/* Bottom disclaimer: Artistic Flair Spec */}
      <div className="py-2 text-center text-[10px] text-[#5F6368] dark:text-gray-400 select-none shrink-0">
        AETHER can make mistakes. Check important info.
      </div>
    </div>
  );
};
