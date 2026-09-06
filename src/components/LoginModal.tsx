import React from "react";
import { X, Sparkles, User as UserIcon, Shield, CheckCircle2 } from "lucide-react";
import { User } from "../types";
import { DEFAULT_USER } from "../utils/storage";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  if (!isOpen) return null;

  const handleContinueAsGuest = () => {
    onLoginSuccess(DEFAULT_USER);
    onClose();
  };

  return (
    <div
      id="login-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="login-modal-card"
        className="bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative text-left"
      >
        <button
          id="login-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo & Heading */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-md mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 mb-3">
            <span>Sign In / Sign Up — Coming Soon</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Guest Account Active
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
            Full user sign in and registration are coming soon! You are currently browsing with a Guest Account with complete access to AETHER BOT, chat, code generation, and live previews.
          </p>
        </div>

        {/* Feature List for Guest Account */}
        <div className="space-y-2.5 bg-gray-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 text-xs text-gray-600 dark:text-gray-300 mb-6">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Instant access to AETHER BOT &amp; LLM API</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Interactive code execution &amp; HTML live preview</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Local session storage on your device</span>
          </div>
        </div>

        {/* Continue as Guest Button */}
        <button
          id="continue-as-guest-btn"
          type="button"
          onClick={handleContinueAsGuest}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md transition"
        >
          <UserIcon className="w-4 h-4" />
          <span>Continue with Guest Account</span>
        </button>
      </div>
    </div>
  );
};
