"use client";

import React, { useEffect, useState } from "react";
import { 
  getSyncCode, 
  getHouseholdState, 
  pushHouseholdState, 
  fetchHouseholdState 
} from "@/lib/store";
import { AppStateData, PantryIngredientItem } from "@/lib/types";
import { Plus, Apple, Sparkles, Trash2, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PantryPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncCode, setSyncCode] = useState("");
  const [state, setState] = useState<AppStateData | null>(null);

  // Form state
  const [nameInput, setNameInput] = useState("");
  const [categoryInput, setCategoryInput] = useState<"Proteins" | "Produce" | "Pantry Staples">("Proteins");
  const [formFeedback, setFormFeedback] = useState({ text: "", type: "" });

  // 1. Initial Load
  useEffect(() => {
    const code = getSyncCode();
    setSyncCode(code);
    const loadedState = getHouseholdState(code);
    setState(loadedState);
    setIsLoaded(true);
  }, []);

  // 2. State Polling from Redis
  useEffect(() => {
    if (!syncCode) return;

    const poll = async () => {
      const serverState = await fetchHouseholdState(syncCode);
      if (serverState) {
        setState((current) => {
          if (!current || serverState.updatedAt > current.updatedAt) {
            return serverState;
          }
          return current;
        });
      }
    };

    poll();
    const interval = setInterval(poll, 7000);
    return () => clearInterval(interval);
  }, [syncCode]);

  if (!isLoaded || !state) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Syncing kitchen planner...</p>
        </div>
      </div>
    );
  }

  // Helper to slugify
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  };

  // 3. Action Handler: Add custom ingredient
  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback({ text: "", type: "" });

    const name = nameInput.trim();
    if (!name) return;

    const id = slugify(name);
    
    // Check duplicate
    const duplicate = state.pantryItems.find(
      (p) => p.id === id || p.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      setFormFeedback({ text: `"${name}" is already in your pantry!`, type: "error" });
      return;
    }

    const newItem: PantryIngredientItem = {
      id,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      category: categoryInput,
      status: "OUT", // Default initialized to OUT
    };

    const newState = {
      ...state,
      pantryItems: [...state.pantryItems, newItem],
      updatedAt: Date.now(),
    };

    setState(newState);
    await pushHouseholdState(syncCode, newState);

    setNameInput("");
    setFormFeedback({ text: `Added "${newItem.name}" to pantry inventory.`, type: "success" });
    setTimeout(() => setFormFeedback({ text: "", type: "" }), 2500);
  };

  // 4. Action Handler: Update item status
  const handleUpdateStatus = async (itemId: string, status: "PLENTY" | "LOW" | "OUT") => {
    const updatedItems = state.pantryItems.map((p) => {
      if (p.id === itemId) {
        return { ...p, status };
      }
      return p;
    });

    const newState = {
      ...state,
      pantryItems: updatedItems,
      updatedAt: Date.now(),
    };

    setState(newState);
    await pushHouseholdState(syncCode, newState);
  };

  // 5. Action Handler: Remove custom ingredient
  const handleRemoveIngredient = async (itemId: string) => {
    const updatedItems = state.pantryItems.filter((p) => p.id !== itemId);
    const newState = {
      ...state,
      pantryItems: updatedItems,
      updatedAt: Date.now(),
    };
    setState(newState);
    await pushHouseholdState(syncCode, newState);
  };

  // 6. Group items by category and sort alphabetically
  const getCategorizedItems = (cat: "Proteins" | "Produce" | "Pantry Staples") => {
    return state.pantryItems
      .filter((item) => item.category === cat)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const categories = [
    { name: "Proteins", label: "Proteins & Meats", items: getCategorizedItems("Proteins") },
    { name: "Produce", label: "Produce & Fresh Veggies", items: getCategorizedItems("Produce") },
    { name: "Pantry Staples", label: "Pantry Staples & Seasonings", items: getCategorizedItems("Pantry Staples") }
  ];

  return (
    <div className="p-5 flex-1 flex flex-col space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <header className="pt-2">
        <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold uppercase px-2 py-0.5 rounded-full tracking-widest">
          Inventory Control
        </span>
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1">
          Pantry Manager
        </h1>
      </header>

      {/* Floating Injector Form */}
      <section className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-850 p-5 rounded-3xl space-y-4">
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">
          <Plus className="w-3.5 h-3.5" />
          Add Custom Ingredient
        </div>

        <form onSubmit={handleAddIngredient} className="space-y-3">
          <div className="flex flex-col gap-1">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Sayote, Calamansi, Pork Ribs..."
              className="w-full px-3.5 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value as any)}
              className="flex-1 px-3.5 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-400 focus:outline-none cursor-pointer"
            >
              <option value="Proteins">Proteins</option>
              <option value="Produce">Produce</option>
              <option value="Pantry Staples">Pantry Staples</option>
            </select>

            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10 active:scale-95 transition-all cursor-pointer"
            >
              Add
            </button>
          </div>
        </form>

        {/* Feedback alerts */}
        {formFeedback.text && (
          <div className={`p-2.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 ${
            formFeedback.type === "error"
              ? "bg-red-500/5 text-red-500"
              : "bg-emerald-500/5 text-emerald-500"
          }`}>
            {formFeedback.type === "error" ? (
              <AlertCircle className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            {formFeedback.text}
          </div>
        )}
      </section>

      {/* Pantry Grid Cards */}
      <section className="space-y-6 flex-1">
        {categories.map((cat) => {
          if (cat.items.length === 0) return null;

          return (
            <div key={cat.name} className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                {cat.label} ({cat.items.length})
              </h3>
              
              <div className="space-y-2">
                {cat.items.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-slate-200/40 dark:border-slate-850 bg-white dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between w-full sm:w-auto">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {item.name}
                        </span>
                        
                        {/* Mobile Delete Button */}
                        <button
                          onClick={() => handleRemoveIngredient(item.id)}
                          className="sm:hidden p-1 text-slate-400 hover:text-red-500 active:scale-90 transition-all"
                          title="Delete ingredient"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 3-Way Status Toggle */}
                      <div className="flex items-center gap-2">
                        <div className="flex rounded-xl bg-slate-50 dark:bg-slate-950 p-1 border border-slate-200/50 dark:border-slate-850">
                          {(["PLENTY", "LOW", "OUT"] as const).map((statusOption) => {
                            const isSelected = item.status === statusOption;
                            return (
                              <button
                                key={statusOption}
                                onClick={() => handleUpdateStatus(item.id, statusOption)}
                                className={cn(
                                  "px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer",
                                  isSelected
                                    ? statusOption === "PLENTY"
                                      ? "bg-emerald-500 text-white shadow-sm"
                                      : statusOption === "LOW"
                                      ? "bg-amber-500 text-white shadow-sm"
                                      : "bg-red-500 text-white shadow-sm"
                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                )}
                              >
                                {statusOption}
                              </button>
                            );
                          })}
                        </div>

                        {/* Desktop Delete Button */}
                        <button
                          onClick={() => handleRemoveIngredient(item.id)}
                          className="hidden sm:block p-1.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-400 hover:text-red-500 active:scale-95 transition-all cursor-pointer"
                          title="Delete ingredient"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
