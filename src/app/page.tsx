"use client";

import React, { useEffect, useState } from "react";
import { 
  getSyncCode, 
  setSyncCode as saveSyncCode, 
  getHouseholdState,
  loadHouseholdState, 
  pushHouseholdState, 
  fetchHouseholdState 
} from "@/lib/store";
import { AppStateData, PantryIngredientItem, CustomRecipeItem } from "@/lib/types";
import { 
  ChefHat, 
  Video, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Database,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function DailyDashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncCode, setSyncCode] = useState("");
  const [state, setState] = useState<AppStateData | null>(null);
  
  // Active day selector (defaults to current weekday, or Monday if weekend)
  const [selectedDay, setSelectedDay] = useState("Monday");
  
  // Sync code modal/input state
  const [isSyncing, setIsSyncing] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [syncError, setSyncError] = useState("");

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // 1. Initial Load
  useEffect(() => {
    const code = getSyncCode();
    setSyncCode(code);
    setInputCode(code);
    
    const init = async () => {
      const loadedState = await loadHouseholdState(code);
      setState(loadedState);
      setIsLoaded(true);
    };
    init();
    
    // Resolve current weekday
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDayName = days[new Date().getDay()];
    if (weekdays.includes(currentDayName)) {
      setSelectedDay(currentDayName);
    } else {
      setSelectedDay("Monday"); // Default to Monday on weekends
    }
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
    const interval = setInterval(poll, 7000); // Poll every 7 seconds
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

  // 3. Resolve active meal and its ingredients
  const activeMeal = state.weeklySchedule[selectedDay] || { recipeId: "", title: "No dinner planned" };
  const recipe = state.recipesPool.find((r) => r.id === activeMeal.recipeId);

  // Map ingredient IDs to pantry items
  const ingredientsList: PantryIngredientItem[] = [];
  if (recipe) {
    recipe.associatedIngredientIds.forEach((ingId) => {
      const pantryItem = state.pantryItems.find((p) => p.id === ingId);
      if (pantryItem) {
        ingredientsList.push(pantryItem);
      } else {
        // Fallback for custom added ingredient
        ingredientsList.push({
          id: ingId,
          name: ingId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
          category: "Pantry Staples",
          status: "OUT",
        });
      }
    });
  }

  // Split ingredients into lists A (Missing) vs B (On-Hand)
  const missingItems = ingredientsList.filter((item) => item.status === "OUT");
  const onHandItems = ingredientsList.filter((item) => item.status === "PLENTY" || item.status === "LOW");

  // 4. Interaction Handler: Toggle Ingredient Status
  const handleToggleIngredientStatus = async (item: PantryIngredientItem, currentStatus: "PLENTY" | "LOW" | "OUT") => {
    const newStatus = currentStatus === "OUT" ? "PLENTY" : "OUT";
    
    // Update status in pantryItems array
    const updatedPantry = state.pantryItems.map((p) => {
      if (p.id === item.id) {
        return { ...p, status: newStatus as any };
      }
      return p;
    });

    const newState = {
      ...state,
      pantryItems: updatedPantry,
      updatedAt: Date.now(),
    };

    setState(newState);
    await pushHouseholdState(syncCode, newState);
  };

  // 5. Switch Household Sync Code
  const handleSyncCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncError("");
    const code = inputCode.toUpperCase().trim();
    if (!code) return;

    try {
      const serverState = await fetchHouseholdState(code);
      if (serverState) {
        saveSyncCode(code);
        setSyncCode(code);
        setState(serverState);
        setIsSyncing(false);
      } else {
        // Code doesn't exist on server, we can initialize it
        saveSyncCode(code);
        setSyncCode(code);
        const localState = getHouseholdState(code);
        setState(localState);
        setIsSyncing(false);
      }
    } catch (err) {
      setSyncError("Failed to verify code. Try again.");
    }
  };

  const todayDateString = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="p-5 flex-1 flex flex-col space-y-6 animate-in fade-in duration-300">
      
      {/* Header Module */}
      <header className="flex justify-between items-start pt-2">
        <div>
          <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold uppercase px-2 py-0.5 rounded-full tracking-widest">
            Ulam Dashboard
          </span>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1">
            {todayDateString}
          </h1>
        </div>

        {/* Sync Code Button */}
        <button
          onClick={() => {
            setInputCode(syncCode);
            setIsSyncing(true);
          }}
          className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Database className="w-3 h-3 text-orange-500" />
          <span>{syncCode}</span>
        </button>
      </header>

      {/* Weekday Selector Slider */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {weekdays.map((day) => {
          const isActive = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/10"
                  : "bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Active Dinner Card */}
      <section className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
        {/* Glow behind */}
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500" />

        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <span className="text-[9px] text-orange-500 dark:text-orange-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 fill-orange-500/20" />
              Tonight's Menu ({selectedDay})
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight leading-tight max-w-[220px]">
              {activeMeal.title}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
            <ChefHat className="w-5 h-5 text-orange-500" />
          </div>
        </div>

        {/* Watch video action trigger */}
        {recipe?.videoUrl ? (
          <a
            href={recipe.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-98 transition-all cursor-pointer text-center"
          >
            <Video className="w-4 h-4" />
            Watch Recipe Video
          </a>
        ) : (
          <div className="mt-5 text-[10px] text-slate-500 font-medium italic">
            No tutorial video linked. Add one in Custom Recipe Builder.
          </div>
        )}
      </section>

      {/* Split Ingredient Inventory Matrix */}
      <section className="flex-1 flex flex-col space-y-5">
        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Tonight's Ingredients Matrix
        </h3>

        {!recipe ? (
          <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              No recipe profile found for this meal.
            </p>
            <p className="text-[10px] text-slate-400">
              Generate a weekly plan or edit the week in Planner.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            
            {/* List A: Missing / Unmatched Items */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Missing ({missingItems.length})
                </span>
                <span className="text-[9px] text-slate-400 italic">Tap to mark on-hand</span>
              </div>
              
              {missingItems.length === 0 ? (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center">
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All ingredients on-hand!
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {missingItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleIngredientStatus(item, item.status)}
                      className="flex justify-between items-center p-3.5 rounded-2xl bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 cursor-pointer active:scale-99 transition-all hover:bg-red-50 dark:hover:bg-red-500/10 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full border border-red-400 flex items-center justify-center group-hover:bg-red-500/10 transition-colors" />
                        <span className="text-xs font-bold text-red-700 dark:text-red-300">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[9px] font-black uppercase text-red-500 tracking-wider">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* List B: On-Hand Items */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  On-Hand ({onHandItems.length})
                </span>
                <span className="text-[9px] text-slate-400 italic">Tap to mark missing</span>
              </div>

              {onHandItems.length === 0 ? (
                <div className="p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No ingredients flagged in pantry.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {onHandItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleIngredientStatus(item, item.status)}
                      className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 cursor-pointer active:scale-99 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-350 line-through opacity-85">
                          {item.name}
                        </span>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider ${
                        item.status === "PLENTY" ? "text-emerald-500" : "text-amber-500"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </section>

      {/* Sync Code Dialog overlay */}
      {isSyncing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsSyncing(false)}
          />
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl w-full max-w-xs p-5 overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Sync Household State</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Enter your family sync code (e.g. PINOY-AB) to connect pantry databases.
            </p>
            
            <form onSubmit={handleSyncCodeSubmit} className="mt-4 space-y-3">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="PINOY-XX"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-extrabold tracking-widest text-slate-800 dark:text-slate-100 uppercase focus:outline-none focus:border-orange-500 text-center"
              />
              {syncError && (
                <p className="text-[10px] font-bold text-red-500 text-center">{syncError}</p>
              )}
              
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSyncing(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] transition-all cursor-pointer"
                >
                  Sync Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
