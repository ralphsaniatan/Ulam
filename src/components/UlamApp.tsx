"use client";

import React, { useEffect, useState } from "react";
import { HouseholdState } from "../lib/types";
import { 
  getSyncCode, 
  setSyncCode as saveSyncCode, 
  getHouseholdState, 
  updateHouseholdState,
  generateSmartSchedule 
} from "../lib/store";
import { MealMatrix } from "./MealMatrix";
import { GroceryChecklist } from "./GroceryChecklist";
import { VideoSubmission } from "./VideoSubmission";
import { SyncManager } from "./SyncManager";

export function UlamApp() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncCode, setSyncCode] = useState("");
  const [state, setState] = useState<HouseholdState | null>(null);

  // Initialize state on client mount
  useEffect(() => {
    const code = getSyncCode();
    setSyncCode(code);
    const loadedState = getHouseholdState(code);
    setState(loadedState);
    setIsLoaded(true);
  }, []);

  const handleUpdateSyncCode = (newCode: string) => {
    saveSyncCode(newCode);
    setSyncCode(newCode);
    const loadedState = getHouseholdState(newCode);
    setState(loadedState);
  };

  const handleShuffleAll = () => {
    if (!state) return;
    const newSchedule = generateSmartSchedule();
    const newState = { ...state, currentSchedule: newSchedule };
    setState(newState);
    updateHouseholdState(syncCode, newState);
  };

  const handleShuffleDay = (day: string) => {
    if (!state) return;
    // For simplicity, just generate a new week and pluck out that day's new schedule
    // A better approach would be generating just that day, ensuring it doesn't match the day before/after
    const tempSchedule = generateSmartSchedule();
    const newState = {
      ...state,
      currentSchedule: {
        ...state.currentSchedule,
        [day]: tempSchedule[day],
      }
    };
    setState(newState);
    updateHouseholdState(syncCode, newState);
  };

  const handleToggleGrocery = (id: string) => {
    if (!state) return;
    const completed = [...state.completedGroceries];
    const index = completed.indexOf(id);
    if (index >= 0) {
      completed.splice(index, 1);
    } else {
      completed.push(id);
    }
    const newState = { ...state, completedGroceries: completed };
    setState(newState);
    updateHouseholdState(syncCode, newState);
  };

  if (!isLoaded || !state) {
    return (
      <div className="flex-1 flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Loading weekly menu...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-40 pt-4 no-print">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-orange-500">ULAM</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Weekly Orchestrator</p>
        </div>
        <SyncManager syncCode={syncCode} onUpdateSyncCode={handleUpdateSyncCode} />
      </header>

      <div className="flex-1 space-y-10 relative">
        <VideoSubmission />

        <section className="animate-in slide-in-from-bottom-8 duration-700 fade-in fill-mode-backwards" style={{animationDelay: '100ms'}}>
          <MealMatrix 
            schedule={state.currentSchedule} 
            onShuffleAll={handleShuffleAll}
            onShuffleDay={handleShuffleDay}
          />
        </section>

        <section className="animate-in slide-in-from-bottom-12 duration-700 fade-in fill-mode-backwards" style={{animationDelay: '200ms'}}>
          <GroceryChecklist 
            schedule={state.currentSchedule}
            completedGroceries={state.completedGroceries}
            onToggleGrocery={handleToggleGrocery}
            syncCode={syncCode}
          />
        </section>
      </div>
    </>
  );
}
