import { NextResponse } from "next/server";
import {
  buildLeadSummary,
  getMissingFields,
  isLeadReadyForWhatsapp,
  isSongOrderBlockedByPayment,
  mergeLeadData,
} from "@/lib/lead";
import { BRAND_NAME, PAYMENT_DETAILS_SENTENCE } from "@/lib/contact";
import { buildSalesSystemPrompt } from "@/lib/prompt";
import { cleanText } from "@/lib/sanitize";
import { detectServiceFromText, DIGICODE_SERVICES } from "@/lib/services";
import { sanitizeLead, sanitizeLeadUpdates, sanitizeMessages } from "@/lib/validators";
import { ChatApiResponse, LeadData, ServiceKey, StructuredAssistantOutput } from "@/types/chat";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const FALLBACK_MODEL = "openai/gpt-4o-mini";
const DEFAULT_REQUEST_TIMEOUT_MS = 15000;
const DEFAULT_MAX_HISTORY_MESSAGES = 12;
const DEFAULT_MAX_TOKENS = 420;
const DEFAULT_MAX_REPLY_CHARS = 320;
const SONG_PAYMENT_QUESTION = "Avez-vous déjà l’argent pour lancer la création maintenant ?";
const SONG_NO_PAYMENT_REPLY =
  "D’accord. Dès que vous avez l’argent, revenez lancer la commande et nous pourrons démarrer votre création.";
const SONG_DURATION_SENTENCE = "La création dure environ 10 minutes.";
const SITE_RULE_SENTENCE =
  "Le site vitrine coûte 75000 FCFA, avec livraison en 4 jours.";
const APP_RULE_SENTENCE =
  "L’application web coûte 150000 FCFA, avec livraison en 7 jours.";
const TRAINING_PACK_SENTENCE =
  "Le pack de formation sur la création de vidéos avec Veo 3 coûte 2500 F. C’est une formation complète déjà enregistrée. Après paiement, nous vous envoyons directement le pack sur votre WhatsApp.";
const TRAINING_NOT_LIVE_SENTENCE = "Ce n’est pas une formation en direct, c’est un pack déjà prêt.";
const TRAINING_PAYMENT_FLOW_SENTENCE =
  `L’envoi se fait après paiement et le pack sera transmis sur votre WhatsApp. ${PAYMENT_DETAILS_SENTENCE}`;
const ALIBABA_TRAINING_SENTENCE =
  "La formation Alibaba, achat en Chine et export depuis l’Afrique coûte 75000 F, avec un transitaire offert à la fin de la formation.";
const CHATBOT_CREATION_SENTENCE =
  "La création de chatbot pour entreprise coûte 15000 F, avec livraison sous 3 jours.";
const FACEBOOK_ADS_TRAINING_SENTENCE =
  "La formation Facebook Ads coûte 5000 F et vous aide à mieux lancer des campagnes publicitaires pour attirer des clients sur WhatsApp.";
const AI_TOOLS_TRAINING_SENTENCE =
  "La formation sur les outils d’IA pour gagner de l’argent coûte 10000 F.";
const PREMATURE_READY_REGEX =
  /(demande est pr[êe]te|commande est pr[êe]te|cliquez sur le bouton|soumettre.*whatsapp|soumission whatsapp)/i;
const FINAL_CONFIRMATION_QUESTION =
  "Si tout est correct, répondez simplement : Je confirme, pour afficher le bouton de soumission.";

function parseConfigInt(value: string | undefined, fallback: number, min: number, max: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
}

function supportsResponseFormatJson(model: string): boolean {
  // Avoid an expensive retry for models/providers that often reject response_format.
  return /^(openai|google|anthropic|x-ai)\//i.test(model.trim());
}

function compactLeadForContext(lead: LeadData): Partial<LeadData> {
  const compact: Partial<Record<keyof LeadData, string>> = {};

  for (const [key, value] of Object.entries(lead) as [keyof LeadData, LeadData[keyof LeadData]][]) {
    if (typeof value === "string" && value) {
      compact[key] = value;
    }
  }

  return compact as Partial<LeadData>;
}

function extractStringContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((chunk) => {
        if (typeof chunk === "string") {
          return chunk;
        }

        if (chunk && typeof chunk === "object" && "text" in chunk) {
          return String((chunk as { text?: unknown }).text ?? "");
        }

        return "";
      })
      .join(" ")
      .trim();
  }

  return "";
}

function parseStructuredOutput(rawContent: string): StructuredAssistantOutput | null {
  const trimmed = rawContent.trim();
  if (!trimmed) {
    return null;
  }

  const parseCandidate = (candidate: string): StructuredAssistantOutput | null => {
    try {
      const parsed = JSON.parse(candidate) as StructuredAssistantOutput;
      if (typeof parsed === "object" && parsed !== null && "reply" in parsed) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  };

  const direct = parseCandidate(trimmed);
  if (direct) {
    return direct;
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return parseCandidate(trimmed.slice(firstBrace, lastBrace + 1));
  }

  return null;
}

function sanitizeMissingFields(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => cleanText(item, 80))
    .filter(Boolean)
    .slice(0, 12);
}

function resolveDetectedService(modelValue: unknown, userMessage: string): ServiceKey | null {
  if (typeof modelValue === "string") {
    const trimmed = modelValue.trim();
    const matchedService = DIGICODE_SERVICES.find((service) => service.key === trimmed);

    if (matchedService) {
      return matchedService.key;
    }
  }

  return detectServiceFromText(userMessage);
}

function inferSongPaymentReadyFromText(text: string): "oui" | "non" | "" {
  const normalized = text.toLowerCase();
  const hasYes = /\boui\b|\byes\b/.test(normalized);
  const hasNo = /\bnon\b|\bno\b/.test(normalized);

  if (
    normalized.includes("pas l'argent") ||
    normalized.includes("pas encore") ||
    hasNo ||
    normalized.includes("pas maintenant")
  ) {
    return "non";
  }

  if (
    hasYes ||
    normalized.includes("j'ai l'argent") ||
    normalized.includes("jai l'argent") ||
    normalized.includes("argent disponible")
  ) {
    return "oui";
  }

  return "";
}

function inferClientApprovalFromText(text: string): "oui" | "non" | "" {
  const normalized = text.toLowerCase().trim();

  if (
    normalized === "oui" ||
    normalized === "ok" ||
    normalized === "d'accord" ||
    normalized === "je confirme" ||
    normalized === "je valide" ||
    normalized === "validé" ||
    normalized === "confirmer"
  ) {
    return "oui";
  }

  if (
    normalized === "non" ||
    normalized === "pas encore" ||
    normalized === "attendez" ||
    normalized === "je ne confirme pas" ||
    normalized === "je veux modifier"
  ) {
    return "non";
  }

  return "";
}

function buildSongLeadWithoutPayment(lead: LeadData): LeadData {
  return { ...lead, songPaymentReady: "oui" };
}

function mentionsLiveTraining(text: string): boolean {
  const normalized = text.toLowerCase();
  return (
    normalized.includes("formation en direct") ||
    normalized.includes("cours en direct") ||
    normalized.includes("session en direct") ||
    normalized.includes("cours live") ||
    normalized.includes("session live") ||
    normalized.includes("programmer un cours")
  );
}

function enforceSingleQuestion(text: string): string {
  let firstQuestionSeen = false;
  let output = "";

  for (const character of text) {
    if (character === "?") {
      if (firstQuestionSeen) {
        output += ".";
      } else {
        firstQuestionSeen = true;
        output += "?";
      }
    } else {
      output += character;
    }
  }

  return output.replace(/\s+/g, " ").replace(/\s+\./g, ".").trim();
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || FALLBACK_MODEL;
  const requestTimeoutMs = parseConfigInt(
    process.env.OPENROUTER_TIMEOUT_MS,
    DEFAULT_REQUEST_TIMEOUT_MS,
    4000,
    60000,
  );
  const maxHistoryMessages = parseConfigInt(
    process.env.OPENROUTER_MAX_HISTORY_MESSAGES,
    DEFAULT_MAX_HISTORY_MESSAGES,
    4,
    36,
  );
  const maxTokens = parseConfigInt(
    process.env.OPENROUTER_MAX_TOKENS,
    DEFAULT_MAX_TOKENS,
    180,
    1200,
  );
  const maxReplyChars = parseConfigInt(
    process.env.OPENROUTER_MAX_REPLY_CHARS,
    DEFAULT_MAX_REPLY_CHARS,
    180,
    900,
  );
  const useJsonModeByDefault = supportsResponseFormatJson(model);
  const origin = request.headers.get("origin") ?? "http://localhost:3000";

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY est manquante côté serveur." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const rawMessages = (body as { messages?: unknown })?.messages;
  const rawLead = (body as { lead?: unknown })?.lead;

  const messages = sanitizeMessages(rawMessages);
  const lead = sanitizeLead(rawLead);

  if (!messages.length) {
    return NextResponse.json({ error: "Aucun message valide à traiter." }, { status: 400 });
  }

  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  if (!lastUserMessage) {
    return NextResponse.json({ error: "Un message client est requis." }, { status: 400 });
  }

  const modelMessages = messages.slice(-maxHistoryMessages);

  const contextPayload = {
    services: DIGICODE_SERVICES.map((service) => ({
      key: service.key,
      label: service.label,
      priceLabel: service.priceLabel,
      details: service.details,
      highlights: service.highlights ?? "",
      priceType: service.priceType,
    })),
    currentLead: compactLeadForContext(lead),
    currentlyMissing: getMissingFields(lead),
    instruction: "Mets a jour lead_updates uniquement avec les nouvelles infos detectees.",
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    // Keep prompt + structured business context in one request for deterministic extraction.
    const basePayload = {
      model,
      temperature: 0.25,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: buildSalesSystemPrompt() },
        {
          role: "system",
          content: `Contexte de conversation ${BRAND_NAME} (JSON): ${JSON.stringify(contextPayload)}`,
        },
        ...modelMessages,
      ],
    };

    const makeRequest = (useJsonMode: boolean) =>
      fetch(OPENROUTER_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": origin,
          "X-Title": `${BRAND_NAME} Assistant`,
        },
        body: JSON.stringify(
          useJsonMode ? { ...basePayload, response_format: { type: "json_object" } } : basePayload,
        ),
      });

    let openRouterResponse = await makeRequest(useJsonModeByDefault);
    let responseErrorText = openRouterResponse.ok ? "" : cleanText(await openRouterResponse.text(), 300);

    if (
      useJsonModeByDefault &&
      !openRouterResponse.ok &&
      openRouterResponse.status === 400 &&
      responseErrorText.toLowerCase().includes("response_format")
    ) {
      // Some models ignore JSON mode; retry once without response_format.
      openRouterResponse = await makeRequest(false);
      responseErrorText = openRouterResponse.ok ? "" : cleanText(await openRouterResponse.text(), 300);
    }

    clearTimeout(timeout);

    if (!openRouterResponse.ok) {
      return NextResponse.json(
        {
          error:
            responseErrorText ||
            "Impossible de joindre l'assistant commercial pour le moment. Réessayez dans quelques instants.",
        },
        { status: 502 },
      );
    }

    const data = (await openRouterResponse.json()) as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };

    const modelContent = extractStringContent(data.choices?.[0]?.message?.content);
    const parsed = parseStructuredOutput(modelContent);

    // Merge model extraction into the current lead while preserving previous valid fields.
    const detectedService = resolveDetectedService(parsed?.detected_service, lastUserMessage.content);
    const leadUpdates = sanitizeLeadUpdates(parsed?.lead_updates);
    const inferredSongPayment = inferSongPaymentReadyFromText(lastUserMessage.content);
    const inferredClientApproval = inferClientApprovalFromText(lastUserMessage.content);
    const effectiveLeadUpdates: Partial<LeadData> = { ...leadUpdates };

    if (inferredSongPayment) {
      effectiveLeadUpdates.songPaymentReady = inferredSongPayment;
    }

    if (inferredClientApproval) {
      effectiveLeadUpdates.clientApproval = inferredClientApproval;
    }

    const mergedLead = mergeLeadData(lead, effectiveLeadUpdates, detectedService);

    const missingFromModel = sanitizeMissingFields(parsed?.missing_fields);
    let missingFields = getMissingFields(mergedLead);

    if (missingFromModel.length > missingFields.length) {
      missingFields = missingFromModel;
    }

    const summary = cleanText(parsed?.summary, 2300) || buildLeadSummary(mergedLead);
    let reply =
      cleanText(parsed?.reply, 1000) ||
      cleanText(modelContent, 1000) ||
      "Merci pour ces informations. Je continue à préparer votre demande.";
    let readyForWhatsapp =
      parsed?.ready_for_whatsapp === true
        ? missingFields.length === 0
        : isLeadReadyForWhatsapp(mergedLead);

    if (mergedLead.service === "custom_song") {
      if (!reply.includes(SONG_DURATION_SENTENCE)) {
        reply = `${reply} ${SONG_DURATION_SENTENCE}`.trim();
      }

      if (isSongOrderBlockedByPayment(mergedLead)) {
        reply = SONG_NO_PAYMENT_REPLY;
        readyForWhatsapp = false;
        missingFields = ["Disponibilité financière immédiate (réponse OUI requise pour lancer)"];
      } else {
        const songMissingExcludingPayment = getMissingFields(buildSongLeadWithoutPayment(mergedLead));

        if (songMissingExcludingPayment.length === 0 && mergedLead.songPaymentReady !== "oui") {
          readyForWhatsapp = false;
          if (!reply.includes(SONG_PAYMENT_QUESTION)) {
            const baseLength = Math.max(120, maxReplyChars - SONG_PAYMENT_QUESTION.length - 2);
            reply = `${cleanText(reply, baseLength)} ${SONG_PAYMENT_QUESTION}`.trim();
          }
        }
      }
    }

    if (mergedLead.service === "showcase_website" && !reply.includes(SITE_RULE_SENTENCE)) {
      reply = `${reply} ${SITE_RULE_SENTENCE}`.trim();
    }

    if (mergedLead.service === "web_application" && !reply.includes(APP_RULE_SENTENCE)) {
      reply = `${reply} ${APP_RULE_SENTENCE}`.trim();
    }

    if (mergedLead.service === "ai_video_training") {
      if (mentionsLiveTraining(reply)) {
        reply = TRAINING_PACK_SENTENCE;
      }

      if (!reply.includes(TRAINING_PACK_SENTENCE)) {
        reply = `${reply} ${TRAINING_PACK_SENTENCE}`.trim();
      }

      if (!reply.includes("pas une formation en direct")) {
        reply = `${reply} ${TRAINING_NOT_LIVE_SENTENCE}`.trim();
      }

      if (!reply.toLowerCase().includes("après paiement")) {
        reply = `${reply} ${TRAINING_PAYMENT_FLOW_SENTENCE}`.trim();
      }

      readyForWhatsapp = missingFields.length === 0;

      if (readyForWhatsapp) {
        reply = `${reply} Cliquez sur le bouton de soumission WhatsApp pour finaliser le paiement et l’envoi du pack.`.trim();
      } else {
        const needsName = missingFields.includes("Nom du client");
        const needsWhatsapp = missingFields.includes("Numéro WhatsApp");

        if (needsName || needsWhatsapp) {
          const askParts = [];
          if (needsName) {
            askParts.push("votre nom");
          }
          if (needsWhatsapp) {
            askParts.push("votre numéro WhatsApp");
          }
          reply = `${reply} Pour continuer, indiquez ${askParts.join(" et ")}.`.trim();
        }
      }
    }

    if (mergedLead.service === "alibaba_training" && !reply.includes(ALIBABA_TRAINING_SENTENCE)) {
      reply = `${reply} ${ALIBABA_TRAINING_SENTENCE}`.trim();
    }

    if (mergedLead.service === "business_chatbot_creation" && !reply.includes(CHATBOT_CREATION_SENTENCE)) {
      reply = `${reply} ${CHATBOT_CREATION_SENTENCE}`.trim();
    }

    if (mergedLead.service === "facebook_ads_training" && !reply.includes(FACEBOOK_ADS_TRAINING_SENTENCE)) {
      reply = `${reply} ${FACEBOOK_ADS_TRAINING_SENTENCE}`.trim();
    }

    if (mergedLead.service === "ai_tools_training" && !reply.includes(AI_TOOLS_TRAINING_SENTENCE)) {
      reply = `${reply} ${AI_TOOLS_TRAINING_SENTENCE}`.trim();
    }

    if (mergedLead.clientApproval === "non") {
      readyForWhatsapp = false;
      reply = "D’accord. Indiquez ce que vous souhaitez modifier, puis je mettrai à jour votre demande.";
    }

    if (missingFields.length === 0 && mergedLead.clientApproval !== "oui") {
      readyForWhatsapp = false;
      if (!reply.toLowerCase().includes("je confirme")) {
        reply = `${reply} ${FINAL_CONFIRMATION_QUESTION}`.trim();
      }
    }

    if (!readyForWhatsapp && PREMATURE_READY_REGEX.test(reply)) {
      const missingInfo = missingFields.length
        ? `Il manque encore : ${missingFields.join(", ")}.`
        : "Il manque encore votre confirmation finale avant validation.";
      reply = `Merci. ${missingInfo}`;
    }

    if (readyForWhatsapp) {
      const whatsappGuidance =
        `Votre demande est prête. Cliquez sur le bouton de soumission WhatsApp pour l’envoyer à ${BRAND_NAME}.`;
      if (!reply.toLowerCase().includes("whatsapp")) {
        if (reply.length > maxReplyChars - whatsappGuidance.length - 2) {
          reply = whatsappGuidance;
        } else {
          reply = `${reply} ${whatsappGuidance}`.trim();
        }
      }
    }

    // Keep the flow simple for clients: one question maximum per assistant reply.
    reply = enforceSingleQuestion(reply);

    const response: ChatApiResponse = {
      reply: cleanText(reply, maxReplyChars),
      detectedService: mergedLead.service || null,
      leadUpdates: effectiveLeadUpdates,
      summary,
      missingFields,
      readyForWhatsapp,
    };

    return NextResponse.json(response);
  } catch (error) {
    clearTimeout(timeout);

    const message =
      error instanceof Error && error.name === "AbortError"
        ? "La requête a expiré. Merci de réessayer."
        : "Erreur serveur lors de la génération de la réponse commerciale.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
