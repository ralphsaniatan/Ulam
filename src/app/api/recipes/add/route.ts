import { NextResponse } from "next/server";
import { redis } from "../../../../lib/redis";
import { AppStateData, CustomRecipeItem, PantryIngredientItem } from "../../../../lib/types";
import { defaultPantryItems, defaultRecipes } from "../../../../lib/defaultRecipes";
import { generateWeeklySchedule } from "../../../../lib/store";

// Helper to slugify strings for IDs
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

// Clean quantities/units from ingredient name (e.g. "500g Chicken breast" -> "Chicken breast")
function cleanIngredientName(raw: string): string {
  let cleaned = raw.trim();
  
  // Remove starting numbers and common fractions
  cleaned = cleaned.replace(/^[\d\.\/\s]+(?:g|kg|ml|l|pcs?|tbsp|tsp|cups?|cans?|heads?|thumbs?|bunches?|packs?|tetra|pieces?|cloves?)?\s+(?:of\s+)?/i, "");
  
  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// Simple heuristic to guess category
function guessCategory(name: string): "Proteins" | "Produce" | "Pantry Staples" {
  const lower = name.toLowerCase();
  
  const proteins = ["chicken", "pork", "beef", "fish", "meat", "tilapia", "hotdog", "egg", "shrimp", "squid", "tuna", "crab", "ham", "bacon"];
  const produce = ["garlic", "onion", "sayote", "ginger", "spinach", "gabi", "radish", "kangkong", "potato", "cabbage", "corn", "carrot", "tomato", "eggplant", "talong", "ampalaya", "melon", "vegetable", "lemon", "lime", "calamansi", "chili", "pepper", "onion", "scallion"];
  
  if (proteins.some(p => lower.includes(p))) return "Proteins";
  if (produce.some(p => lower.includes(p))) return "Produce";
  return "Pantry Staples";
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const syncCode = payload.syncCode;

    if (!syncCode) {
      return NextResponse.json({ error: "Missing syncCode" }, { status: 400 });
    }

    const recipeData = payload.recipe || payload;
    const rawTitle = recipeData.title || recipeData.name;
    
    if (!rawTitle) {
      return NextResponse.json({ error: "Missing recipe title or name" }, { status: 400 });
    }

    if (!redis) {
      return NextResponse.json({ error: "Redis not configured" }, { status: 500 });
    }

    const key = `ulam_state_${syncCode}`;
    let state = await redis.get<any>(key);

    // Auto-initialize state if not found
    if (!state || !state.weeklySchedule || !state.pantryItems) {
      state = {
        syncCode: syncCode,
        updatedAt: Date.now(),
        pantryItems: defaultPantryItems,
        recipesPool: defaultRecipes,
        weeklySchedule: generateWeeklySchedule(defaultPantryItems, defaultRecipes),
      };
    }

    const title = rawTitle.trim();
    const recipeId = `custom-${slugify(title)}-${Date.now().toString().slice(-4)}`;
    
    // Parse video URL
    const videoUrl = recipeData.videoUrl || recipeData.video || recipeData.video_url || undefined;
    
    // Parse cooking instructions
    let cookingInstructions = recipeData.cookingInstructions || recipeData.process || recipeData.instructions || recipeData.steps || "";
    if (Array.isArray(cookingInstructions)) {
      cookingInstructions = cookingInstructions.join("\n");
    }

    // Process ingredients list
    const rawIngredients: any[] = recipeData.ingredients || [];
    const associatedIngredientIds: string[] = [];

    for (const rawIng of rawIngredients) {
      let rawName = "";
      if (typeof rawIng === "string") {
        rawName = rawIng;
      } else if (rawIng && typeof rawIng === "object") {
        rawName = rawIng.name || rawIng.item || rawIng.ingredient || "";
      }

      if (!rawName.trim()) continue;

      const name = cleanIngredientName(rawName);
      const ingId = slugify(name);

      // Check if it already exists in global pantryItems
      let existingItem = state.pantryItems.find(
        (p: PantryIngredientItem) => p.id === ingId || p.name.toLowerCase() === name.toLowerCase()
      );

      if (!existingItem) {
        // Inject new item to state pantry items
        const newItem: PantryIngredientItem = {
          id: ingId,
          name: name,
          category: guessCategory(name),
          status: "OUT", // Defaults to OUT as per PRD
        };
        state.pantryItems.push(newItem);
        associatedIngredientIds.push(ingId);
      } else {
        associatedIngredientIds.push(existingItem.id);
      }
    }

    // Create the new CustomRecipeItem
    const newRecipe: CustomRecipeItem = {
      id: recipeId,
      title: title,
      videoUrl: videoUrl,
      associatedIngredientIds: associatedIngredientIds,
      cookingInstructions: cookingInstructions,
    };

    // Prevent duplicates in pool by title
    const exists = state.recipesPool.find((r: CustomRecipeItem) => r.title.toLowerCase() === title.toLowerCase());
    if (!exists) {
      state.recipesPool.push(newRecipe);
    } else {
      // Overwrite/update existing recipe with same title
      const idx = state.recipesPool.findIndex((r: CustomRecipeItem) => r.title.toLowerCase() === title.toLowerCase());
      state.recipesPool[idx] = { ...state.recipesPool[idx], ...newRecipe, id: state.recipesPool[idx].id };
    }

    state.updatedAt = Date.now();
    await redis.set(key, state);

    return NextResponse.json({
      success: true,
      message: "Recipe ingested successfully",
      recipeId: exists ? exists.id : recipeId,
      updatedAt: state.updatedAt,
    });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Failed to process webhook request", details: err?.message }, { status: 500 });
  }
}
