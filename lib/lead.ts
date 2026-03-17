import { BRAND_NAME } from "@/lib/contact";
import { LeadData, ServiceKey } from "@/types/chat";
import { getServicePriceLabel, SERVICE_BY_KEY } from "@/lib/services";
import { cleanText, sanitizeEmail, sanitizeWhatsappNumber } from "@/lib/sanitize";

export const EMPTY_LEAD: LeadData = {
  clientName: "",
  clientWhatsapp: "",
  service: "",
  clientApproval: "",
  description: "",
  budget: "",
  deadline: "",
  email: "",
  language: "",
  creativeStyle: "",
  businessType: "",
  websiteGoal: "",
  websitePages: "",
  websiteContentReady: "",
  appProjectType: "",
  targetAudience: "",
  features: "",
  songOccasion: "",
  songNames: "",
  songMusicStyle: "",
  songVoiceType: "",
  songLanguage: "",
  songTheme: "",
  songPaymentReady: "",
  cvTargetRole: "",
  cvExperience: "",
  cvEducation: "",
  adOffer: "",
  adStyle: "",
  adDuration: "",
  adReferences: "",
  pptType: "",
  pptStyle: "",
  pptSlides: "",
  birthdayEventType: "",
  birthdayEventDate: "",
  birthdayStyle: "",
  birthdayLocation: "",
  productType: "",
  productQuantity: "",
  productStyle: "",
  productUsage: "",
  trainingLevel: "",
  trainingGoal: "",
};

const LEAD_KEYS = Object.keys(EMPTY_LEAD) as (keyof LeadData)[];

const BASE_REQUIRED: (keyof LeadData)[] = [
  "clientName",
  "clientWhatsapp",
  "service",
  "description",
  "deadline",
];

const SERVICE_BASE_REQUIRED_MAP: Partial<Record<ServiceKey, (keyof LeadData)[]>> = {
  ai_video_training: ["clientName", "clientWhatsapp", "service"],
  custom_song: ["clientName", "clientWhatsapp", "service"],
};

const SERVICE_REQUIRED_MAP: Partial<Record<ServiceKey, (keyof LeadData)[]>> = {
  alibaba_training: ["trainingLevel", "trainingGoal"],
  business_chatbot_creation: ["businessType", "features", "targetAudience"],
  product_ad_images: ["adOffer", "creativeStyle"],
  facebook_ads_training: ["trainingLevel", "trainingGoal"],
  ai_tools_training: ["trainingLevel", "trainingGoal"],
  custom_song: [
    "songNames",
    "songMusicStyle",
    "songVoiceType",
    "songOccasion",
    "songLanguage",
    "songTheme",
    "songPaymentReady",
  ],
  showcase_website: ["businessType", "websiteGoal", "websitePages", "websiteContentReady"],
  web_application: ["appProjectType", "features", "targetAudience"],
  ad_video: ["adOffer", "adStyle", "adDuration"],
  powerpoint_templates: ["pptType", "pptStyle"],
  birthday_shoot: ["birthdayEventType", "birthdayEventDate", "birthdayStyle"],
  product_shoot: ["productType", "productQuantity", "productStyle", "productUsage"],
  professional_cv: ["cvTargetRole", "cvExperience", "cvEducation"],
};

const FIELD_LABELS: Record<keyof LeadData, string> = {
  clientName: "Nom du client",
  clientWhatsapp: "Numéro WhatsApp",
  service: "Service souhaité",
  clientApproval: "Confirmation finale du client",
  description: "Description du besoin",
  budget: "Budget approximatif",
  deadline: "Délai souhaité",
  email: "Email",
  language: "Langue préférée",
  creativeStyle: "Style / thème / couleurs",
  businessType: "Type d'activité",
  websiteGoal: "Objectif du site",
  websitePages: "Nombre de pages souhaitées",
  websiteContentReady: "Contenu disponible (oui/non)",
  appProjectType: "Type de projet web",
  targetAudience: "Public cible",
  features: "Pages ou fonctionnalités voulues",
  songOccasion: "Occasion de la chanson",
  songNames: "Noms à mettre dans la chanson",
  songMusicStyle: "Style de musique",
  songVoiceType: "Genre de voix",
  songLanguage: "Langue de la chanson",
  songTheme: "Message principal / thème",
  songPaymentReady: "Disponibilité financière immédiate (OUI/NON)",
  cvTargetRole: "Métier visé",
  cvExperience: "Expérience",
  cvEducation: "Niveau d'étude",
  adOffer: "Produit/service à promouvoir",
  adStyle: "Style de la vidéo",
  adDuration: "Durée souhaitée",
  adReferences: "Références",
  pptType: "Type de présentation",
  pptStyle: "Style de présentation",
  pptSlides: "Nombre de slides",
  birthdayEventType: "Type d'événement",
  birthdayEventDate: "Date prévue",
  birthdayStyle: "Style souhaité",
  birthdayLocation: "Lieu",
  productType: "Type de produit",
  productQuantity: "Quantité de produits",
  productStyle: "Style visuel produit",
  productUsage: "Usage prévu",
  trainingLevel: "Niveau actuel du client",
  trainingGoal: "Objectif de la formation",
};

function isServiceKey(value: string): value is ServiceKey {
  return Object.prototype.hasOwnProperty.call(SERVICE_BY_KEY, value);
}

function normalizeSongPaymentReady(value: string): string {
  const normalized = value.toLowerCase();
  const hasYes = /\boui\b|\byes\b/.test(normalized);
  const hasNo = /\bnon\b|\bno\b/.test(normalized);

  if (
    hasYes ||
    normalized.includes("j'ai l'argent") ||
    normalized.includes("jai l'argent") ||
    normalized.includes("disponible")
  ) {
    return "oui";
  }

  if (
    hasNo ||
    normalized.includes("pas encore") ||
    normalized.includes("pas maintenant") ||
    normalized.includes("pas l'argent")
  ) {
    return "non";
  }

  return "";
}

function normalizeClientApproval(value: string): string {
  const normalized = value.toLowerCase();

  if (
    normalized === "oui" ||
    normalized === "ok" ||
    normalized === "d'accord" ||
    normalized === "je confirme" ||
    normalized === "confirmé" ||
    normalized === "confirme"
  ) {
    return "oui";
  }

  if (
    normalized === "non" ||
    normalized === "pas encore" ||
    normalized === "attendez" ||
    normalized === "je ne confirme pas"
  ) {
    return "non";
  }

  return "";
}

function sanitizeLeadField(key: keyof LeadData, value: unknown): string {
  if (key === "clientWhatsapp") {
    return sanitizeWhatsappNumber(value).slice(0, 20);
  }

  if (key === "email") {
    return sanitizeEmail(value);
  }

  if (key === "service") {
    const candidate = cleanText(value, 60);
    return isServiceKey(candidate) ? candidate : "";
  }

  if (key === "clientApproval") {
    return normalizeClientApproval(cleanText(value, 60));
  }

  if (key === "songPaymentReady") {
    return normalizeSongPaymentReady(cleanText(value, 40));
  }

  return cleanText(value, 420);
}

export function mergeLeadData(
  current: LeadData,
  updates?: Partial<LeadData> | null,
  detectedService?: ServiceKey | null,
): LeadData {
  const next: LeadData = { ...current };
  const nextAsStringRecord = next as unknown as Record<keyof LeadData, string>;

  if (updates) {
    for (const key of LEAD_KEYS) {
      if (updates[key] === undefined || updates[key] === null) {
        continue;
      }

      const value = sanitizeLeadField(key, updates[key]);

      if (!value) {
        continue;
      }

      if (key === "service" && isServiceKey(value)) {
        next.service = value;
        continue;
      }

      nextAsStringRecord[key] = value;
    }
  }

  if (detectedService && isServiceKey(detectedService)) {
    next.service = detectedService;
  }

  return next;
}

export function getMissingFields(lead: LeadData): string[] {
  const requiredKeys = lead.service
    ? [...(SERVICE_BASE_REQUIRED_MAP[lead.service] ?? BASE_REQUIRED)]
    : [...BASE_REQUIRED];

  // Add service-specific qualification fields only after a service has been identified.
  if (lead.service && SERVICE_REQUIRED_MAP[lead.service]) {
    requiredKeys.push(...(SERVICE_REQUIRED_MAP[lead.service] ?? []));
  }

  const uniqueRequired = Array.from(new Set(requiredKeys));

  return uniqueRequired.filter((key) => !lead[key]).map((key) => FIELD_LABELS[key]);
}

export function isLeadReadyForWhatsapp(lead: LeadData): boolean {
  return getMissingFields(lead).length === 0;
}

export function isSongOrderBlockedByPayment(lead: LeadData): boolean {
  return lead.service === "custom_song" && lead.songPaymentReady === "non";
}

export function buildLeadSummary(lead: LeadData): string {
  const serviceLabel = lead.service ? SERVICE_BY_KEY[lead.service].label : "Non défini";
  const priceLabel = getServicePriceLabel(lead.service);

  const lines = [
    `Client: ${lead.clientName || "Non renseigné"}`,
    `WhatsApp: ${lead.clientWhatsapp || "Non renseigné"}`,
    `Service: ${serviceLabel}`,
    `Validation client: ${lead.clientApproval || "Non confirmée"}`,
    `Prix indiqué: ${priceLabel}`,
    `Besoin principal: ${lead.description || "Non renseigné"}`,
    `Budget: ${lead.budget || "Non renseigné"}`,
    `Délai: ${lead.deadline || "Non renseigné"}`,
    `Email: ${lead.email || "Non renseigné"}`,
    `Langue: ${lead.language || "Français"}`,
  ];

  if (lead.creativeStyle) {
    lines.push(`Style / thème: ${lead.creativeStyle}`);
  }

  if (lead.businessType) {
    lines.push(`Activité: ${lead.businessType}`);
  }

  if (lead.websiteGoal || lead.websitePages || lead.websiteContentReady) {
    lines.push(
      `Site vitrine: Objectif=${lead.websiteGoal || "-"}; Pages=${lead.websitePages || "-"}; Contenu prêt=${lead.websiteContentReady || "-"}`,
    );
  }

  if (lead.appProjectType || lead.features || lead.targetAudience) {
    lines.push(
      `Application web: Projet=${lead.appProjectType || "-"}; Fonctionnalités=${lead.features || "-"}; Public cible=${lead.targetAudience || "-"}`,
    );
  }

  if (lead.features) {
    lines.push(`Pages/Fonctionnalités: ${lead.features}`);
  }

  if (
    lead.songNames ||
    lead.songMusicStyle ||
    lead.songVoiceType ||
    lead.songOccasion ||
    lead.songLanguage ||
    lead.songTheme
  ) {
    lines.push(
      `Chanson: Noms=${lead.songNames || "-"}; Style=${lead.songMusicStyle || "-"}; Voix=${lead.songVoiceType || "-"}; Occasion=${lead.songOccasion || "-"}; Langue=${lead.songLanguage || "-"}; Thème=${lead.songTheme || "-"}`,
    );
  }

  if (lead.songPaymentReady) {
    lines.push(`Disponibilité financière immédiate: ${lead.songPaymentReady}`);
  }

  if (lead.cvTargetRole || lead.cvExperience || lead.cvEducation) {
    lines.push(
      `CV: Métier=${lead.cvTargetRole || "-"}; Expérience=${lead.cvExperience || "-"}; Études=${lead.cvEducation || "-"}`,
    );
  }

  if (lead.service === "product_ad_images" && (lead.adOffer || lead.creativeStyle || lead.description)) {
    lines.push(
      `Images pub produits: Produit=${lead.adOffer || "-"}; Style=${lead.creativeStyle || "-"}; Brief=${lead.description || "-"}`,
    );
  } else if (lead.adOffer || lead.adStyle || lead.adDuration || lead.adReferences) {
    lines.push(
      `Vidéo pub: Offre=${lead.adOffer || "-"}; Style=${lead.adStyle || "-"}; Durée=${lead.adDuration || "-"}; Références=${lead.adReferences || "-"}`,
    );
  }

  if (lead.pptType || lead.pptStyle || lead.pptSlides) {
    lines.push(
      `Templates PowerPoint: Type=${lead.pptType || "-"}; Style=${lead.pptStyle || "-"}; Slides=${lead.pptSlides || "-"}`,
    );
  }

  if (lead.birthdayEventType || lead.birthdayEventDate || lead.birthdayStyle || lead.birthdayLocation) {
    lines.push(
      `Shooting anniversaire: Événement=${lead.birthdayEventType || "-"}; Date=${lead.birthdayEventDate || "-"}; Style=${lead.birthdayStyle || "-"}; Lieu=${lead.birthdayLocation || "-"}`,
    );
  }

  if (lead.productType || lead.productQuantity || lead.productStyle || lead.productUsage) {
    lines.push(
      `Shooting produit: Type=${lead.productType || "-"}; Quantité=${lead.productQuantity || "-"}; Style=${lead.productStyle || "-"}; Usage=${lead.productUsage || "-"}`,
    );
  }

  if (lead.trainingLevel || lead.trainingGoal) {
    lines.push(
      `Formation: Niveau=${lead.trainingLevel || "-"}; Objectif=${lead.trainingGoal || "-"}`,
    );
  }

  if (lead.service === "ai_video_training") {
    lines.push("Offre formation: pack complet Veo 3 déjà enregistré.");
    lines.push("Mode de livraison: envoi sur WhatsApp après paiement.");
  }

  if (lead.service === "alibaba_training") {
    lines.push("Bonus formation: un transitaire est offert à la fin de la formation.");
  }

  if (lead.service === "business_chatbot_creation") {
    lines.push("Livraison annoncée: sous 3 jours.");
  }

  return lines.join("\n");
}

export function buildWhatsappMessage(lead: LeadData, summary?: string): string {
  const serviceLabel = lead.service ? SERVICE_BY_KEY[lead.service].label : "Non défini";
  const finalSummary = summary?.trim() ? summary.trim() : buildLeadSummary(lead);
  const summaryLines = finalSummary
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `- ${line}`);

  return [
    `Bonjour ${BRAND_NAME}, voici ma demande :`,
    "",
    "Informations client",
    `- Nom : ${lead.clientName || "Non renseigné"}`,
    `- WhatsApp : ${lead.clientWhatsapp || "Non renseigné"}`,
    `- Email : ${lead.email || "Non renseigné"}`,
    "",
    "Commande",
    `- Service : ${serviceLabel}`,
    `- Prix communiqué : ${getServicePriceLabel(lead.service)}`,
    `- Description : ${lead.description || "Non renseignée"}`,
    `- Budget : ${lead.budget || "Non renseigné"}`,
    `- Délai : ${lead.deadline || "Non renseigné"}`,
    "",
    "Résumé structuré",
    ...summaryLines,
    "",
    "Merci.",
  ].join("\n");
}

export function buildWhatsappLink(
  lead: LeadData,
  whatsappNumber: string,
  summary?: string,
): string {
  const normalizedNumber = sanitizeWhatsappNumber(whatsappNumber);

  if (!normalizedNumber) {
    return "";
  }

  const message = buildWhatsappMessage(lead, summary);
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}
