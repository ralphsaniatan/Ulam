import { NextResponse } from "next/server";
import { redis } from "../../../lib/redis";
import { AppStateData } from "../../../lib/types";
import { generateWeeklySchedule } from "../../../lib/store";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const syncCode = payload.syncCode;

    if (!syncCode) {
      return NextResponse.json({ error: "Missing syncCode" }, { status: 400 });
    }

    if (!redis) {
      return NextResponse.json({ error: "Redis not configured" }, { status: 500 });
    }

    const key = `ulam_state_${syncCode}`;
    const state = await redis.get<AppStateData>(key);

    if (!state) {
      return NextResponse.json({ error: "Household state not found" }, { status: 404 });
    }

    // Generate weekly schedule
    const newSchedule = generateWeeklySchedule(state.pantryItems, state.recipesPool);
    
    state.weeklySchedule = newSchedule;
    state.updatedAt = Date.now();
    
    await redis.set(key, state);

    return NextResponse.json({
      success: true,
      weeklySchedule: newSchedule,
      updatedAt: state.updatedAt,
      state: state
    });
  } catch (err: any) {
    console.error("Failed to generate weekly plan:", err);
    return NextResponse.json({ error: "Failed to generate weekly plan", details: err?.message }, { status: 500 });
  }
}
