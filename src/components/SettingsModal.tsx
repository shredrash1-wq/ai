import React, { useState, useEffect } from "react";
import {
  X,
  Activity,
  User as UserIcon,
  Brain,
  Palette,
  Gauge,
  Share2,
  SunMoon,
  BookOpen,
  Stamp,
  MessageSquare,
  HelpCircle,
  MapPin,
  RefreshCw,
  Trash2,
  Plus,
  Check,
  Smartphone,
  ExternalLink,
  Laptop
} from "lucide-react";
import { User, ThemeMode, MemoryItem, UserLocation } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onUpdateUser: (updated: Partial<User>) => void;
  memories: MemoryItem[];
  onAddMemory: (text: string) => void;
  onDeleteMemory: (id: string) => void;
  onClearAllChats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  theme,
  onThemeChange,
  onUpdateUser,
  memories,
  onAddMemory,
  onDeleteMemory,
  onClearAllChats
}) => {
  const [activeTab, setActiveTab] = useState<string>("theme");
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [newMemoryText, setNewMemoryText] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [location, setLocation] = useState<UserLocation>({
    city: "San Francisco",
    region: "California",
    country: "United States",
    ip: "192.168.1.1",
    updatedAt: "Just now"
  });
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [editName, setEditName] = useState(user.name);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setIsUpdatingLocation(true);
    try {
      const res = await fetch("/api/location");
      if (res.ok) {
        const data = await res.json();
        setLocation(data);
      }
    } catch {
      // Fallback
    } finally {
      setTimeout(() => setIsUpdatingLocation(false), 500);
    }
  };

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    onUpdateUser({
      name: editName.trim(),
      avatarLetter: editName.trim().charAt(0).toUpperCase()
    });
  };

  const navItems = [
    { id: "activity", label: "Activity", icon: Activity },
    { id: "personal", label: "Personal", icon: UserIcon },
    { id: "import-memory", label: "Import memory", icon: Brain },
    { id: "avatar", label: "Avatar", icon: Palette },
    { id: "usage-limit", label: "Usage limit", icon: Gauge },
    { id: "public-links", label: "Your public links", icon: Share2 },
    { id: "theme", label: "Theme", icon: SunMoon },
    { id: "notebook", label: "Notebook", icon: BookOpen },
    { id: "watermark", label: "Media watermark", icon: Stamp },
    { id: "feedback", label: "Send feedback", icon: MessageSquare },
    { id: "help", label: "Help", icon: HelpCircle },
  ];

  const avatarColors = [
    "bg-[#8e24aa]",
    "bg-[#0b57d0]",
    "bg-[#0f9d58]",
    "bg-[#db4437]",
    "bg-[#f4b400]",
    "bg-[#e91e63]",
    "bg-[#009688]",
    "bg-[#3f51b5]"
  ];

  return (
    <div 
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in"
    >
      <div 
        id="settings-modal-container"
        className="bg-white dark:bg-[#1f2022] border border-gray-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl h-[620px] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Settings
          </h2>
          <button
            id="settings-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Nav */}
          <div className="w-64 border-r border-gray-200 dark:border-zinc-800 p-3 overflow-y-auto space-y-0.5 bg-gray-50/50 dark:bg-[#191a1b]/40">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`settings-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition text-left ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Panel */}
          <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-[#1e1f20] text-gray-800 dark:text-gray-200">
            {/* THEME */}
            {activeTab === "theme" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Theme</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Choose how Aetheris looks to you. Select a theme or sync with your system settings.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "system", title: "System", desc: "Follow OS preference" },
                    { id: "light", title: "Light", desc: "Crisp white styling" },
                    { id: "dark", title: "Dark", desc: "Deep contrast canvas" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      id={`theme-btn-${t.id}`}
                      onClick={() => onThemeChange(t.id as ThemeMode)}
                      className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between h-28 ${
                        theme === t.id
                          ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20"
                          : "border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">{t.title}</span>
                        {theme === t.id && <Check className="w-4 h-4 text-blue-500" />}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ACTIVITY */}
            {activeTab === "activity" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Activity & History</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your conversation history is securely cached to give you fast multi-turn continuity.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Clear All Recent Conversations</h4>
                      <p className="text-xs text-gray-500">Remove all local chats, messages, and temporary sessions.</p>
                    </div>
                    <button
                      id="settings-clear-chats-btn"
                      onClick={() => {
                        if (confirm("Are you sure you want to clear all chat histories?")) {
                          onClearAllChats();
                        }
                      }}
                      className="px-4 py-2 rounded-full border border-red-300 dark:border-red-900/60 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PERSONAL */}
            {activeTab === "personal" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Personal Info</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Manage how your identity is addressed across intelligent prompts.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Registered Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-800 text-sm text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* IMPORT MEMORY */}
            {activeTab === "import-memory" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Import & Manage Memory</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Aetheris remembers preferences and key facts across conversations to provide tailored answers.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Always generate concise Python code with type hints"
                    value={newMemoryText}
                    onChange={(e) => setNewMemoryText(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (!newMemoryText.trim()) return;
                      onAddMemory(newMemoryText.trim());
                      setNewMemoryText("");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Fact</span>
                  </button>
                </div>

                <div className="space-y-2 mt-4">
                  {memories.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No memories recorded yet.</p>
                  ) : (
                    memories.map((mem) => (
                      <div
                        key={mem.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-900/40"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs text-gray-800 dark:text-gray-200">{mem.text}</p>
                          <span className="text-[10px] text-gray-400">Added {mem.dateAdded}</span>
                        </div>
                        <button
                          onClick={() => onDeleteMemory(mem.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* AVATAR */}
            {activeTab === "avatar" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Avatar & Profile Badge</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Customize your profile avatar color palette and badge appearance.
                  </p>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800">
                  <div className={`w-16 h-16 rounded-full ${user.avatarColor} text-white flex items-center justify-center font-bold text-2xl shadow-md`}>
                    {user.avatarLetter}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{user.name}</h4>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Pick Profile Theme Color
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {avatarColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => onUpdateUser({ avatarColor: color })}
                        className={`w-9 h-9 rounded-full ${color} transition transform hover:scale-110 flex items-center justify-center ${
                          user.avatarColor === color ? "ring-4 ring-blue-500/40" : ""
                        }`}
                      >
                        {user.avatarColor === color && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* USAGE LIMIT */}
            {activeTab === "usage-limit" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Usage Limit & Quotas</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Aetheris provides high-capacity free reasoning with real-time rate metrics.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/40">
                    <span className="text-xs text-gray-500 font-medium">Active Plan</span>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mt-1">Aetheris Free Tier</h4>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                      Active
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/40">
                    <span className="text-xs text-gray-500 font-medium">Daily Tokens</span>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mt-1">Unlimited Free</h4>
                    <span className="text-xs text-gray-400 mt-1 block">Standard Gemini 3.8 Flash quota</span>
                  </div>
                </div>
              </div>
            )}

            {/* PUBLIC LINKS */}
            {activeTab === "public-links" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Your Public Links</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Manage shared conversation links and collaborative threads.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 text-center py-8">
                  <Share2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">You haven't generated any public share links yet.</p>
                </div>
              </div>
            )}

            {/* NOTEBOOK */}
            {activeTab === "notebook" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Notebook Settings</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Manage deep research note generation and source synthesis settings.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Auto-generate Source Summaries</h4>
                      <p className="text-[11px] text-gray-500">Automatically synthesize uploaded documents into notebook outlines.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600" />
                  </div>
                </div>
              </div>
            )}

            {/* WATERMARK */}
            {activeTab === "watermark" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Media Watermark</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Embed cryptographic provenance metadata to identify AI-generated visuals.
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/40">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">SynthID Watermark</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Embeds a robust digital watermarking protocol into synthetic images.</p>
                  </div>
                  <button
                    onClick={() => setWatermarkEnabled(!watermarkEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      watermarkEnabled ? "bg-blue-600" : "bg-gray-300 dark:bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        watermarkEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* SEND FEEDBACK */}
            {activeTab === "feedback" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Send Feedback</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Help us build the most responsive and intuitive AI environment.
                  </p>
                </div>

                <div className="space-y-3">
                  <textarea
                    rows={4}
                    placeholder="Tell us what you liked, or where we can improve..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {feedbackSent ? (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Thank you! Your feedback has been delivered.</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (!feedbackText.trim()) return;
                        setFeedbackSent(true);
                        setTimeout(() => {
                          setFeedbackSent(false);
                          setFeedbackText("");
                        }, 2500);
                      }}
                      className="px-5 py-2 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                      Submit Feedback
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* HELP */}
            {activeTab === "help" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Help & Keyboard Shortcuts</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Quickly navigate and operate Aetheris with power shortcuts.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800">
                    <span>New chat</span>
                    <kbd className="px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800 font-mono text-[11px]">Ctrl+Shift+O</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800">
                    <span>Search chats</span>
                    <kbd className="px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800 font-mono text-[11px]">Ctrl+Shift+K</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800">
                    <span>Voice mode toggle</span>
                    <kbd className="px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800 font-mono text-[11px]">Alt+V</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800">
                    <span>Temporary chat</span>
                    <kbd className="px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800 font-mono text-[11px]">Alt+T</kbd>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* IP Location Footer (Required by user) */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-[#18191a] flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>
              From your IP address • <strong className="text-gray-700 dark:text-gray-300">{location.city}, {location.region} {location.country}</strong>
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Updated location ({location.updatedAt})
            </span>
          </div>

          <button
            onClick={fetchLocation}
            disabled={isUpdatingLocation}
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isUpdatingLocation ? "animate-spin" : ""}`} />
            <span>Update location</span>
          </button>
        </div>
      </div>
    </div>
  );
};
