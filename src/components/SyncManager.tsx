"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Copy, Link2, Check, X } from "lucide-react";

interface Props {
  syncCode: string;
  onUpdateSyncCode: (newCode: string) => void;
}

export function SyncManager({ syncCode, onUpdateSyncCode }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim().length >= 6) {
      onUpdateSyncCode(inputCode.trim().toUpperCase());
      setIsOpen(false);
      setInputCode("");
    }
  };

  const triggerBtn = (
    <button 
      onClick={() => setIsOpen(true)}
      className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
    >
      Sync: {syncCode}
    </button>
  );

  const modal = isOpen ? (
    <div className="fixed inset-0 z-[100] flex justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm h-fit rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 m-auto mt-12 sm:mt-auto mb-auto">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Link2 size={18} className="text-orange-500" />
            Device Sync
          </h3>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 space-y-6">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Your Household Code
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-200 tracking-widest text-center text-lg">
                {syncCode}
              </div>
              <button
                onClick={handleCopy}
                className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 border border-orange-200 dark:border-orange-800/30 px-4 rounded-xl flex items-center justify-center transition hover:bg-orange-100 dark:hover:bg-orange-900/40 active:scale-95"
              >
                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Share this code with your partner or helper so you all see the same meals.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">Or Join Another</span>
            </div>
          </div>

          <form onSubmit={handleJoin} className="space-y-3">
            <input
              type="text"
              placeholder="e.g. PINOY-7X"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-center font-mono font-bold placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 uppercase tracking-widest"
              maxLength={8}
            />
            <button
              type="submit"
              disabled={inputCode.length < 6}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 rounded-xl disabled:opacity-50 transition active:scale-95"
            >
              Join Household
            </button>
          </form>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {triggerBtn}
      {mounted && isOpen ? createPortal(modal, document.body) : null}
    </>
  );
}
