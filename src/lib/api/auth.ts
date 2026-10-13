import type { User } from "@/lib/types";
import { delay } from "./mock/db";
import { ADMIN_USER, BIZ_USER, TRAVELLER } from "./mock/seed";

/**
 * Mock session. The frontend is never the authority for permissions —
 * the real backend will drive this. Each portal area gets its persona.
 */
export async function getTravellerUser(): Promise<User> {
  await delay(200);
  return structuredClone(TRAVELLER);
}

export async function getBusinessUser(): Promise<User> {
  await delay(200);
  return structuredClone(BIZ_USER);
}

export async function getAdminUser(): Promise<User> {
  await delay(200);
  return structuredClone(ADMIN_USER);
}

export interface SignupParams {
  name: string;
  email: string;
  phone: string;
  accountType: "traveller" | "business";
}

export async function signup(params: SignupParams): Promise<{ ok: true }> {
  await delay(900);
  void params;
  return { ok: true };
}

export async function login(params: {
  identifier: string;
  password: string;
}): Promise<{ ok: true }> {
  await delay(900);
  void params;
  return { ok: true };
}

export async function verifyOtp(code: string): Promise<{ ok: boolean }> {
  await delay(800);
  // Any 6-digit code passes in the mock except 000000.
  return { ok: /^\d{6}$/.test(code) && code !== "000000" };
}

export type VerificationScenario = "pending" | "needs_info";

export type VerificationStepState = "done" | "pending" | "needs_info" | "not_started";

export interface VerificationStatus {
  steps: {
    contact: VerificationStepState;
    identity: VerificationStepState;
    ready: VerificationStepState;
  };
  /** Set when the reviewer asked for another document. */
  needsInfo: { caseRef: string } | null;
}

/**
 * Mock KYC status. The real backend drives this; `scenario` only exists so the
 * prototype can demo both the happy path and the "needs more info" variant
 * (reachable via /verification?scenario=needs-info).
 */
export async function getVerificationStatus(
  scenario: VerificationScenario = "pending",
): Promise<VerificationStatus> {
  await delay(600);
  return {
    steps: {
      contact: "done",
      identity: scenario === "needs_info" ? "needs_info" : "pending",
      ready: "not_started",
    },
    needsInfo: scenario === "needs_info" ? { caseRef: "CS-26-04187" } : null,
  };
}
