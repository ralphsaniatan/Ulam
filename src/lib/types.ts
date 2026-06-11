export interface RecipeIngredient {
  id: string;
  item: string;
  quantity: string;
  aisle: "Fresh Produce" | "Meat & Frozen" | "Pantry Staples & Asian Aisle";
}

export interface Recipe {
  id: string;
  name: string;
  category: "Family Dinner" | "School Baon" | "Toddler Track" | "Snack Track";
  ingredients: RecipeIngredient[];
  pivots: {
    toddler: string;
    baon: string;
  };
}

export interface HouseholdState {
  syncCode: string;
  updatedAt: number;
  currentSchedule: {
    [day: string]: {
      dinnerId: string;
      baonId: string;
      toddlerId: string;
      snackId: string;
    };
  };
  customRecipes: Recipe[];
  completedGroceries: string[]; // Array of string IDs mapping to ingredients e.g. "recipeId-ingredientIndex"
}
