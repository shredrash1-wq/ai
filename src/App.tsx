import React, { useState, useEffect } from "react";
import { User, Chat, Notebook, MemoryItem, ThemeMode, Message, Attachment } from "./types";
import {
  DEFAULT_USER,
  getStoredUser,
  saveStoredUser,
  getStoredChats,
  saveStoredChats,
  getStoredNotebooks,
  saveStoredNotebooks,
  getStoredMemories,
  saveStoredMemories
} from "./utils/storage";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { ChatInput } from "./components/ChatInput";
import { UserProfilePopup } from "./components/UserProfilePopup";
import { SettingsModal } from "./components/SettingsModal";
import { LoginModal } from "./components/LoginModal";
import { SearchModal } from "./components/SearchModal";
import { NotebookModal } from "./components/NotebookModal";
import { ImageStudioModal } from "./components/ImageStudioModal";
import { VoiceModeOverlay } from "./components/VoiceModeOverlay";
import { LibraryModal } from "./components/LibraryModal";
import { PromptToWebStudio } from "./components/PromptToWebStudio";
import { AI_MODELS } from "./utils/models";

export default function App() {
  // State initialization
  const [user, setUser] = useState<User>(getStoredUser);
  const [chats, setChats] = useState<Chat[]>(getStoredChats);
  const [activeChatId, setActiveChatId] = useState<string>(() => {
    const saved = getStoredChats();
    return saved[0]?.id || "chat-default";
  });
  const [notebooks, setNotebooks] = useState<Notebook[]>(getStoredNotebooks);
  const [memories, setMemories] = useState<MemoryItem[]>(getStoredMemories);

  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem("aetheris_theme") as ThemeMode) || "light";
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [activeNotebookForModal, setActiveNotebookForModal] = useState<Notebook | null>(null);
  const [isImageStudioOpen, setIsImageStudioOpen] = useState(false);
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isPromptStudioOpen, setIsPromptStudioOpen] = useState(false);
  const [promptStudioInitialPrompt, setPromptStudioInitialPrompt] = useState("");

  const [selectedModel, setSelectedModel] = useState<string>("auto:free");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTemporaryChat, setIsTemporaryChat] = useState<boolean>(false);
  const [isModelPickerOpen, setIsModelPickerOpen] = useState<boolean>(false);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);

  // Apply theme
  useEffect(() => {
    localStorage.setItem("aetheris_theme", theme);
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // System
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme]);

  // Persist state updates
  useEffect(() => {
    saveStoredUser(user);
  }, [user]);

  useEffect(() => {
    saveStoredChats(chats);
  }, [chats]);

  useEffect(() => {
    saveStoredNotebooks(notebooks);
  }, [notebooks]);

  useEffect(() => {
    saveStoredMemories(memories);
  }, [memories]);

  // Global Keyboard Shortcuts (Ctrl+Shift+O, Ctrl+Shift+K, Alt+V, Alt+T)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // New chat: Ctrl + Shift + O
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "O" || e.key === "o")) {
        e.preventDefault();
        handleNewChat();
      }
      // Search chats: Ctrl + Shift + K
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "K" || e.key === "k")) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Voice mode: Alt + V
      if (e.altKey && (e.key === "V" || e.key === "v")) {
        e.preventDefault();
        setIsVoiceModeOpen((prev) => !prev);
      }
      // Temporary chat: Alt + T
      if (e.altKey && (e.key === "T" || e.key === "t")) {
        e.preventDefault();
        setIsTemporaryChat((prev) => !prev);
      }
      // Code Studio / Prompt to Website: Alt + C or Ctrl + Shift + C
      if (
        (e.altKey && (e.key === "C" || e.key === "c")) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "C" || e.key === "c"))
      ) {
        e.preventDefault();
        setIsPromptStudioOpen((prev) => !prev);
      }
    };

    const handleOpenWebStudioEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.prompt) {
        setPromptStudioInitialPrompt(customEvent.detail.prompt);
      }
      setIsPromptStudioOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-web-studio", handleOpenWebStudioEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-web-studio", handleOpenWebStudioEvent);
    };
  }, [chats]);

  // Get active chat
  const activeChat = chats.find((c) => c.id === activeChatId) || {
    id: activeChatId,
    title: "New chat",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    model: selectedModel,
    temporary: isTemporaryChat
  };

  const handleNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const newChat: Chat = {
      id: newId,
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: selectedModel,
      temporary: isTemporaryChat
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newId);
    setEditingPrompt(null);
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = chats.filter((c) => c.id !== id);
    setChats(remaining);
    if (activeChatId === id) {
      setActiveChatId(remaining[0]?.id || `chat-${Date.now()}`);
    }
  };

  const handleSendMessage = async (
    text: string,
    attachments: Attachment[] = [],
    mode: string = "standard"
  ) => {
    if (!text.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
      attachments: attachments,
      mode: mode
    };

    const currentChat = activeChat;
    const isFirstMessage = currentChat.messages.length === 0;
    const newTitle = isFirstMessage
      ? text.slice(0, 30).trim() || "Conversation"
      : currentChat.title;

    const updatedMessages = [...currentChat.messages, userMessage];

    const updatedChat: Chat = {
      ...currentChat,
      title: newTitle,
      messages: updatedMessages,
      updatedAt: Date.now(),
      temporary: isTemporaryChat
    };

    setChats((prev) => {
      const exists = prev.some((c) => c.id === currentChat.id);
      if (exists) {
        return prev.map((c) => (c.id === currentChat.id ? updatedChat : c));
      }
      return [updatedChat, ...prev];
    });

    setIsLoading(true);

    const payloadMessages = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
      imageBase64: m.attachments?.find((a) => a.type === "image")?.base64
    }));

    try {

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          model: selectedModel,
          mode: mode,
          temporary: isTemporaryChat
        })
      });

      let replyContent = "";
      let modelUsed = selectedModel;

      if (!res.ok) {
        // Fallback: If hosted server returned 500/404 or host is misconfigured, try high-availability direct endpoint
        try {
          const directRes = await fetch("https://text.pollinations.ai/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                {
                  role: "system",
                  content:
                    "You are Aetheris, an advanced, highly capable AI assistant. Provide insightful, direct answers with clean Markdown and code formatting."
                },
                ...payloadMessages.map((m: any) => ({
                  role: m.role === "assistant" || m.role === "model" ? "assistant" : "user",
                  content: m.content || ""
                }))
              ],
              model: "openai",
              seed: Math.floor(Math.random() * 100000)
            }),
            signal: AbortSignal.timeout(20000)
          });
          if (directRes.ok) {
            const directText = await directRes.text();
            if (directText && directText.trim()) {
              replyContent = directText.trim();
              modelUsed = selectedModel;
            }
          }
        } catch (directErr) {
          console.warn("Direct fallback error:", directErr);
        }

        if (!replyContent) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.error || `Server returned status ${res.status}`);
        }
      } else {
        const data = await res.json();
        replyContent = data.content || "I processed your request, but received an empty response. Please try rephrasing.";
        modelUsed = data.model || selectedModel;
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: replyContent,
        timestamp: Date.now(),
        model: modelUsed
      };

      setChats((prev) =>
        prev.map((c) => {
          if (c.id === currentChat.id) {
            return {
              ...c,
              messages: [...c.messages, assistantMessage],
              updatedAt: Date.now()
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      // Last-ditch client-side attempt if fetch threw network error
      let resolvedText = "";
      try {
        const emergencyRes = await fetch("https://text.pollinations.ai/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content:
                  "You are Aetheris, an advanced, highly capable AI assistant. Provide helpful and structured answers."
              },
              ...payloadMessages.map((m: any) => ({
                role: m.role === "assistant" || m.role === "model" ? "assistant" : "user",
                content: m.content || ""
              }))
            ],
            model: "openai"
          }),
          signal: AbortSignal.timeout(15000)
        });
        if (emergencyRes.ok) {
          const txt = await emergencyRes.text();
          if (txt && txt.trim()) {
            resolvedText = txt.trim();
          }
        }
      } catch {
        // offline or completely blocked
      }

      const fallbackMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: resolvedText || `I encountered a momentary connection notice: ${err?.message || "Service check"}. Please click Redo (↺) to refresh.`,
        timestamp: Date.now(),
        model: selectedModel
      };

      setChats((prev) =>
        prev.map((c) => {
          if (c.id === currentChat.id) {
            return {
              ...c,
              messages: [...c.messages, fallbackMessage],
              updatedAt: Date.now()
            };
          }
          return c;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedo = async (messageId: string) => {
    // Regenerate from the prompt preceding this message
    const msgIndex = activeChat.messages.findIndex((m) => m.id === messageId);
    if (msgIndex <= 0) return;
    const promptMessage = activeChat.messages[msgIndex - 1];
    if (promptMessage && promptMessage.role === "user") {
      // Remove current AI reply and trigger send
      const pruned = activeChat.messages.slice(0, msgIndex);
      setChats((prev) =>
        prev.map((c) => (c.id === activeChat.id ? { ...c, messages: pruned } : c))
      );
      handleSendMessage(promptMessage.content, promptMessage.attachments, promptMessage.mode);
    }
  };

  const handleBranchChat = (messageIndex: number) => {
    const branchedMessages = activeChat.messages.slice(0, messageIndex + 1);
    const newId = `chat-branch-${Date.now()}`;
    const newChat: Chat = {
      id: newId,
      title: `${activeChat.title} (Branch)`,
      messages: branchedMessages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: selectedModel
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newId);
  };

  const handleQuickAction = (actionType: string) => {
    if (actionType === "notebook") {
      setActiveNotebookForModal(null);
      setIsNotebookOpen(true);
    } else if (actionType === "create-image") {
      setIsImageStudioOpen(true);
    } else if (actionType === "create-music") {
      handleSendMessage("Generate a harmonic chord progression and atmospheric musical structure for a futuristic ambient score.");
    } else if (actionType === "personal-intelligence") {
      handleSendMessage("Analyze my configured memories, preferences, and recent projects to formulate high-impact proactive recommendations.");
    } else if (actionType === "avatar") {
      setIsSettingsOpen(true);
    } else if (actionType === "drive") {
      handleSendMessage("Connect Google Drive: check available documents and spreadsheets in workspace.");
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full max-w-full overflow-hidden bg-white dark:bg-[#131314] text-gray-900 dark:text-gray-100 font-sans antialiased">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        user={user}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          setActiveChatId(id);
          setEditingPrompt(null);
        }}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        notebooks={notebooks}
        onOpenNewNotebook={() => {
          setActiveNotebookForModal(null);
          setIsNotebookOpen(true);
        }}
        onSelectNotebook={(nb) => {
          setActiveNotebookForModal(nb);
          setIsNotebookOpen(true);
        }}
        onOpenImages={() => setIsImageStudioOpen(true)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleProfilePopup={() => setIsProfilePopupOpen(!isProfilePopupOpen)}
        isProfilePopupOpen={isProfilePopupOpen}
        onOpenCodeStudio={() => setIsPromptStudioOpen(true)}
      />

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-full w-full max-w-full overflow-hidden relative min-w-0">
        {/* Chat Messages and Scroll View */}
        <ChatArea
          chat={activeChat}
          user={user}
          isLoading={isLoading}
          onRedo={handleRedo}
          onEditPrompt={(text) => setEditingPrompt(text)}
          onBranchChat={handleBranchChat}
          isTemporaryChat={isTemporaryChat}
          onToggleTemporaryChat={() => setIsTemporaryChat(!isTemporaryChat)}
          onSelectSuggestion={(suggestion) => handleSendMessage(suggestion)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewChat={handleNewChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleProfilePopup={() => setIsProfilePopupOpen(!isProfilePopupOpen)}
          selectedModel={selectedModel}
          onOpenModelSelector={() => setIsModelPickerOpen(true)}
          onOpenCodeStudio={() => setIsPromptStudioOpen(true)}
        />

        {/* Bottom Curved Chat Input */}
        <div className="pb-2 sm:pb-4 pt-1 px-2 sm:px-4 select-none">
          <ChatInput
            onSendMessage={handleSendMessage}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            onOpenVoiceMode={() => setIsVoiceModeOpen(true)}
            isLoading={isLoading}
            onQuickAction={handleQuickAction}
            editingPrompt={editingPrompt}
            onCancelEditPrompt={() => setEditingPrompt(null)}
            isModelPickerOpen={isModelPickerOpen}
            onCloseModelPicker={() => setIsModelPickerOpen(false)}
          />
        </div>
      </div>

      {/* User Profile Card Popup (Matching Gemini Screenshot) */}
      {isProfilePopupOpen && (
        <UserProfilePopup
          user={user}
          onClose={() => setIsProfilePopupOpen(false)}
          onSignOut={() => {
            setUser({
              id: "guest",
              name: "Guest",
              email: "guest@aetheris.ai",
              avatarColor: "bg-gray-500",
              avatarLetter: "G",
              plan: "Guest Tier",
              hasRecoveryPhone: false
            });
            setIsProfilePopupOpen(false);
          }}
          onOpenLogin={() => {
            setIsProfilePopupOpen(false);
            setIsLoginOpen(true);
          }}
          onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
        />
      )}

      {/* Settings Modal (Activity, Personal, Memory, Avatar, Watermark, IP Location, etc.) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        theme={theme}
        onThemeChange={setTheme}
        onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
        memories={memories}
        onAddMemory={(text) => {
          const newMem: MemoryItem = {
            id: `mem-${Date.now()}`,
            text,
            dateAdded: "Just now"
          };
          setMemories([newMem, ...memories]);
        }}
        onDeleteMemory={(id) => setMemories(memories.filter((m) => m.id !== id))}
        onClearAllChats={() => {
          setChats([]);
          handleNewChat();
          setIsSettingsOpen(false);
        }}
      />

      {/* Login / Auth Page Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
      />

      {/* Fast Search Chats & Notebooks Modal (Ctrl+Shift+K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        chats={chats}
        notebooks={notebooks}
        onSelectChat={(id) => setActiveChatId(id)}
        onSelectNotebook={(nb) => {
          setActiveNotebookForModal(nb);
          setIsNotebookOpen(true);
        }}
      />

      {/* Interactive Notebook Studio Modal */}
      <NotebookModal
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
        notebooks={notebooks}
        activeNotebook={activeNotebookForModal}
        onSaveNotebook={(nb) => {
          setNotebooks((prev) => {
            const exists = prev.some((n) => n.id === nb.id);
            if (exists) {
              return prev.map((n) => (n.id === nb.id ? nb : n));
            }
            return [nb, ...prev];
          });
        }}
        onDeleteNotebook={(id) => {
          setNotebooks((prev) => prev.filter((n) => n.id !== id));
          setIsNotebookOpen(false);
        }}
        onSynthesizeWithAI={(promptText) => handleSendMessage(promptText)}
      />

      {/* Image Generation & Gallery Modal */}
      <ImageStudioModal
        isOpen={isImageStudioOpen}
        onClose={() => setIsImageStudioOpen(false)}
        onAttachImageToChat={(imageUrl, prompt) => {
          const att: Attachment = {
            id: `att-${Date.now()}`,
            name: prompt.slice(0, 20) + ".jpg",
            type: "image",
            url: imageUrl
          };
          handleSendMessage(`Analyze this concept image: "${prompt}"`, [att]);
        }}
      />

      {/* Interactive Voice Mode Overlay */}
      <VoiceModeOverlay
        isOpen={isVoiceModeOpen}
        onClose={() => setIsVoiceModeOpen(false)}
        onSendVoiceTranscript={(transcript) => handleSendMessage(transcript)}
      />

      {/* Library Modal */}
      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectPrompt={(p) => handleSendMessage(p)}
      />

      {/* Google AI Studio • Prompt to Website IDE (Code Option) */}
      <PromptToWebStudio
        isOpen={isPromptStudioOpen}
        onClose={() => setIsPromptStudioOpen(false)}
        initialPrompt={promptStudioInitialPrompt}
      />
    </div>
  );
}
