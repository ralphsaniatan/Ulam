"use client";

import React, { useState } from "react";
import { Send, Link as LinkIcon, Loader2, BotMessageSquare, X, Plus } from "lucide-react";

export function VideoSubmission() {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setStatus("loading");
    // Mock network request delay for local development
    setTimeout(() => {
      setStatus("success");
      setUrl("");
      setTimeout(() => {
        setStatus("idle");
        setIsOpen(false); // Close after success
      }, 2000);
    }, 1500);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center no-print ${
          isOpen ? "bg-slate-800 text-white rotate-90 scale-90" : "bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:scale-105 active:scale-95"
        }`}
      >
        {isOpen ? <X size={24} className="-rotate-90" /> : <Plus size={24} />}
      </button>

      {/* Chat Bot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 left-6 sm:left-auto sm:w-[350px] z-50 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-200 no-print">
          
          <div className="bg-gradient-to-r from-orange-500 to-rose-500 p-4 text-white relative">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <BotMessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">OpenClaw Agent</h3>
                <p className="text-orange-100 text-xs opacity-90">Online & ready to parse</p>
              </div>
            </div>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm p-3 text-sm text-slate-700 dark:text-slate-300 w-11/12">
              Found a new recipe? Paste a TikTok or YouTube link below, and I'll automatically translate it and add it to your week!
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <LinkIcon size={16} />
                </div>
                <input
                  type="url"
                  placeholder="Paste video URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm rounded-xl py-2.5 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading" || !url.trim()}
                className="bg-orange-500 text-white w-10 h-10 rounded-xl flex items-center justify-center transition hover:bg-orange-600 active:scale-95 disabled:opacity-50"
              >
                {status === "loading" ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>

            {status === "success" && (
              <div className="text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800/30 text-center animate-in fade-in zoom-in">
                ✨ Recipe sent! I'm syncing it now.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
