import { AppStateData, PantryIngredientItem, CustomRecipeItem } from "./types";
import { defaultPantryItems, defaultRecipes } from "./defaultRecipes";

const LOCAL_STORAGE_KEY_PREFIX = "ulam_state_v2_"; // Namespace for v2

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
    localStorage.setItem("ulam_sync_code", code.toUpperCase().trim());
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

// Score a recipe based on pantry ingredients status: PLENTY = 2, LOW = 1, OUT/not found = 0
export function scoreRecipe(recipe: CustomRecipeItem, pantryItems: PantryIngredientItem[]): number {
  let score = 0;
  for (const ingId of recipe.associatedIngredientIds) {
    const item = pantryItems.find((p) => p.id === ingId);
    if (item) {
      if (item.status === "PLENTY") score += 2;
      else if (item.status === "LOW") score += 1;
    }
  }
  return score;
}

// Generate weekly 5-day schedule prioritizing on-hand ingredients and introducing variation
export function generateWeeklySchedule(
  pantryItems: PantryIngredientItem[],
  recipesPool: CustomRecipeItem[]
): AppStateData["weeklySchedule"] {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const schedule: AppStateData["weeklySchedule"] = {};
  const usedRecipeIds = new Set<string>();

  for (const day of days) {
    // Filter candidates not used yet
    let candidates = recipesPool.filter((r) => !usedRecipeIds.has(r.id));
    if (candidates.length === 0) {
      candidates = recipesPool; // Fallback: allow repeats if recipes pool is small
    }

    if (candidates.length === 0) {
      // Hard fallback if pool is completely empty
      schedule[day] = { recipeId: "", title: "No Recipes Available" };
      continue;
    }

    // Score candidates
    const scoredCandidates = candidates.map((recipe) => ({
      recipe,
      score: scoreRecipe(recipe, pantryItems),
    }));

    // Sort by score descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Pick from the top-scoring options to avoid repeating same menus every refresh
    const topCount = Math.min(3, scoredCandidates.length);
    const pickIndex = Math.floor(Math.random() * topCount);
    const chosen = scoredCandidates[pickIndex].recipe;

    schedule[day] = {
      recipeId: chosen.id,
      title: chosen.title,
      videoUrl: chosen.videoUrl,
    };
    usedRecipeIds.add(chosen.id);
  }

  return schedule;
}

// Swap single day's recipe while strictly excluding recipes used on other days
export function swapSingleDayMeal(
  state: AppStateData,
  dayToSwap: string
): AppStateData {
  const otherDaysRecipeIds = new Set(
    Object.entries(state.weeklySchedule)
      .filter(([day]) => day !== dayToSwap)
      .map(([_, meal]) => meal.recipeId)
  );

  // Candidates exclude recipes scheduled elsewhere
  let candidates = state.recipesPool.filter((r) => !otherDaysRecipeIds.has(r.id));
  
  if (candidates.length === 0) {
    candidates = state.recipesPool; // Fallback: check whole pool
  }

  if (candidates.length === 0) {
    return state;
  }

  // Score and sort candidates
  const scoredCandidates = candidates.map((recipe) => ({
    recipe,
    score: scoreRecipe(recipe, state.pantryItems),
  }));

  scoredCandidates.sort((a, b) => b.score - a.score);

  // Pick from the top 2 scored recipes (if available) to keep some variety, or first
  const topCount = Math.min(2, scoredCandidates.length);
  const pickIndex = Math.floor(Math.random() * topCount);
  const chosen = scoredCandidates[pickIndex].recipe;

  const newSchedule = {
    ...state.weeklySchedule,
    [dayToSwap]: {
      recipeId: chosen.id,
      title: chosen.title,
      videoUrl: chosen.videoUrl,
    },
  };

  return {
    ...state,
    updatedAt: Date.now(),
    weeklySchedule: newSchedule,
  };
}

export function getHouseholdState(syncCode: string): AppStateData {
  if (typeof window === "undefined") {
    return {
      syncCode,
      updatedAt: Date.now(),
      pantryItems: defaultPantryItems,
      recipesPool: defaultRecipes,
      weeklySchedule: {},
    };
  }

  const key = `${LOCAL_STORAGE_KEY_PREFIX}${syncCode}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      const parsed = JSON.parse(stored) as AppStateData;
      // Ensure essential fields exist
      if (parsed.pantryItems && parsed.recipesPool && parsed.weeklySchedule) {
        return parsed;
      }
    } catch (e) {
      console.error("Corrupted local state. Resetting to defaults.", e);
    }
  }

  // Initialize new state if not found or malformed
  const newState: AppStateData = {
    syncCode,
    updatedAt: Date.now(),
    pantryItems: defaultPantryItems,
    recipesPool: defaultRecipes,
    weeklySchedule: generateWeeklySchedule(defaultPantryItems, defaultRecipes),
  };

  localStorage.setItem(key, JSON.stringify(newState));
  return newState;
}

export function updateHouseholdState(syncCode: string, state: AppStateData): void {
  if (typeof window === "undefined") return;
  const key = `${LOCAL_STORAGE_KEY_PREFIX}${syncCode}`;
  state.updatedAt = Date.now();
  localStorage.setItem(key, JSON.stringify(state));
}

export async function fetchHouseholdState(syncCode: string): Promise<AppStateData | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(`/api/sync?code=${syncCode}`);
    if (res.ok) {
      return (await res.json()) as AppStateData;
    }
  } catch (e) {
    console.error("Failed to fetch state from server", e);
  }
  return null;
}

export async function pushHouseholdState(syncCode: string, state: AppStateData): Promise<void> {
  if (typeof window === "undefined") return;
  updateHouseholdState(syncCode, state); // optimistic local update
  try {
    await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
  } catch (e) {
    console.error("Failed to push state to server", e);
  }
}
