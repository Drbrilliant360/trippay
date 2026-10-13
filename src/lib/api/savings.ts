import type { Currency, SavingsGoal } from "@/lib/types";
import { db, delay } from "./mock/db";

export async function listSavingsGoals(): Promise<SavingsGoal[]> {
  await delay();
  return structuredClone(db().savingsGoals);
}

export interface CreateGoalParams {
  name: string;
  targetMinor: number;
  currency: Currency;
  targetDate: string;
}

export async function createSavingsGoal(
  params: CreateGoalParams,
): Promise<SavingsGoal> {
  await delay(700);
  const monthsLeft = Math.max(
    1,
    Math.round(
      (new Date(params.targetDate).getTime() - Date.now()) / (30 * 86_400_000),
    ),
  );
  const goal: SavingsGoal = {
    id: crypto.randomUUID(),
    name: params.name,
    target: { amountMinor: params.targetMinor, currency: params.currency },
    saved: { amountMinor: 0, currency: params.currency },
    targetDate: params.targetDate,
    suggestedMonthly: {
      amountMinor: Math.ceil(params.targetMinor / monthsLeft),
      currency: params.currency,
    },
    status: "active",
    createdAt: new Date().toISOString(),
  };
  db().savingsGoals.unshift(goal);
  return structuredClone(goal);
}

export async function toggleGoalStatus(id: string): Promise<SavingsGoal | null> {
  await delay(400);
  const goal = db().savingsGoals.find((g) => g.id === id);
  if (!goal) return null;
  goal.status = goal.status === "active" ? "paused" : "active";
  return structuredClone(goal);
}
