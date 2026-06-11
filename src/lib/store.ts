import { HouseholdState, Recipe } from "./types";
import { defaultRecipes } from "./defaultRecipes";

const LOCAL_STORAGE_KEY_PREFIX = "ulam_state_";

export function getSyncCode(): string {
  if (typeof window === "undefined") return "";
  let code = localStorage.getItem("ulam_sync_code");
  if (!code) {
    code = generateSyncCode();
    localStorage.setItem("ulam_sync_code", code);
  }
  return code;
}

export function setSyncCode(code: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("ulam_sync_code", code.toUpperCase());
  }
}

export function generateSyncCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "PINOY-";
  for (let i = 0; i < 2; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Very simple heuristic to find primary protein/type
function getRecipeType(recipe: Recipe): string {
  const name = recipe.name.toLowerCase();
  if (name.includes("chicken")) return "chicken";
  if (name.includes("pork") || name.includes("lumpia") || name.includes("adobo")) return "pork";
  if (name.includes("beef") || name.includes("burger") || name.includes("giniling")) return "beef";
  if (name.includes("fish") || name.includes("bangus") || name.includes("tilapia")) return "fish";
  return "veg_other";
}

export function generateSmartSchedule(): HouseholdState["currentSchedule"] {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const schedule: HouseholdState["currentSchedule"] = {};

  const dinners = defaultRecipes.filter((r) => r.category === "Family Dinner");
  const baons = defaultRecipes.filter((r) => r.category === "School Baon");
  const snacks = defaultRecipes.filter((r) => r.category === "Snack Track");

  let lastDinnerType = "";
  let lastBaonType = "";
  let lastSnackId = "";

  for (const day of days) {
    // Pick dinner
    let dinnerCandidates = dinners.filter((d) => getRecipeType(d) !== lastDinnerType);
    if (dinnerCandidates.length === 0) dinnerCandidates = dinners; // Fallback
    const dinner = dinnerCandidates[Math.floor(Math.random() * dinnerCandidates.length)];
    lastDinnerType = getRecipeType(dinner);

    // Pick baon
    let baonCandidates = baons.filter((b) => getRecipeType(b) !== lastBaonType);
    if (baonCandidates.length === 0) baonCandidates = baons;
    const baon = baonCandidates[Math.floor(Math.random() * baonCandidates.length)];
    lastBaonType = getRecipeType(baon);

    // Pick snack
    let snackCandidates = snacks.filter((s) => s.id !== lastSnackId);
    if (snackCandidates.length === 0) snackCandidates = snacks;
    const snack = snackCandidates[Math.floor(Math.random() * snackCandidates.length)];
    lastSnackId = snack.id;

    schedule[day] = {
      dinnerId: dinner.id,
      baonId: baon.id,
      toddlerId: dinner.id, // Derive toddler meal from dinner pivot
      snackId: snack.id,
    };
  }

  return schedule;
}

export function getHouseholdState(syncCode: string): HouseholdState {
  if (typeof window === "undefined") {
    return {
      syncCode,
      updatedAt: Date.now(),
      currentSchedule: {},
      customRecipes: [],
      completedGroceries: [],
    };
  }

  const key = `${LOCAL_STORAGE_KEY_PREFIX}${syncCode}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    return JSON.parse(stored) as HouseholdState;
  }

  // Initialize new state if not found
  const newState: HouseholdState = {
    syncCode,
    updatedAt: Date.now(),
    currentSchedule: generateSmartSchedule(),
    customRecipes: [],
    completedGroceries: [],
  };

  localStorage.setItem(key, JSON.stringify(newState));
  return newState;
}

export function updateHouseholdState(syncCode: string, state: HouseholdState): void {
  if (typeof window === "undefined") return;
  const key = `${LOCAL_STORAGE_KEY_PREFIX}${syncCode}`;
  state.updatedAt = Date.now();
  localStorage.setItem(key, JSON.stringify(state));
}
