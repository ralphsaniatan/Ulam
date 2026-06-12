import { AppStateData, PantryIngredientItem, CustomRecipeItem } from "./types";
import { defaultPantryItems, defaultRecipes } from "./defaultRecipes";

const LOCAL_STORAGE_KEY_PREFIX = "ulam_state_v2_";

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

// Automatically resolve PLENTY / LOW / OUT from trackingMode and stockCount
export function resolvePantryItemStatus(item: PantryIngredientItem): "PLENTY" | "LOW" | "OUT" {
  const mode = item.trackingMode || "status";
  if (mode === "status") {
    return item.status;
  }
  
  const count = item.stockCount ?? 0;
  if (mode === "meal") {
    // Meal portions: 0 = OUT, 1 = LOW, 2+ = PLENTY
    if (count <= 0) return "OUT";
    if (count === 1) return "LOW";
    return "PLENTY";
  } else {
    // Piece count: 0 = OUT, 1-2 = LOW, 3+ = PLENTY
    if (count <= 0) return "OUT";
    if (count <= 2) return "LOW";
    return "PLENTY";
  }
}

// Score a recipe based on pantry ingredients status: PLENTY = 2, LOW = 1, OUT = 0
export function scoreRecipe(recipe: CustomRecipeItem, pantryItems: PantryIngredientItem[]): number {
  let score = 0;
  for (const ingId of recipe.associatedIngredientIds) {
    const item = pantryItems.find((p) => p.id === ingId);
    if (item) {
      const status = resolvePantryItemStatus(item);
      if (status === "PLENTY") score += 2;
      else if (status === "LOW") score += 1;
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
    let candidates = recipesPool.filter((r) => !usedRecipeIds.has(r.id));
    if (candidates.length === 0) {
      candidates = recipesPool;
    }

    if (candidates.length === 0) {
      schedule[day] = { recipeId: "", title: "No Recipes Available" };
      continue;
    }

    const scoredCandidates = candidates.map((recipe) => ({
      recipe,
      score: scoreRecipe(recipe, pantryItems),
    }));

    scoredCandidates.sort((a, b) => b.score - a.score);

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

  let candidates = state.recipesPool.filter((r) => !otherDaysRecipeIds.has(r.id));
  
  if (candidates.length === 0) {
    candidates = state.recipesPool;
  }

  if (candidates.length === 0) {
    return state;
  }

  const scoredCandidates = candidates.map((recipe) => ({
    recipe,
    score: scoreRecipe(recipe, state.pantryItems),
  }));

  scoredCandidates.sort((a, b) => b.score - a.score);

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

// Helper to normalize/hydrate state properties for backwards compatibility
export function sanitizeState(raw: any): AppStateData {
  const sanitized = { ...raw };
  
  if (sanitized.pantryItems) {
    sanitized.pantryItems = sanitized.pantryItems.map((p: any) => {
      const mode = p.trackingMode || "status";
      const count = p.stockCount ?? (p.status === "PLENTY" ? 3 : p.status === "LOW" ? 1 : 0);
      
      const hydrated = {
        ...p,
        trackingMode: mode,
        stockCount: count,
      };
      
      // Auto-resolve status flag
      hydrated.status = resolvePantryItemStatus(hydrated);
      return hydrated;
    });
  }

  return sanitized as AppStateData;
}

export function getHouseholdState(syncCode: string): AppStateData {
  if (typeof window === "undefined") {
    return {
      syncCode,
      updatedAt: Date.now(),
      pantryItems: defaultPantryItems.map(p => ({ ...p, trackingMode: "status", stockCount: p.status === "PLENTY" ? 3 : 0 })),
      recipesPool: defaultRecipes,
      weeklySchedule: {},
    };
  }

  const key = `${LOCAL_STORAGE_KEY_PREFIX}${syncCode}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.pantryItems && parsed.recipesPool && parsed.weeklySchedule) {
        return sanitizeState(parsed);
      }
    } catch (e) {
      console.error("Corrupted local state. Resetting to defaults.", e);
    }
  }

  const populatedPantry = defaultPantryItems.map(p => ({
    ...p,
    trackingMode: "status" as const,
    stockCount: p.status === "PLENTY" ? 3 : 0
  }));

  const newState: AppStateData = {
    syncCode,
    updatedAt: Date.now(),
    pantryItems: populatedPantry,
    recipesPool: defaultRecipes,
    weeklySchedule: generateWeeklySchedule(populatedPantry, defaultRecipes),
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
      const data = await res.json();
      return sanitizeState(data);
    }
  } catch (e) {
    console.error("Failed to fetch state from server", e);
  }
  return null;
}

export async function pushHouseholdState(syncCode: string, state: AppStateData): Promise<void> {
  if (typeof window === "undefined") return;
  updateHouseholdState(syncCode, state);
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
