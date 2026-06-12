"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  getSyncCode, 
  getHouseholdState, 
  pushHouseholdState, 
  fetchHouseholdState 
} from "@/lib/store";
import { AppStateData, CustomRecipeItem, PantryIngredientItem } from "@/lib/types";
import { 
  Plus, 
  Search, 
  X, 
  Check, 
  BookOpen, 
  Video, 
  Sparkles,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AddRecipePage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncCode, setSyncCode] = useState("");
  const [state, setState] = useState<AppStateData | null>(null);

  // Form Fields State
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [cookingInstructions, setCookingInstructions] = useState("");
  
  // Ingredients Selection State
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Success state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorText, setErrorText] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load
  useEffect(() => {
    const code = getSyncCode();
    setSyncCode(code);
    const loadedState = getHouseholdState(code);
    setState(loadedState);
    setIsLoaded(true);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Filter pantry items based on search query
  const filteredPantry = state.pantryItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle ingredient selection
  const handleToggleIngredient = (id: string) => {
    setSelectedIngredientIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Add new ingredient inline from combobox search
  const handleAddIngredientInline = async () => {
    const name = searchQuery.trim();
    if (!name) return;

    const id = slugify(name);
    
    // Check duplicate
    const exists = state.pantryItems.find(
      (p) => p.id === id || p.name.toLowerCase() === name.toLowerCase()
    );

    let finalId = id;

    if (!exists) {
      const newItem: PantryIngredientItem = {
        id,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        category: "Pantry Staples", // default category for inline added items
        status: "OUT", // defaults to OUT
      };

      const newState = {
        ...state,
        pantryItems: [...state.pantryItems, newItem],
        updatedAt: Date.now(),
      };
      
      setState(newState);
      await pushHouseholdState(syncCode, newState);
      finalId = newItem.id;
    } else {
      finalId = exists.id;
    }

    // Add to selected list if not already there
    if (!selectedIngredientIds.includes(finalId)) {
      setSelectedIngredientIds((prev) => [...prev, finalId]);
    }

    setSearchQuery("");
  };

  // Save Recipe handler
  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");

    const recipeTitle = title.trim();
    if (!recipeTitle) {
      setErrorText("Recipe title is required.");
      return;
    }

    if (selectedIngredientIds.length === 0) {
      setErrorText("Please select at least one ingredient.");
      return;
    }

    setIsSaving(true);

    const recipeId = `custom-${slugify(recipeTitle)}-${Date.now().toString().slice(-4)}`;
    
    const newRecipe: CustomRecipeItem = {
      id: recipeId,
      title: recipeTitle,
      videoUrl: videoUrl.trim() || undefined,
      associatedIngredientIds: selectedIngredientIds,
      cookingInstructions: cookingInstructions.trim(),
    };

    // Update pool, avoid duplicate titles
    const existsIdx = state.recipesPool.findIndex(
      (r) => r.title.toLowerCase() === recipeTitle.toLowerCase()
    );

    let updatedPool = [...state.recipesPool];
    if (existsIdx >= 0) {
      // Overwrite recipe profile
      updatedPool[existsIdx] = {
        ...updatedPool[existsIdx],
        ...newRecipe,
        id: updatedPool[existsIdx].id
      };
    } else {
      updatedPool.push(newRecipe);
    }

    const newState = {
      ...state,
      recipesPool: updatedPool,
      updatedAt: Date.now(),
    };

    setState(newState);
    await pushHouseholdState(syncCode, newState);

    setIsSaving(false);
    setSaveSuccess(true);

    // Redirect to home after 1.5 seconds
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  return (
    <div className="p-5 flex-1 flex flex-col space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <header className="pt-2">
        <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold uppercase px-2 py-0.5 rounded-full tracking-widest">
          Recipe Database
        </span>
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1">
          Custom Recipe Builder
        </h1>
      </header>

      {/* Main Form */}
      <form onSubmit={handleSaveRecipe} className="space-y-5 flex-1 flex flex-col">
        
        {/* Title Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
            Recipe Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Chicken Adobo, Beef Giniling..."
            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 transition-all"
          />
        </div>

        {/* Video URL Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1">
            <Video className="w-3.5 h-3.5 text-orange-500" />
            Recipe Video Link (YouTube, Reels, TikTok)
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 transition-all"
          />
        </div>

        {/* Interactive Combobox Ingredients Picker */}
        <div className="space-y-1.5 relative" ref={dropdownRef}>
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
            Associated Ingredients
          </label>
          
          {/* Selected Ingredients Tag Cloud */}
          {selectedIngredientIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 mb-2">
              {selectedIngredientIds.map((id) => {
                const item = state.pantryItems.find((p) => p.id === id);
                const name = item ? item.name : id;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold"
                  >
                    <span>{name}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleIngredient(id)}
                      className="p-0.5 hover:bg-orange-500/20 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Combobox Search Trigger Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Search pantry dictionary..."
              className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="absolute right-3.5 top-3.5 p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Search Dropdown with backdrop-blur */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-48 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200 no-scrollbar">
              {filteredPantry.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    "{searchQuery}" not found in pantry inventory.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddIngredientInline}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] shadow-md shadow-orange-500/10 transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Inject & Bind Custom Item
                  </button>
                </div>
              ) : (
                <div className="p-1.5 space-y-0.5">
                  {filteredPantry.map((item) => {
                    const isSelected = selectedIngredientIds.includes(item.id);
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => handleToggleIngredient(item.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer",
                          isSelected
                            ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-350"
                        )}
                      >
                        <span>{item.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-orange-500 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cooking Instructions Area */}
        <div className="space-y-1.5 flex-1 flex flex-col">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
            Cooking Instructions & Prep Notes
          </label>
          <textarea
            value={cookingInstructions}
            onChange={(e) => setCookingInstructions(e.target.value)}
            placeholder="Type preparation steps, leftovers handling, and cooking directions here..."
            className="w-full flex-1 min-h-[140px] p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 transition-all resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {errorText && (
            <p className="text-[10px] font-bold text-red-500 text-center">{errorText}</p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            <BookOpen className="w-4 h-4 text-orange-500" />
            {isSaving ? "Saving Recipe Profile..." : "Save Recipe"}
          </button>
        </div>

      </form>

      {/* Success Modal overlay */}
      {saveSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" />
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl w-full max-w-xs p-6 overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Recipe Saved!</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Returning you to Today's Dinner dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
