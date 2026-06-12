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
  ChevronDown,
  Edit,
  Trash2,
  ChevronRight,
  ArrowLeft,
  VideoOff
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AddRecipePage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncCode, setSyncCode] = useState("");
  const [state, setState] = useState<AppStateData | null>(null);

  // View state: "list" (show existing recipes) or "form" (add/edit recipe)
  const [currentView, setCurrentView] = useState<"list" | "form">("list");
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  // List Search
  const [listSearchQuery, setListSearchQuery] = useState("");

  // Form Fields State
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [cookingInstructions, setCookingInstructions] = useState("");
  
  // Ingredients Selection State (Inside Form)
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Success/Error states
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

  // 2. Polling for updates
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

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: Date | any) {
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

  // Form: Filter pantry items based on search query
  const filteredPantry = state.pantryItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // List: Filter recipes pool based on list search
  const filteredRecipes = state.recipesPool.filter((recipe) =>
    recipe.title.toLowerCase().includes(listSearchQuery.toLowerCase())
  );

  // Form: Toggle ingredient selection
  const handleToggleIngredient = (id: string) => {
    setSelectedIngredientIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Form: Add new ingredient inline from combobox search
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
        category: "Pantry Staples",
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

    if (!selectedIngredientIds.includes(finalId)) {
      setSelectedIngredientIds((prev) => [...prev, finalId]);
    }

    setSearchQuery("");
  };

  // List: Start edit view
  const handleStartEdit = (recipe: CustomRecipeItem) => {
    setTitle(recipe.title);
    setVideoUrl(recipe.videoUrl || "");
    setCookingInstructions(recipe.cookingInstructions || "");
    setSelectedIngredientIds(recipe.associatedIngredientIds);
    setEditingRecipeId(recipe.id);
    setCurrentView("form");
    setErrorText("");
  };

  // List: Delete recipe from pool
  const handleDeleteRecipe = async (recipeId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // prevent expanding the card
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    const updatedPool = state.recipesPool.filter((r) => r.id !== recipeId);
    
    // Also remove from weekly schedule if scheduled to avoid breaking references
    const updatedSchedule = { ...state.weeklySchedule };
    Object.entries(updatedSchedule).forEach(([day, meal]) => {
      if (meal.recipeId === recipeId) {
        updatedSchedule[day] = { recipeId: "", title: "Dinner Deleted" };
      }
    });

    const newState = {
      ...state,
      recipesPool: updatedPool,
      weeklySchedule: updatedSchedule,
      updatedAt: Date.now(),
    };

    setState(newState);
    await pushHouseholdState(syncCode, newState);
    
    if (expandedRecipeId === recipeId) {
      setExpandedRecipeId(null);
    }
  };

  // Form: Cancel and return to list
  const handleCancelForm = () => {
    setTitle("");
    setVideoUrl("");
    setCookingInstructions("");
    setSelectedIngredientIds([]);
    setEditingRecipeId(null);
    setCurrentView("list");
    setErrorText("");
  };

  // Form: Save / Edit Recipe handler
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

    let recipeId = editingRecipeId;
    if (!recipeId) {
      // Create new unique ID
      recipeId = `custom-${slugify(recipeTitle)}-${Date.now().toString().slice(-4)}`;
    }
    
    const targetRecipe: CustomRecipeItem = {
      id: recipeId,
      title: recipeTitle,
      videoUrl: videoUrl.trim() || undefined,
      associatedIngredientIds: selectedIngredientIds,
      cookingInstructions: cookingInstructions.trim(),
    };

    let updatedPool = [...state.recipesPool];

    if (editingRecipeId) {
      // Overwrite/Update existing recipe
      const idx = updatedPool.findIndex((r) => r.id === editingRecipeId);
      if (idx >= 0) {
        updatedPool[idx] = targetRecipe;
      } else {
        updatedPool.push(targetRecipe);
      }
    } else {
      // Verify duplicate title if creating new
      const duplicate = updatedPool.find(
        (r) => r.title.toLowerCase() === recipeTitle.toLowerCase()
      );
      if (duplicate) {
        setErrorText(`A recipe named "${recipeTitle}" already exists.`);
        setIsSaving(false);
        return;
      }
      updatedPool.push(targetRecipe);
    }

    // Update scheduled dinners if the edited recipe was scheduled
    const updatedSchedule = { ...state.weeklySchedule };
    if (editingRecipeId) {
      Object.entries(updatedSchedule).forEach(([day, meal]) => {
        if (meal.recipeId === editingRecipeId) {
          updatedSchedule[day] = {
            ...meal,
            title: recipeTitle,
            videoUrl: targetRecipe.videoUrl,
          };
        }
      });
    }

    const newState = {
      ...state,
      recipesPool: updatedPool,
      weeklySchedule: updatedSchedule,
      updatedAt: Date.now(),
    };

    setState(newState);
    await pushHouseholdState(syncCode, newState);

    setIsSaving(false);
    setSaveSuccess(true);

    setTimeout(() => {
      setSaveSuccess(false);
      handleCancelForm(); // Clear inputs and return to list
    }, 1200);
  };

  return (
    <div className="p-5 flex-1 flex flex-col space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <header className="pt-2 flex items-center justify-between">
        <div>
          <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold uppercase px-2 py-0.5 rounded-full tracking-widest">
            Recipe Hub
          </span>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1">
            {currentView === "list" ? "Custom Recipe Pool" : editingRecipeId ? "Edit Recipe Profile" : "Create New Recipe"}
          </h1>
        </div>
        
        {currentView === "list" && (
          <button
            onClick={() => {
              setEditingRecipeId(null);
              setCurrentView("form");
            }}
            className="px-3.5 py-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/10 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New
          </button>
        )}
      </header>

      {/* VIEW A: LIST VIEW */}
      {currentView === "list" && (
        <div className="space-y-4 flex-1 flex flex-col">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={listSearchQuery}
              onChange={(e) => setListSearchQuery(e.target.value)}
              placeholder="Search recipes..."
              className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-950 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            {listSearchQuery && (
              <button
                onClick={() => setListSearchQuery("")}
                className="absolute right-3.5 top-3.5 p-0.5 text-slate-400 hover:text-slate-650"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Recipes List Grid */}
          {filteredRecipes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <BookOpen className="w-8 h-8 text-slate-400" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {listSearchQuery ? "No matching recipes found" : "Your recipe pool is empty"}
              </p>
              {!listSearchQuery && (
                <button
                  onClick={() => setCurrentView("form")}
                  className="px-3.5 py-1.5 rounded-xl border border-orange-500 text-orange-500 hover:bg-orange-500/10 text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
                >
                  Create Your First Recipe
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
              {filteredRecipes.map((recipe) => {
                const isExpanded = expandedRecipeId === recipe.id;
                
                return (
                  <div
                    key={recipe.id}
                    onClick={() => setExpandedRecipeId(isExpanded ? null : recipe.id)}
                    className={cn(
                      "rounded-3xl border transition-all duration-300 overflow-hidden cursor-pointer",
                      isExpanded
                        ? "bg-slate-900 border-slate-800 text-slate-100 shadow-xl"
                        : "bg-white dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-slate-350 dark:hover:border-slate-700"
                    )}
                  >
                    {/* Collapsed Header Summary */}
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className={cn(
                          "text-sm font-extrabold tracking-tight",
                          isExpanded ? "text-white" : "text-slate-800 dark:text-slate-100"
                        )}>
                          {recipe.title}
                        </h4>
                        
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                          <span>{recipe.associatedIngredientIds.length} Ingredients</span>
                          {recipe.videoUrl && (
                            <span className="flex items-center gap-0.5 text-orange-500">
                              <Video className="w-3 h-3" />
                              Video
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Expand Icon */}
                        <ChevronRight className={cn(
                          "w-4 h-4 text-slate-400 transition-transform duration-300",
                          isExpanded && "rotate-90 text-white"
                        )} />
                      </div>
                    </div>

                    {/* Expanded Content Drawer */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 border-t border-slate-800/60 space-y-4 text-left animate-in fade-in duration-200">
                        {/* Video link */}
                        {recipe.videoUrl ? (
                          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-semibold">
                            <span className="flex items-center gap-1.5 text-slate-300 truncate max-w-[200px]">
                              <Video className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                              {recipe.videoUrl}
                            </span>
                            <a
                              href={recipe.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-orange-500 hover:text-orange-400 shrink-0"
                            >
                              Launch Link
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 italic p-1">
                            <VideoOff className="w-3.5 h-3.5" />
                            No tutorial video linked
                          </div>
                        )}

                        {/* Ingredients */}
                        <div className="space-y-1.5">
                          <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            Ingredients
                          </h5>
                          <div className="flex flex-wrap gap-1.5">
                            {recipe.associatedIngredientIds.map((ingId) => {
                              const item = state.pantryItems.find((p) => p.id === ingId);
                              const name = item ? item.name : ingId;
                              const isMissing = item ? item.status === "OUT" : true;
                              
                              return (
                                <span
                                  key={ingId}
                                  className={cn(
                                    "px-2.5 py-1 rounded-xl text-[9px] font-bold border",
                                    isMissing
                                      ? "bg-red-500/10 border-red-500/10 text-red-400"
                                      : "bg-emerald-500/10 border-emerald-500/10 text-emerald-400"
                                  )}
                                >
                                  {name}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Instructions */}
                        {recipe.cookingInstructions && (
                          <div className="space-y-1.5">
                            <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              Cooking instructions
                            </h5>
                            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-2xl border border-slate-800/40">
                              {recipe.cookingInstructions}
                            </p>
                          </div>
                        )}

                        {/* Footer card Actions */}
                        <div className="flex gap-2 pt-2 border-t border-slate-800/40">
                          <button
                            onClick={() => handleStartEdit(recipe)}
                            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit Recipe
                          </button>
                          
                          <button
                            onClick={(e) => handleDeleteRecipe(recipe.id, e)}
                            className="py-2.5 px-3 rounded-xl border border-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                            title="Delete recipe profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW B: FORM VIEW (ADD / EDIT) */}
      {currentView === "form" && (
        <form onSubmit={handleSaveRecipe} className="space-y-5 flex-1 flex flex-col">
          
          {/* Back button / Cancel header */}
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Cancel & Go Back
            </button>
          </div>

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
                className="absolute right-3.5 top-3.5 p-0.5 text-slate-400 hover:text-slate-650 transition-colors"
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
              {isSaving ? "Saving Recipe..." : editingRecipeId ? "Save Changes" : "Save New Recipe"}
            </button>
          </div>

        </form>
      )}

      {/* Success Modal overlay */}
      {saveSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" />
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl w-full max-w-xs p-6 overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                {editingRecipeId ? "Recipe Updated!" : "Recipe Created!"}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Updating database and returning to list.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
