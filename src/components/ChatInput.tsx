import React, { useState, useRef } from "react";
import {
  Plus,
  X,
  Upload,
  HardDrive,
  Camera,
  UserCheck,
  BookOpen,
  Image as ImageIcon,
  Music,
  Layout,
  Microscope,
  GraduationCap,
  Sparkles,
  Mic,
  ArrowUp,
  ChevronDown,
  Paperclip,
  Brain
} from "lucide-react";
import { AIModel, Attachment } from "../types";
import { AI_MODELS } from "../utils/models";

interface ChatInputProps {
  onSendMessage: (text: string, attachments: Attachment[], mode?: string) => void;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onOpenVoiceMode: () => void;
  isLoading: boolean;
  onQuickAction: (actionType: string) => void;
  editingPrompt?: string | null;
  onCancelEditPrompt?: () => void;
  isModelPickerOpen?: boolean;
  onCloseModelPicker?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  selectedModel,
  onSelectModel,
  onOpenVoiceMode,
  isLoading,
  onQuickAction,
  editingPrompt,
  onCancelEditPrompt,
  isModelPickerOpen,
  onCloseModelPicker
}) => {
  const [inputText, setInputText] = useState(editingPrompt || "");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInternalDropdownOpen, setIsInternalDropdownOpen] = useState(false);
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activeMode, setActiveMode] = useState<string>("standard");

  const isModelDropdownOpen = isModelPickerOpen !== undefined ? (isModelPickerOpen || isInternalDropdownOpen) : isInternalDropdownOpen;
  const closeModelDropdown = () => {
    setIsInternalDropdownOpen(false);
    if (onCloseModelPicker) onCloseModelPicker();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Sync edit prompt if updated from parent
  React.useEffect(() => {
    if (editingPrompt !== undefined && editingPrompt !== null) {
      setInputText(editingPrompt);
    }
  }, [editingPrompt]);

  const handleSend = () => {
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(inputText.trim(), attachments, activeMode);
    setInputText("");
    setAttachments([]);
    setIsMenuOpen(false);
    if (onCancelEditPrompt) onCancelEditPrompt();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "file" | "image") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newAtt: Attachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        type: type,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        base64: reader.result as string
      };
      setAttachments((prev) => [...prev, newAtt]);
      setIsMenuOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel) || AI_MODELS[0];

  const toolsList = [
    { id: "upload-file", label: "Upload file", icon: Upload, action: () => fileInputRef.current?.click() },
    { id: "add-drive", label: "Add from Drive", icon: HardDrive, action: () => onQuickAction("drive") },
    { id: "upload-photo", label: "Upload photo", icon: Camera, action: () => imageInputRef.current?.click() },
    { id: "avatar", label: "Avatar", icon: UserCheck, action: () => onQuickAction("avatar") },
    { id: "notebook", label: "Notebook", icon: BookOpen, action: () => onQuickAction("notebook") },
    { id: "create-image", label: "Create image", icon: ImageIcon, action: () => onQuickAction("create-image") },
    { id: "create-music", label: "Create music", icon: Music, action: () => onQuickAction("create-music") },
    { id: "canvas", label: "Canvas", icon: Layout, action: () => { setActiveMode("canvas"); setIsMenuOpen(false); } },
    { id: "deep-research", label: "Deep research", icon: Microscope, action: () => { setActiveMode("deep-research"); setIsMenuOpen(false); } },
    { id: "guided-learning", label: "Guided learning", icon: GraduationCap, action: () => { setActiveMode("guided-learning"); setIsMenuOpen(false); } },
    { id: "personal-intelligence", label: "Personal intelligence", icon: Brain, action: () => onQuickAction("personal-intelligence") }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-3 relative">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e, "file")}
        className="hidden"
      />
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        onChange={(e) => handleFileUpload(e, "image")}
        className="hidden"
      />

      {/* Editing banner if user clicked 'Edit prompt' */}
      {editingPrompt !== null && editingPrompt !== undefined && (
        <div className="mb-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
          <span>Editing previous prompt</span>
          <button onClick={onCancelEditPrompt} className="hover:underline text-[11px]">
            Cancel
          </button>
        </div>
      )}

      {/* Mode Indicator tag if special tool selected */}
      {activeMode !== "standard" && (
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
            <Sparkles className="w-3 h-3" />
            <span className="capitalize">{activeMode.replace("-", " ")} mode active</span>
            <button onClick={() => setActiveMode("standard")} className="ml-1 hover:text-purple-950 dark:hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-800 dark:text-gray-200"
            >
              {att.type === "image" ? <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> : <Paperclip className="w-3.5 h-3.5 text-gray-500" />}
              <span className="truncate max-w-[140px] font-medium">{att.name}</span>
              <button
                onClick={() => setAttachments(attachments.filter((a) => a.id !== att.id))}
                className="hover:text-red-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Plus Menu Popup (Expansive tools drawer requested by user) */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            id="chat-plus-menu"
            className="absolute bottom-20 left-4 z-40 w-72 bg-white dark:bg-[#1f2022] border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-2.5 space-y-1 animate-in fade-in zoom-in-95 max-h-[390px] overflow-y-auto"
          >
            <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Add Content & Studio
            </div>

            <div className="space-y-0.5">
              {toolsList.slice(0, 5).map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      tool.action();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-left"
                  >
                    <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="my-1 border-t border-gray-100 dark:border-zinc-800" />
            <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Creative & Intelligence
            </div>

            <div className="space-y-0.5">
              {toolsList.slice(5).map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      tool.action();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-left"
                  >
                    <Icon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Model Selection Dropdown Popup */}
      {isModelDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 sm:bg-transparent backdrop-blur-2xs sm:backdrop-blur-none transition-opacity"
            onClick={closeModelDropdown}
          />
          <div
            id="model-dropdown-menu"
            className="fixed sm:absolute bottom-20 inset-x-3 sm:inset-x-auto sm:right-14 z-50 w-auto sm:w-96 max-w-[95vw] bg-white dark:bg-[#1f2022] border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-3 animate-in fade-in zoom-in-95 mx-auto"
          >
            <div className="flex items-center justify-between px-1 pb-2 border-b border-gray-100 dark:border-zinc-800">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Select Model Engine
              </span>
              <button
                onClick={closeModelDropdown}
                className="sm:hidden p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="hidden sm:inline-block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40">
                AETHER BOT • ChatGPT • Gemini
              </span>
            </div>

            {/* Provider Filter Tabs */}
            <div className="flex items-center gap-1 my-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: "all", label: "All" },
                { id: "gemini", label: "Gemini" },
                { id: "openai", label: "ChatGPT" },
                { id: "bazaarlink", label: "AETHER BOT" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setModelFilter(tab.id)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] font-medium transition ${
                    modelFilter === tab.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Model List */}
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {AI_MODELS.filter((m) =>
                modelFilter === "all" ? true : m.provider === modelFilter
              ).map((model) => {
                const isSelected = model.id === selectedModel;
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      onSelectModel(model.id);
                      closeModelDropdown();
                    }}
                    className={`w-full flex flex-col p-2.5 rounded-2xl transition text-left ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                        : "hover:bg-gray-100 dark:hover:bg-zinc-800 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-xs text-gray-900 dark:text-white">
                        {model.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          model.provider === "bazaarlink"
                            ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold"
                            : model.provider === "openai"
                            ? "bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400"
                            : "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400"
                        }`}
                      >
                        {model.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                      {model.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Mobile Quick Action Pill Bar (Shown on small screens for easy thumb access) */}
      <div className="flex sm:hidden items-center gap-1.5 px-2 mb-2 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          onClick={onOpenVoiceMode}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#E1E5EA] dark:bg-zinc-800 text-xs font-medium text-[#1F1F1F] dark:text-gray-200 shrink-0 active:scale-95 transition"
        >
          <Mic className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Live Voice</span>
        </button>

        <button
          type="button"
          onClick={() => onQuickAction("generate_images")}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#E1E5EA] dark:bg-zinc-800 text-xs font-medium text-[#1F1F1F] dark:text-gray-200 shrink-0 active:scale-95 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Image Studio</span>
        </button>

        <button
          type="button"
          onClick={() => onQuickAction("deep_research")}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#E1E5EA] dark:bg-zinc-800 text-xs font-medium text-[#1F1F1F] dark:text-gray-200 shrink-0 active:scale-95 transition"
        >
          <Brain className="w-3.5 h-3.5 text-purple-500" />
          <span>Research</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#E1E5EA] dark:bg-zinc-800 text-xs font-medium text-[#1F1F1F] dark:text-gray-200 shrink-0 active:scale-95 transition"
        >
          <Paperclip className="w-3.5 h-3.5 text-emerald-500" />
          <span>Upload</span>
        </button>
      </div>

      {/* Main Curved Typing Box (Artistic Flair spec) */}
      <div
        id="curved-chat-input-container"
        className="relative flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 sm:pr-4 rounded-[32px] bg-[#F0F4F9] dark:bg-[#1e1f20] border border-transparent focus-within:border-[#D3D3D3] dark:focus-within:border-zinc-700 shadow-xs transition-all duration-200"
      >
        {/* Plus / X Toggle Button (First Option) */}
        <button
          id="chat-plus-toggle-btn"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title={isMenuOpen ? "Close menu" : "Add attachments & tools"}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
            isMenuOpen
              ? "bg-[#D3D3D3] dark:bg-zinc-700 text-[#1F1F1F] dark:text-white rotate-90"
              : "text-[#444746] dark:text-gray-300 hover:bg-[#E1E5EA] dark:hover:bg-zinc-800"
          }`}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>

        {/* Text Input Area */}
        <div className="flex-1 flex items-center min-w-0">
          <textarea
            id="chat-textarea"
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Aetheris"
            className="w-full bg-transparent border-0 focus:ring-0 text-sm text-[#1F1F1F] dark:text-gray-100 placeholder-[#5F6368] dark:placeholder-gray-400 resize-none py-2 px-1.5 sm:px-2 outline-none max-h-32"
          />
        </div>

        {/* Model Selector Dropdown Button (inside input container on desktop) */}
        <button
          id="model-selector-pill-btn"
          type="button"
          onClick={() => setIsInternalDropdownOpen(!isInternalDropdownOpen)}
          className="hidden sm:flex items-center gap-2 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-[#E3E3E3] dark:border-zinc-700 cursor-pointer hover:bg-[#F8F9FA] dark:hover:bg-zinc-700 transition shrink-0"
        >
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              currentModel.provider === "bazaarlink"
                ? "bg-emerald-500"
                : currentModel.provider === "openai"
                ? "bg-sky-500"
                : "bg-blue-500"
            }`}
          />
          <span className="text-xs font-medium text-[#444746] dark:text-gray-200">
            {currentModel.name}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#5F6368] dark:text-gray-400" />
        </button>

        {/* Voice Mode Button (Mic) */}
        <button
          id="voice-mode-trigger-btn"
          type="button"
          onClick={onOpenVoiceMode}
          title="Voice mode"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#444746] dark:text-gray-300 hover:bg-[#E1E5EA] dark:hover:bg-zinc-800 transition-colors shrink-0"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Send Button */}
        {inputText.trim() || attachments.length > 0 ? (
          <button
            id="send-message-btn"
            type="button"
            onClick={handleSend}
            disabled={isLoading}
            className="w-9 h-9 rounded-full bg-[#1A73E8] hover:bg-blue-700 text-white flex items-center justify-center transition shadow-xs shrink-0 disabled:opacity-50 active:scale-95"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
};
