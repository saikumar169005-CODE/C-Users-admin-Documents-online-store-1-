import React, { useState } from "react";
import { motion } from "motion/react";
import { LogIn, Shield, User, X } from "lucide-react";
import { User as UserType } from "../types.ts";

interface AuthModalProps {
  onLogin: (user: UserType) => void;
  onClose?: () => void;
  isOpen: boolean;
}

export default function AuthModal({ onLogin, onClose, isOpen }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"User" | "Admin">("User");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please key in a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      if (!res.ok) {
        throw new Error("Authentication failed");
      }

      const data = await res.json();
      onLogin(data.user);
      if (onClose) onClose();
    } catch (err: any) {
      setError(err?.message || "Server connection issues. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadPresetUser = async (presetEmail: string, presetRole: "User" | "Admin") => {
    setEmail(presetEmail);
    setRole(presetRole);
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: presetEmail, role: presetRole }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      onLogin(data.user);
      if (onClose) onClose();
    } catch {
      setError("Failed to login as preset. Check server status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <motion.div
        id="auth-modal-container"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200"
      >
        <div id="auth-modal-header" className="p-6 bg-indigo-900 text-white relative">
          {onClose && (
            <button
              id="auth-close-btn"
              onClick={onClose}
              className="absolute right-4 top-4 text-indigo-200 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          )}
          <h2 id="auth-title" className="text-2xl font-display font-bold tracking-tight">Sign In</h2>
          <p id="auth-subtitle" className="text-xs text-indigo-200 mt-1">Please sign in to access your account dashboard.</p>
        </div>

        <form id="auth-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div id="auth-error" className="bg-red-50 text-red-600 border border-red-100 rounded-lg p-3 text-xs">
              {error}
            </div>
          )}

          <div>
            <label id="auth-email-label" className="block text-xs font-medium text-slate-500 mb-1">Email address</label>
            <input
              id="auth-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., alex@example.com"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label id="auth-role-label" className="block text-xs font-medium text-slate-500 mb-1.5">Account Role Access</label>
            <div id="auth-role-selector" className="grid grid-cols-2 gap-3">
              <button
                id="role-btn-user"
                type="button"
                onClick={() => setRole("User")}
                className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === "User"
                    ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-xs"
                    : "border-slate-200 text-slate-500 bg-white hover:bg-gray-50"
                }`}
              >
                <User size={14} />
                Customer
              </button>
              <button
                id="role-btn-admin"
                type="button"
                onClick={() => setRole("Admin")}
                className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === "Admin"
                    ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-xs"
                    : "border-slate-200 text-slate-500 bg-white hover:bg-gray-50"
                }`}
              >
                <Shield size={14} />
                Administrator
              </button>
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-all focus:outline-hidden disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <LogIn size={16} />
            {loading ? "Authenticating..." : "Sign In & Continue"}
          </button>

          <div id="auth-divider" className="relative flex items-center py-2">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-4 text-[10px] text-slate-400 uppercase tracking-wider font-bold">Demo Accounts</span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          <div id="auth-presets" className="grid grid-cols-2 gap-3 pt-1">
            <button
              id="preset-user-btn"
              type="button"
              onClick={() => loadPresetUser("buyer@store.com", "User")}
              className="py-2 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Demo Customer
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">buyer@store.com</div>
            </button>
            <button
              id="preset-admin-btn"
              type="button"
              onClick={() => loadPresetUser("admin@store.com", "Admin")}
              className="py-2 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Demo Admin
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">admin@store.com</div>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
