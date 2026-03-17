import { EMPTY_LEAD, mergeLeadData } from "@/lib/lead";
import { cleanText } from "@/lib/sanitize";
import { ClientChatMessage, LeadData } from "@/types/chat";

export const MAX_MESSAGE_LENGTH = 850;
export const MAX_MESSAGE_COUNT = 36;

const LEAD_KEYS = Object.keys(EMPTY_LEAD) as (keyof LeadData)[];

export function sanitizeMessages(input: unknown): ClientChatMessage[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const safeMessages = input
    .filter((item): item is { role: string; content: unknown } => {
      return Boolean(item && typeof item === "object" && "role" in item && "content" in item);
    })
    .map((item) => {
      const role = item.role === "assistant" ? "assistant" : item.role === "user" ? "user" : null;
      const content = cleanText(item.content, MAX_MESSAGE_LENGTH);

      if (!role || !content) {
        return null;
      }

      return { role, content } as ClientChatMessage;
    })
    .filter((item): item is ClientChatMessage => item !== null);

  return safeMessages.slice(-MAX_MESSAGE_COUNT);
}

export function sanitizeLead(input: unknown): LeadData {
  if (!input || typeof input !== "object") {
    return { ...EMPTY_LEAD };
  }

  const rawLead = input as Partial<Record<keyof LeadData, unknown>>;
  const updates: Partial<Record<keyof LeadData, string>> = {};

  for (const key of LEAD_KEYS) {
    if (rawLead[key] === undefined) {
      continue;
    }

    updates[key] = String(rawLead[key]);
  }

  return mergeLeadData({ ...EMPTY_LEAD }, updates as Partial<LeadData>);
}

export function sanitizeLeadUpdates(input: unknown): Partial<LeadData> {
  if (!input || typeof input !== "object") {
    return {};
  }

  const rawUpdates = input as Partial<Record<keyof LeadData, unknown>>;
  const incoming: Partial<Record<keyof LeadData, string>> = {};

  for (const key of LEAD_KEYS) {
    if (rawUpdates[key] === undefined) {
      continue;
    }

    incoming[key] = String(rawUpdates[key]);
  }

  const merged = mergeLeadData({ ...EMPTY_LEAD }, incoming as Partial<LeadData>);
  const cleanUpdates: Partial<Record<keyof LeadData, string>> = {};

  for (const key of LEAD_KEYS) {
    if (merged[key]) {
      cleanUpdates[key] = merged[key];
    }
  }

  return cleanUpdates as Partial<LeadData>;
}
