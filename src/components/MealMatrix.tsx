"use client";

import React, { useState } from "react";
import { HouseholdState, Recipe } from "../lib/types";
import { defaultRecipes } from "../lib/defaultRecipes";
import { RefreshCw, ChefHat, Baby, Package, Coffee } from "lucide-react";

interface Props {
  schedule: HouseholdState["currentSchedule"];
  onShuffleAll: () => void;
  onShuffleDay: (day: string) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function MealMatrix({ schedule, onShuffleAll, onShuffleDay }: Props) {
  const [expandedDay, setExpandedDay] = useState<string | null>(DAYS[0]);

  const getRecipe = (id: string) => defaultRecipes.find((r) => r.id === id);

  return (
    <div className="space-y-4 matrix-container">
      <div className="flex items-center justify-between no-print">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          Weekly Schedule
        </h2>
        <button
          onClick={onShuffleAll}
          className="text-xs flex items-center gap-1.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-3 py-1.5 rounded-full font-medium transition active:scale-95"
        >
          <RefreshCw size={14} />
          Shuffle All
        </button>
      </div>

      <div className="space-y-3">
        {DAYS.map((day) => {
          const daySchedule = schedule[day];
          if (!daySchedule) return null;

          const dinner = getRecipe(daySchedule.dinnerId);
          const baon = getRecipe(daySchedule.baonId);
          const toddler = getRecipe(daySchedule.toddlerId); // Used for pivot
          const snack = getRecipe(daySchedule.snackId);
          
          const isExpanded = expandedDay === day;

          return (
            <div 
              key={day} 
              className="day-card-row bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all"
            >
              {/* Header / Summary */}
              <div 
                className={`p-4 flex items-center justify-between cursor-pointer no-print ${isExpanded ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}
                onClick={() => setExpandedDay(isExpanded ? null : day)}
              >
                <div>
                  <h3 className="font-bold text-slate-700 dark:text-slate-200">{day}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {dinner?.name} • {baon?.name}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShuffleDay(day);
                  }}
                  className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full transition"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              {/* Print Header (Only visible when printing) */}
              <div className="hidden print:block p-2 border-b border-black font-bold text-lg mb-2">
                {day}
              </div>

              {/* Tracks Content */}
              <div className={`p-4 pt-5 space-y-6 border-t border-slate-100 dark:border-slate-800 print:border-none print:p-0 ${isExpanded ? 'block' : 'hidden print:block'}`}>
                
                {/* Track 1: Dinner */}
                <div className="flex gap-3 items-start group">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl text-orange-600 dark:text-orange-400 mt-1 print:hidden">
                    <ChefHat size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 print:text-black">
                      Dinner
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">
                      {dinner?.name}
                    </div>
                  </div>
                </div>

                {/* Track 2: Baon */}
                <div className="flex gap-3 items-start group">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400 mt-1 print:hidden">
                    <Package size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 print:text-black">
                      School Baon
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">
                      {baon?.name}
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5 print:text-black print:text-xs">
                      (Pivot: {baon?.pivots.baon})
                    </div>
                  </div>
                </div>

                {/* Track 3: Toddler */}
                <div className="flex gap-3 items-start group">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-xl text-green-600 dark:text-green-400 mt-1 print:hidden">
                    <Baby size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 print:text-black">
                      Toddler
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">
                      {toddler?.pivots.toddler || "Toddler Pivot"}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 print:hidden">
                      Derived from {toddler?.name}
                    </div>
                  </div>
                </div>

                {/* Track 4: Snack */}
                <div className="flex gap-3 items-start group">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-xl text-yellow-600 dark:text-yellow-400 mt-1 print:hidden">
                    <Coffee size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 print:text-black">
                      Snack
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">
                      {snack?.name}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
