import { NextResponse } from "next/server";
import { redis } from "../../../lib/redis";
import { HouseholdState } from "../../../lib/types";
import { generateSmartSchedule } from "../../../lib/store";

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
  let state = await redis.get<HouseholdState>(key);

  if (!state) {
    // Initialize new state if not found in database
    state = {
      syncCode: code,
      updatedAt: Date.now(),
      currentSchedule: generateSmartSchedule(),
      customRecipes: [],
      completedGroceries: [],
    };
    await redis.set(key, state);
  }

  return NextResponse.json(state);
}

export async function POST(request: Request) {
  try {
    const state: HouseholdState = await request.json();
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
