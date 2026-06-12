"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Copy, Printer, ShoppingBag } from "lucide-react";
import { AppStateData, PantryIngredientItem, CustomRecipeItem } from "../lib/types";

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppStateData;
}

export function ShoppingListModal({ isOpen, onClose, state }: ShoppingListModalProps) {
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const { weeklySchedule, pantryItems, recipesPool } = state;

  // 1. Gather all recipe IDs scheduled for the week
  const scheduledRecipeIds = Object.values(weeklySchedule)
    .map((meal) => meal.recipeId)
    .filter(Boolean);

  // 2. Aggregate all required ingredient IDs
  const requiredIngredientIds = new Set<string>();
  for (const recipeId of scheduledRecipeIds) {
    const recipe = recipesPool.find((r) => r.id === recipeId);
    if (recipe) {
      recipe.associatedIngredientIds.forEach((id) => requiredIngredientIds.add(id));
    }
  }

  // 3. Filter for ingredients marked OUT (or missing from pantry list)
  const missingIngredients: PantryIngredientItem[] = [];
  requiredIngredientIds.forEach((ingId) => {
    const pantryItem = pantryItems.find((p) => p.id === ingId);
    if (pantryItem) {
      if (pantryItem.status === "OUT") {
        missingIngredients.push(pantryItem);
      }
    } else {
      // Fallback if not found: default to OUT and show it
      missingIngredients.push({
        id: ingId,
        name: ingId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        category: "Pantry Staples",
        status: "OUT"
      });
    }
  });

  // 4. Group by category/aisle
  const categories: Record<string, PantryIngredientItem[]> = {
    Proteins: [],
    Produce: [],
    "Pantry Staples": [],
  };

  missingIngredients.forEach((ing) => {
    if (categories[ing.category]) {
      categories[ing.category].push(ing);
    } else {
      categories["Pantry Staples"].push(ing);
    }
  });

  const hasItems = missingIngredients.length > 0;

  // Toggle item checked state in grocery list
  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Copy plain text checklist to clipboard
  const handleCopy = () => {
    let text = `🛒 *GROCERY LIST - PINOY MENU*\n`;
    text += `Generated for sync code: ${state.syncCode}\n\n`;

    let hasContent = false;
    Object.entries(categories).forEach(([cat, items]) => {
      if (items.length > 0) {
        hasContent = true;
        text += `*${cat.toUpperCase()}*\n`;
        items.forEach((item) => {
          const checkMark = checkedItems[item.id] ? "✓ " : "☐ ";
          text += `${checkMark}${item.name}\n`;
        });
        text += `\n`;
      }
    });

    if (!hasContent) {
      text += `All scheduled dinner ingredients are already in stock (Plenty/Low)!`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print checklist
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col border border-slate-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">Grocery Shopping List</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Auto-extracted missing ingredients</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 matrix-container">
          {!hasItems ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">All Stocked Up!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto">
                No missing ingredients detected. All planned dinner meals are covered by your pantry.
              </p>
            </div>
          ) : (
            Object.entries(categories).map(([catName, items]) => {
              if (items.length === 0) return null;

              return (
                <div key={catName} className="space-y-2.5 day-card-row">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                    {catName}
                  </h4>
                  <div className="space-y-1.5">
                    {items.map((item) => {
                      const isChecked = !!checkedItems[item.id];
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleCheck(item.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                            isChecked
                              ? "bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-60"
                              : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          {/* Custom Checkbox */}
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                              isChecked
                                ? "bg-orange-500 text-white"
                                : "border border-slate-300 dark:border-slate-650"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>

                          <span
                            className={`text-xs font-medium grocery-item-line transition-all ${
                              isChecked
                                ? "line-through text-slate-400 dark:text-slate-500"
                                : "text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {hasItems && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-2 z-10 no-print">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Checklist
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-slate-900/10 dark:shadow-none"
            >
              <Printer className="w-3.5 h-3.5" />
              Print List
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
