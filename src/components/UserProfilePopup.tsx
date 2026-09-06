import React, { useState } from "react";
import { 
  Plus, 
  LogOut, 
  Pencil, 
  ChevronUp, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  X,
  Phone
} from "lucide-react";
import { User } from "../types";

interface UserProfilePopupProps {
  user: User;
  onClose: () => void;
  onSignOut: () => void;
  onOpenLogin: () => void;
  onUpdateUser: (updated: Partial<User>) => void;
}

export const UserProfilePopup: React.FC<UserProfilePopupProps> = ({
  user,
  onClose,
  onSignOut,
  onOpenLogin,
  onUpdateUser
}) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [dismissedSecurity, setDismissedSecurity] = useState(false);

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    onUpdateUser({ hasRecoveryPhone: true });
    setPhoneSaved(true);
    setTimeout(() => {
      setShowPhoneModal(false);
    }, 1000);
  };

  return (
    <>
      <div 
        id="user-profile-popup-backdrop"
        className="fixed inset-0 z-40" 
        onClick={onClose} 
      />
      <div
        id="user-profile-popup-card"
        className="absolute bottom-16 left-3 z-50 w-84 rounded-3xl bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-zinc-800 shadow-2xl p-4 text-gray-800 dark:text-gray-100 transition-all duration-200 animate-in fade-in zoom-in-95"
      >
        {/* Top account item */}
        <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-12 h-12 rounded-full ${user.avatarColor} text-white flex items-center justify-center font-medium text-lg shadow-sm`}>
                {user.avatarLetter}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow border border-gray-200 dark:border-zinc-700">
                <Pencil className="w-2.5 h-2.5 text-gray-600 dark:text-gray-300" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-sm text-gray-900 dark:text-white leading-tight">
                {user.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                {user.email}
              </span>
            </div>
          </div>
          <ChevronUp className="w-4 h-4 text-gray-400" />
        </div>

        {/* Account actions */}
        <div className="mt-2 space-y-1">
          <button
            id="popup-add-account-btn"
            onClick={onOpenLogin}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-left"
          >
            <div className="flex items-center gap-3">
              <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>Sign In / Sign Up</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-medium">
              Coming Soon
            </span>
          </button>

          <button
            id="popup-sign-out-btn"
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-left"
          >
            <LogOut className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span>Reset Guest Session</span>
          </button>
        </div>

        {/* Manage Google Account button */}
        <div className="mt-3">
          <button
            id="popup-manage-account-btn"
            onClick={() => alert(`Managing account settings for ${user.email}`)}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full border border-gray-300 dark:border-zinc-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800/80 transition"
          >
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>Manage your Google Account</span>
          </button>
        </div>

        {/* Security Warning Notice matching screenshot */}
        {!dismissedSecurity && !user.hasRecoveryPhone && (
          <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-left">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                  Make sure that you can always sign in
                </p>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                  A recovery phone will help if you forget your password
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-end gap-2">
              <button
                id="security-dismiss-btn"
                onClick={() => setDismissedSecurity(true)}
                className="text-xs font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 transition"
              >
                Dismiss
              </button>
              <button
                id="security-add-phone-btn"
                onClick={() => setShowPhoneModal(true)}
                className="text-xs font-medium bg-[#0b57d0] hover:bg-[#0842a0] text-white px-3 py-1.5 rounded-full transition shadow-sm"
              >
                Add recovery phone
              </button>
            </div>
          </div>
        )}

        {/* Get Google AI Plan bottom link */}
        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
          <button
            id="popup-get-plan-btn"
            onClick={() => alert("Aetheris AI Pro provides 1M context tokens, Gemini 3.1 Pro reasoning, and priority 4K image generation.")}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Get an Aetheris AI plan</span>
          </button>
        </div>
      </div>

      {/* Recovery Phone Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-zinc-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-base text-gray-900 dark:text-white">Add Recovery Phone</h3>
              </div>
              <button 
                onClick={() => setShowPhoneModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhone} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {phoneSaved ? (
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-medium py-1">
                  <Check className="w-4 h-4" />
                  <span>Recovery phone verified and saved!</span>
                </div>
              ) : (
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPhoneModal(false)}
                    className="px-4 py-2 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    Save Phone
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
};
