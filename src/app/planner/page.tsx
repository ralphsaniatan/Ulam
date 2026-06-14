"use client";

import React, { useEffect, useState } from "react";
import { 
  getSyncCode, 
  loadHouseholdState, 
  pushHouseholdState, 
  fetchHouseholdState,
  swapSingleDayMeal 
} from "@/lib/store";
import { AppStateData, PantryIngredientItem, CustomRecipeItem } from "@/lib/types";
import { ShoppingListModal } from "@/components/ShoppingListModal";
import { 
  RefreshCw, 
  Shuffle, 
  ShoppingBag, 
  CalendarRange, 
  AlertCircle, 
  CheckCircle2,
  Sparkles
} from "lucide-react";

export default function PlannerPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncCode, setSyncCode] = useState("");
  const [state, setState] = useState<AppStateData | null>(null);
  
  // Loading indicators
  const [isRefreshingPlan, setIsRefreshingPlan] = useState(false);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // 1. Initial Load
  useEffect(() => {
    const code = getSyncCode();
    setSyncCode(code);
    
    const init = async () => {
      const loadedState = await loadHouseholdState(code);
      setState(loadedState);
      setIsLoaded(true);
    };
    init();
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

  // 3. Action Handler: Refresh Week Plan querying generate-plan API
  const handleRefreshPlan = async () => {
    setIsRefreshingPlan(true);
    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncCode }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.state) {
          setState(result.state);
        }
      }
    } catch (e) {
      console.error("Failed to generate plan:", e);
    } finally {
      // Small timeout for nice visual impact of AI scanning
      setTimeout(() => setIsRefreshingPlan(false), 800);
    }
  };

  // 4. Action Handler: Swap Single Day Meal
  const handleSwapDayMeal = async (day: string) => {
    const updatedState = swapSingleDayMeal(state, day);
    setState(updatedState);
    await pushHouseholdState(syncCode, updatedState);
  };

  // Calculate ingredient on-hand counts for display on each weekday card
  const getIngredientMatchText = (recipeId: string) => {
    const recipe = state.recipesPool.find((r) => r.id === recipeId);
    if (!recipe) return null;

    const total = recipe.associatedIngredientIds.length;
    if (total === 0) return { text: "No ingredients registered", percent: 0, allReady: false };

    const onHandCount = recipe.associatedIngredientIds.filter((ingId) => {
      const item = state.pantryItems.find((p) => p.id === ingId);
      return item && (item.status === "PLENTY" || item.status === "LOW");
    }).length;

    return {
      text: `${onHandCount}/${total} ingredients ready`,
      percent: Math.round((onHandCount / total) * 100),
      allReady: onHandCount === total
    };
  };

  return (
    <div className="p-5 flex-1 flex flex-col space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <header className="pt-2">
        <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold uppercase px-2 py-0.5 rounded-full tracking-widest">
          Schedule Manager
        </span>
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1">
          Weekly Menu Planner
        </h1>
      </header>

      {/* Cycle Refresh Banner */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 text-white shadow-xl shadow-orange-500/10 relative overflow-hidden group">
        <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
        
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-orange-100">
            <Sparkles className="w-3.5 h-3.5 fill-white/20" />
            OpenClaw / Gemma 4 Engine
          </div>
          <h2 className="text-base font-extrabold tracking-tight">
            Ingredients-First Scheduling
          </h2>
          <p className="text-[11px] text-orange-50/80 leading-relaxed max-w-[280px]">
            Scan active pantry volumes to select dinners using ingredients already in stock.
          </p>
        </div>

        <button
          onClick={handleRefreshPlan}
          disabled={isRefreshingPlan}
          className="mt-5 px-5 py-3 rounded-2xl bg-white text-orange-600 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 hover:bg-orange-50 active:scale-95 transition-all w-full cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshingPlan ? "animate-spin" : ""}`} />
          {isRefreshingPlan ? "Scanning Pantry Ingredients..." : "Refresh Plan for the Week"}
        </button>
      </section>

      {/* Weekday Cards */}
      <section className="space-y-3">
        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
          5-Day Dinner Cycle
        </h3>

        <div className="space-y-3">
          {weekdays.map((day) => {
            const meal = state.weeklySchedule[day] || { recipeId: "", title: "No Menu Selected" };
            const status = getIngredientMatchText(meal.recipeId);

            return (
              <div
                key={day}
                className="p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm flex items-center justify-between gap-4 transition-all duration-300 hover:border-slate-350 dark:hover:border-slate-700"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-orange-500 dark:text-orange-400 uppercase tracking-wider">
                    {day}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                    {meal.title}
                  </h4>
                  
                  {/* Ingredient status indicator badge */}
                  {status && (
                    <div className="flex items-center gap-1.5 pt-1">
                      {status.allReady ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                      )}
                      <span className={`text-[10px] font-bold ${
                        status.allReady 
                          ? "text-emerald-500" 
                          : "text-slate-400 dark:text-slate-500"
                      }`}>
                        {status.text}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleSwapDayMeal(day)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                  title="Swap meal with a different dinner choice"
                >
                  <Shuffle className="w-4 h-4 text-orange-500" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Floating/Bottom Action Card */}
      <section className="pt-2 pb-6">
        <button
          onClick={() => setIsShoppingListOpen(true)}
          className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 dark:shadow-none active:scale-98 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5 text-orange-500" />
          Generate Shopping List
        </button>
      </section>

      {/* Shopping List Modal */}
      <ShoppingListModal
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
        state={state}
      />
    </div>
  );
}
