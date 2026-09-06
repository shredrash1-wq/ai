import React, { useState } from "react";
import { Search, X, MessageSquare, BookOpen, Clock, ArrowRight } from "lucide-react";
import { Chat, Notebook } from "../types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  notebooks: Notebook[];
  onSelectChat: (id: string) => void;
  onSelectNotebook: (nb: Notebook) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  chats,
  notebooks,
  onSelectChat,
  onSelectNotebook
}) => {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const filteredChats = chats.filter((c) => {
    const inTitle = (c.title || "").toLowerCase().includes(query.toLowerCase());
    const inMessages = c.messages.some((m) => m.content.toLowerCase().includes(query.toLowerCase()));
    return inTitle || inMessages;
  });

  const filteredNotebooks = notebooks.filter((n) => {
    const inTitle = n.title.toLowerCase().includes(query.toLowerCase());
    const inContent = n.content.toLowerCase().includes(query.toLowerCase());
    return inTitle || inContent;
  });

  return (
    <div
      id="search-modal-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="search-modal-box"
        className="bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-200 dark:border-zinc-800">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search all conversations, prompts, and notebooks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-0 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Chats */}
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2">
              Chats ({filteredChats.length})
            </span>
            <div className="space-y-1 mt-1">
              {filteredChats.length === 0 ? (
                <p className="text-xs text-gray-400 italic px-2 py-1">No chats match "{query}"</p>
              ) : (
                filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      onSelectChat(chat.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition text-left group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <MessageSquare className="w-4 h-4 text-blue-500 shrink-0" />
                      <div className="truncate">
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                          {chat.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 truncate">
                          {chat.messages[chat.messages.length - 1]?.content || "Empty chat"}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Notebooks */}
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2">
              Notebooks ({filteredNotebooks.length})
            </span>
            <div className="space-y-1 mt-1">
              {filteredNotebooks.length === 0 ? (
                <p className="text-xs text-gray-400 italic px-2 py-1">No notebooks match "{query}"</p>
              ) : (
                filteredNotebooks.map((nb) => (
                  <button
                    key={nb.id}
                    onClick={() => {
                      onSelectNotebook(nb);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition text-left group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <BookOpen className="w-4 h-4 text-purple-500 shrink-0" />
                      <div className="truncate">
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                          {nb.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 truncate">
                          {nb.content.slice(0, 70)}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
