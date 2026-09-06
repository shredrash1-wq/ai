import React from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Image as ImageIcon,
  Library,
  BookOpen,
  Settings as SettingsIcon,
  MessageSquare,
  Sparkles,
  Trash2,
  Bookmark,
  Pin,
  X,
  Code
} from "lucide-react";
import { User, Chat, Notebook } from "../types";

interface SidebarProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  user: User;
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string, e: React.MouseEvent) => void;
  notebooks: Notebook[];
  onOpenNewNotebook: () => void;
  onSelectNotebook: (nb: Notebook) => void;
  onOpenImages: () => void;
  onOpenLibrary: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onToggleProfilePopup: () => void;
  isProfilePopupOpen: boolean;
  onOpenCodeStudio?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggleOpen,
  user,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  notebooks,
  onOpenNewNotebook,
  onSelectNotebook,
  onOpenImages,
  onOpenLibrary,
  onOpenSearch,
  onOpenSettings,
  onToggleProfilePopup,
  onOpenCodeStudio
}) => {
  const handleItemClick = (action: () => void) => {
    action();
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      onToggleOpen();
    }
  };
  if (!isOpen) {
    return (
      <div className="hidden md:flex h-full py-3 px-2 flex-col items-center justify-between border-r border-[#E3E3E3] dark:border-zinc-800 bg-[#F0F4F9] dark:bg-[#141516] select-none z-20">
        <div className="flex flex-col items-center gap-3">
          <button
            id="sidebar-expand-btn"
            onClick={onToggleOpen}
            title="Expand sidebar"
            className="p-2 rounded-full text-[#444746] hover:text-[#1F1F1F] dark:text-gray-400 dark:hover:text-white hover:bg-[#E1E5EA] dark:hover:bg-zinc-800 transition"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>

          <button
            id="sidebar-mini-new-chat-btn"
            onClick={onNewChat}
            title="New chat (Ctrl+Shift+O)"
            className="p-2.5 rounded-full bg-[#D3E3FD] text-[#041E49] hover:bg-[#c2d7fa] transition shadow-xs"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Mini Code Studio Option */}
          {onOpenCodeStudio && (
            <button
              id="sidebar-mini-code-studio-btn"
              onClick={onOpenCodeStudio}
              title="Aether Studio: Prompt to Website (Code Option)"
              className="p-2 rounded-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 transition"
            >
              <Code className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenSearch}
            title="Search chats (Ctrl+Shift+K)"
            className="p-2 rounded-full text-[#444746] hover:text-[#1F1F1F] dark:text-gray-400 dark:hover:text-white hover:bg-[#E1E5EA] dark:hover:bg-zinc-800 transition"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            id="sidebar-mini-profile-btn"
            onClick={onToggleProfilePopup}
            className="w-8 h-8 rounded-full bg-[#1A73E8] text-white flex items-center justify-center font-bold text-sm shadow cursor-pointer ring-2 ring-transparent hover:ring-blue-400 transition"
          >
            {user.avatarLetter}
          </button>
        </div>
      </div>
    );
  }

  const sidebarBody = (isMobile: boolean) => (
    <>
      {/* Top Header */}
      <div className="flex flex-col gap-2">
        {/* Brand & collapse */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#4285F4] to-[#91B9FF] rounded-full flex items-center justify-center shadow-xs">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
              </svg>
            </div>
            <span className="font-semibold text-xl tracking-tight text-[#444746] dark:text-white">
              AETHER
            </span>
          </div>

          <button
            id={isMobile ? "mobile-sidebar-collapse-btn" : "sidebar-collapse-btn"}
            onClick={onToggleOpen}
            title="Close sidebar"
            className="p-2 hover:bg-[#E1E5EA] dark:hover:bg-zinc-800 rounded-full text-[#444746] dark:text-gray-400 transition"
          >
            {isMobile ? <X className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        {/* New Chat Button (Artistic Flair Pill) */}
        <button
          id={isMobile ? "mobile-new-chat-button" : "new-chat-button"}
          onClick={() => handleItemClick(onNewChat)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-[#D3E3FD] dark:bg-blue-950/70 text-[#041E49] dark:text-blue-200 rounded-full text-sm font-medium mb-3 shadow-xs hover:bg-[#c2d7fa] dark:hover:bg-blue-900/60 transition group text-left"
        >
          <Plus className="w-4 h-4 text-[#041E49] dark:text-blue-200 group-hover:rotate-90 transition-transform duration-200 stroke-[2.5]" />
          <span>New chat</span>
          {!isMobile && (
            <span className="ml-auto opacity-40 text-[10px] font-mono font-medium">
              Ctrl+Shift+O
            </span>
          )}
        </button>

        {/* Search Chats Button */}
        <div className="space-y-1">
          <button
            id={isMobile ? "mobile-search-chats-button" : "search-chats-button"}
            onClick={() => handleItemClick(onOpenSearch)}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#E1E5EA] dark:hover:bg-zinc-800 rounded-full text-sm text-[#444746] dark:text-gray-300 transition text-left"
          >
            <Search className="w-4 h-4 text-[#444746] dark:text-gray-400" />
            <span>Search</span>
            {!isMobile && (
              <span className="ml-auto opacity-40 text-[10px] font-mono">
                Ctrl+Shift+K
              </span>
            )}
          </button>

          {/* Direct Options: Code Studio, Images & Library */}
          {onOpenCodeStudio && (
            <button
              id={isMobile ? "mobile-sidebar-code-studio-btn" : "sidebar-code-studio-btn"}
              onClick={() => handleItemClick(onOpenCodeStudio)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#E1E5EA] dark:hover:bg-zinc-800 rounded-full text-sm font-medium text-[#1A73E8] dark:text-blue-400 hover:text-[#174EA6] transition text-left group"
            >
              <div className="w-5 h-5 rounded-md bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shrink-0">
                <Code className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center justify-between flex-1 min-w-0">
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-xs sm:text-sm truncate">Code Option</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate">Aether Studio</span>
                </div>
                <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[9px] font-bold shrink-0">
                  STUDIO
                </span>
              </div>
            </button>
          )}

          <button
            id={isMobile ? "mobile-sidebar-images-btn" : "sidebar-images-btn"}
            onClick={() => handleItemClick(onOpenImages)}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#E1E5EA] dark:hover:bg-zinc-800 rounded-full text-sm text-[#444746] dark:text-gray-300 transition text-left"
          >
            <ImageIcon className="w-4 h-4 text-[#444746] dark:text-gray-400" />
            <span>Images</span>
          </button>

          <button
            id={isMobile ? "mobile-sidebar-library-btn" : "sidebar-library-btn"}
            onClick={() => handleItemClick(onOpenLibrary)}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#E1E5EA] dark:hover:bg-zinc-800 rounded-full text-sm text-[#444746] dark:text-gray-300 transition text-left"
          >
            <Library className="w-4 h-4 text-[#444746] dark:text-gray-400" />
            <span>Library</span>
          </button>
        </div>
      </div>

      {/* Middle Scrollable Section: Notebooks & Recent */}
      <div className="flex-1 overflow-y-auto px-1 py-3 space-y-4 text-left">
        {/* Notebooks Section */}
        <div>
          <div className="pt-2 px-3 pb-1.5 text-[11px] font-bold text-[#444746] dark:text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>Notebooks</span>
            <button
              id={isMobile ? "mobile-sidebar-new-notebook-btn" : "sidebar-new-notebook-btn"}
              onClick={() => handleItemClick(onOpenNewNotebook)}
              title="New notebook"
              className="p-1 rounded-full text-[#444746] hover:bg-[#E1E5EA] dark:hover:bg-zinc-800 transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => handleItemClick(onOpenNewNotebook)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#E1E5EA] dark:hover:bg-zinc-800 rounded-full text-sm text-[#444746] dark:text-gray-300 transition text-left"
            >
              <Plus className="w-4 h-4 text-[#444746] dark:text-gray-400" />
              <span>New notebook</span>
            </button>

            {notebooks.map((nb) => (
              <button
                key={nb.id}
                onClick={() => handleItemClick(() => onSelectNotebook(nb))}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#E1E5EA] dark:hover:bg-zinc-800 rounded-full text-sm text-[#444746] dark:text-gray-300 transition text-left truncate group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <BookOpen className="w-3.5 h-3.5 text-[#5F6368] shrink-0" />
                  <span className="truncate">{nb.title}</span>
                </div>
                <span className="text-[10px] text-[#5F6368] opacity-0 group-hover:opacity-100 transition shrink-0">
                  {nb.sourcesCount} src
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Chats Section */}
        <div>
          <div className="pt-2 px-3 pb-1 text-[11px] font-bold text-[#444746] dark:text-gray-400 uppercase tracking-wider">
            <span>Recent</span>
          </div>

          <div className="space-y-1">
            {chats.length === 0 ? (
              <div className="px-3 py-2 text-xs text-[#5F6368] italic">
                No recent conversations
              </div>
            ) : (
              chats.map((chat) => {
                const isActive = chat.id === activeChatId;
                return (
                  <div
                    key={chat.id}
                    onClick={() => handleItemClick(() => onSelectChat(chat.id))}
                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-medium cursor-pointer transition ${
                      isActive
                        ? "bg-[#E1E5EA] dark:bg-zinc-800 text-[#1F1F1F] dark:text-white font-semibold"
                        : "text-[#444746] dark:text-gray-300 hover:bg-[#E1E5EA] dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#1A73E8]" : "text-[#5F6368]"}`} />
                      <span className="truncate max-w-[165px] text-xs">{chat.title || "Untitled chat"}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id, e);
                      }}
                      title="Delete chat"
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#5F6368] hover:text-red-600 rounded transition shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Profile, Settings & Location Section */}
      <div className="mt-auto pt-3 border-t border-[#D3D3D3] dark:border-zinc-800">
        <div className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[#E1E5EA] dark:hover:bg-zinc-800 rounded-xl transition-colors">
          <div
            onClick={onToggleProfilePopup}
            className="w-8 h-8 rounded-full bg-[#1A73E8] flex items-center justify-center text-white font-bold text-sm shrink-0"
          >
            {user.avatarLetter}
          </div>
          <div
            onClick={onToggleProfilePopup}
            className="flex-1 overflow-hidden text-left"
          >
            <div className="text-sm font-medium text-[#1F1F1F] dark:text-white truncate">
              {user.name}
            </div>
            <div className="text-[10px] text-[#5F6368] dark:text-gray-400 truncate">
              {user.email}
            </div>
          </div>
          <button
            id={isMobile ? "mobile-sidebar-settings-button" : "sidebar-settings-button"}
            onClick={() => handleItemClick(onOpenSettings)}
            title="Settings"
            className="p-1.5 hover:bg-[#D3D3D3] dark:hover:bg-zinc-700 rounded-lg text-[#444746] dark:text-gray-300 transition"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>

        {/* IP Geolocation indicator */}
        <div className="flex items-center gap-1.5 mt-2 px-3 text-[10px] text-[#5F6368] dark:text-gray-400">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-[#5F6368]">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
          </svg>
          <span className="truncate">Updated from your IP</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <div className="fixed inset-0 z-50 md:hidden flex">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={onToggleOpen}
        />
        <aside
          id="mobile-sidebar"
          className="relative w-[85vw] max-w-[320px] h-full flex flex-col justify-between bg-[#F0F4F9] dark:bg-[#141517] text-[#1F1F1F] dark:text-gray-200 select-none z-50 p-4 shadow-2xl animate-in slide-in-from-left duration-200"
        >
          {sidebarBody(true)}
        </aside>
      </div>

      {/* Desktop Sidebar */}
      <aside
        id="main-sidebar"
        className="hidden md:flex w-[280px] h-full flex-col justify-between border-r border-[#E3E3E3] dark:border-zinc-800 bg-[#F0F4F9] dark:bg-[#141517] text-[#1F1F1F] dark:text-gray-200 select-none z-20 shrink-0 p-4"
      >
        {sidebarBody(false)}
      </aside>
    </>
  );
};
