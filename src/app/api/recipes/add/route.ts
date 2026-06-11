import { NextResponse } from "next/server";
import { redis } from "../../../../lib/redis";
import { HouseholdState, Recipe } from "../../../../lib/types";

// The OpenClaw agent will POST a JSON payload here:
// { syncCode: "PINOY-...", recipe: { id: "...", name: "...", ingredients: [...], category: "..." } }

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const syncCode = payload.syncCode;
    const newRecipe: Recipe = payload.recipe;

    if (!syncCode || !newRecipe || !newRecipe.id) {
      return NextResponse.json({ error: "Missing syncCode or recipe object" }, { status: 400 });
    }

    if (!redis) {
      return NextResponse.json({ error: "Redis not configured" }, { status: 500 });
    }

    const key = `ulam_state_${syncCode}`;
    const state = await redis.get<HouseholdState>(key);

    if (!state) {
      return NextResponse.json({ error: "Household state not found for this code" }, { status: 404 });
    }

    // Add recipe to customRecipes, avoid duplicates
    const exists = state.customRecipes.find(r => r.id === newRecipe.id);
    if (!exists) {
      state.customRecipes.push(newRecipe);
      state.updatedAt = Date.now();
      await redis.set(key, state);
    }

    return NextResponse.json({ success: true, message: "Recipe added successfully", updatedAt: state.updatedAt });
  } catch (err) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
