import type { AppNotification, SupportCase } from "@/lib/types";
import { delay } from "./mock/db";
import { NOTIFICATIONS, SUPPORT_CASES } from "./mock/seed";

export async function listNotifications(): Promise<AppNotification[]> {
  await delay();
  return structuredClone(NOTIFICATIONS);
}

export async function listSupportCases(): Promise<SupportCase[]> {
  await delay();
  return structuredClone(SUPPORT_CASES);
}

export async function createSupportCase(params: {
  subject: string;
  body: string;
}): Promise<SupportCase> {
  await delay(900);
  const created: SupportCase = {
    id: `CS-${Math.floor(10000 + Math.random() * 89999)}`,
    subject: params.subject,
    status: "open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  SUPPORT_CASES.unshift(created);
  return structuredClone(created);
}
