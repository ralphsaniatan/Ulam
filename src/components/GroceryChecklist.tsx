"use client";

import React, { useMemo, useState } from "react";
import { HouseholdState, RecipeIngredient } from "../lib/types";
import { defaultRecipes } from "../lib/defaultRecipes";
import { aggregateIngredients, AggregatedIngredient } from "../lib/groceryAggregator";
import { CheckSquare, Square, Copy, Check } from "lucide-react";

interface Props {
  schedule: HouseholdState["currentSchedule"];
  completedGroceries: string[];
  onToggleGrocery: (id: string) => void;
  syncCode: string;
}

export function GroceryChecklist({ schedule, completedGroceries, onToggleGrocery, syncCode }: Props) {
  const [copied, setCopied] = useState(false);

  // Compile ingredients from the schedule
  const aisleMap = useMemo(() => {
    const aisles: Record<string, AggregatedIngredient[]> = {
      "Fresh Produce": [],
      "Meat & Frozen": [],
      "Pantry Staples & Asian Aisle": [],
    };

    const days = Object.keys(schedule);
    const rawIngredients: RecipeIngredient[] = [];

    for (const day of days) {
      const { dinnerId, baonId, snackId } = schedule[day];
      const meals = [dinnerId, baonId, snackId];

      for (const mealId of meals) {
        const recipe = defaultRecipes.find((r) => r.id === mealId);
        if (recipe) {
          rawIngredients.push(...recipe.ingredients);
        }
      }
    }

    const aggregated = aggregateIngredients(rawIngredients);
    
    for (const item of aggregated) {
      if (aisles[item.aisle]) {
        aisles[item.aisle].push(item);
      }
    }

    return aisles;
  }, [schedule]);

  const handleCopyWhatsApp = () => {
    let text = `📋 WEEKLY MENU SETUP (Sync Code: ${syncCode})\n--------------------------------------------\n`;
    
    // Append Schedule
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    for (const day of days) {
      const s = schedule[day];
      if (s) {
        const dinner = defaultRecipes.find(r => r.id === s.dinnerId);
        const baon = defaultRecipes.find(r => r.id === s.baonId);
        const toddler = defaultRecipes.find(r => r.id === s.toddlerId);
        const snack = defaultRecipes.find(r => r.id === s.snackId);

        text += `${day.toUpperCase()}\n`;
        text += `• Dinner: ${dinner?.name}\n`;
        text += `• Baon: ${baon?.name}\n`;
        text += `• Toddler: ${toddler?.pivots.toddler}\n`;
        text += `• Snack: ${snack?.name}\n\n`;
      }
    }

    text += `🛒 UAE SHOPPING NEED (Aisle-Sorted)\n--------------------------------------------\n`;

    // Append Groceries
    const aisleNames = ["Fresh Produce", "Meat & Frozen", "Pantry Staples & Asian Aisle"];
    for (const aisle of aisleNames) {
      const items = aisleMap[aisle];
      if (items && items.length > 0) {
        text += `[${aisle}]\n`;
        for (const item of items) {
          const isDone = completedGroceries.includes(item.id);
          text += `${isDone ? '[x]' : '[ ]'} ${item.name} (${item.displayQuantity})\n`;
        }
        text += "\n";
      }
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const aisleNames = ["Fresh Produce", "Meat & Frozen", "Pantry Staples & Asian Aisle"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Grocery Checklist
        </h2>
        <button
          onClick={handleCopyWhatsApp}
          className="text-xs flex items-center gap-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-full font-medium transition active:scale-95"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "WhatsApp"}
        </button>
      </div>

      <div className="space-y-6">
        {aisleNames.map((aisle) => {
          const items = aisleMap[aisle];
          if (!items || items.length === 0) return null;

          return (
            <div key={aisle} className="mb-4">
              <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-slate-800 pb-2 print:text-black print:border-black">
                {aisle}
              </h3>
              <ul className="space-y-2">
                {items.map((item) => {
                  const isCompleted = completedGroceries.includes(item.id);
                  return (
                    <li 
                      key={item.id}
                      className="grocery-item-line flex items-start gap-3 group print:ml-4"
                    >
                      <button 
                        onClick={() => onToggleGrocery(item.id)}
                        className="mt-0.5 text-slate-400 group-hover:text-orange-500 transition no-print"
                      >
                        {isCompleted ? (
                          <CheckSquare className="text-green-500" size={18} />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                      <span className={`text-slate-700 dark:text-slate-300 font-medium ${isCompleted ? 'line-through text-slate-400 dark:text-slate-600' : ''} print:text-black print:no-underline`}>
                        {item.name}
                      </span>
                      <span className={`text-sm text-slate-400 dark:text-slate-500 ml-auto ${isCompleted ? 'line-through' : ''} print:text-black print:no-underline`}>
                        {item.displayQuantity}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
