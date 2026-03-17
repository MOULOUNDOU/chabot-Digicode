export const CONTROL_CHAR_REGEX = /[\u0000-\u001f\u007f-\u009f]/g;

export function cleanText(value: unknown, maxLength = 700): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(CONTROL_CHAR_REGEX, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function sanitizeWhatsappNumber(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/[^\d]/g, "");
}

export function sanitizeEmail(value: unknown): string {
  const cleaned = cleanText(value, 160).toLowerCase();
  if (!cleaned) {
    return "";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(cleaned) ? cleaned : "";
}
