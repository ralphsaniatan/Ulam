export interface PantryIngredientItem {
  id: string;
  name: string;
  category: "Proteins" | "Produce" | "Pantry Staples";
  status: "PLENTY" | "LOW" | "OUT";
  trackingMode?: "status" | "meal" | "piece"; // defaults to "status"
  stockCount?: number; // numeric count of meals or pieces left
}

export interface CustomRecipeItem {
  id: string;
  title: string;
  videoUrl?: string;
  associatedIngredientIds: string[];
  cookingInstructions: string;
}

export interface AppStateData {
  syncCode: string;
  updatedAt: number; // For client-server sync conflict resolution
  pantryItems: PantryIngredientItem[];
  recipesPool: CustomRecipeItem[];
  weeklySchedule: {
    [dayOfWeek: string]: { // "Monday", "Tuesday", etc.
      recipeId: string;
      title: string;
      videoUrl?: string;
    };
  };
  telegramBotToken?: string; // Optional custom bot token
  telegramChatId?: string; // Optional custom group chat ID
}
