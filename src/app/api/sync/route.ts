import { NextResponse } from "next/server";
import { redis } from "../../../lib/redis";
import { AppStateData } from "../../../lib/types";
import { defaultPantryItems, defaultRecipes } from "../../../lib/defaultRecipes";
import { generateWeeklySchedule } from "../../../lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No sync code provided" }, { status: 400 });
  }

  if (!redis) {
    return NextResponse.json({ error: "Redis not configured" }, { status: 500 });
  }

  const key = `ulam_state_${code}`;
  let state = await redis.get<any>(key);

  // Initialize or Migrate to v2
  if (!state || !state.weeklySchedule || !state.pantryItems) {
    state = {
      syncCode: code,
      updatedAt: Date.now(),
      pantryItems: defaultPantryItems,
      recipesPool: defaultRecipes,
      weeklySchedule: generateWeeklySchedule(defaultPantryItems, defaultRecipes),
    };
    await redis.set(key, state);
  }

  return NextResponse.json(state as AppStateData);
}

export async function POST(request: Request) {
  try {
    const state: AppStateData = await request.json();
    if (!state || !state.syncCode) {
      return NextResponse.json({ error: "Invalid state object" }, { status: 400 });
    }

    if (!redis) {
      return NextResponse.json({ error: "Redis not configured" }, { status: 500 });
    }

    const key = `ulam_state_${state.syncCode}`;
    state.updatedAt = Date.now();
    await redis.set(key, state);

    return NextResponse.json({ success: true, updatedAt: state.updatedAt });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update state" }, { status: 500 });
  }
}
