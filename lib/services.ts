import { ServiceKey } from "@/types/chat";

export interface DigicodeService {
  key: ServiceKey;
  label: string;
  priceLabel: string;
  priceType: "fixed" | "on_request";
  details: string;
  highlights?: string;
  keywords: string[];
}

export const DIGICODE_SERVICES: DigicodeService[] = [
  {
    key: "ai_video_training",
    label: "Formation vidéos",
    priceLabel: "2500 F",
    priceType: "fixed",
    details: "Pack complet déjà enregistré sur la création de vidéos avec Veo 3.",
    keywords: [
      "formation vidéos",
      "formation video",
      "video ia",
      "vidéo ia",
      "pack ia",
      "veo 3",
      "veo3",
      "formation veo",
    ],
  },
  {
    key: "alibaba_training",
    label: "Formation Alibaba",
    priceLabel: "75000 F",
    priceType: "fixed",
    details: "Formation sur Alibaba, l'achat en Chine et l'export depuis l'Afrique.",
    highlights: "Un transitaire est offert à la fin de la formation.",
    keywords: [
      "formation alibaba",
      "alibaba",
      "achat en chine",
      "acheter en chine",
      "export depuis l'afrique",
      "export depuis afrique",
      "exporter depuis l'afrique",
      "exporter depuis afrique",
      "transitaire",
    ],
  },
  {
    key: "custom_song",
    label: "Chanson personnalisée",
    priceLabel: "2500 F",
    priceType: "fixed",
    details: "Chanson sur mesure pour une personne ou un événement.",
    keywords: ["chanson", "musique", "personnalis", "anniversaire chanson"],
  },
  {
    key: "business_chatbot_creation",
    label: "Création de chatbot",
    priceLabel: "15000 F",
    priceType: "fixed",
    details: "Création de chatbot pour les entreprises.",
    highlights: "Livraison sous 3 jours.",
    keywords: [
      "chatbot",
      "chat bot",
      "chatbots",
      "bot entreprise",
      "chatbot entreprise",
      "bot pour entreprise",
    ],
  },
  {
    key: "product_ad_images",
    label: "Création d'images pro",
    priceLabel: "Prix sur demande",
    priceType: "on_request",
    details: "Création d'images professionnelles pour la publicité de vos produits.",
    keywords: [
      "image pro",
      "images pro",
      "image professionnelle",
      "images professionnelles",
      "image publicitaire",
      "publicité produit",
      "publicité des produits",
      "image produit",
      "visuel produit",
    ],
  },
  {
    key: "facebook_ads_training",
    label: "Formation Facebook Ads",
    priceLabel: "5000 F",
    priceType: "fixed",
    details: "Formation pour mieux lancer des campagnes publicitaires et attirer des clients sur WhatsApp.",
    keywords: [
      "facebook ads",
      "formation facebook ads",
      "campagne publicitaire",
      "campagnes publicitaires",
      "publicité facebook",
      "attirer des clients sur whatsapp",
      "clients whatsapp",
    ],
  },
  {
    key: "ai_tools_training",
    label: "Formation outils IA",
    priceLabel: "10000 F",
    priceType: "fixed",
    details: "Formation sur les outils d'IA pour apprendre à générer des revenus.",
    keywords: [
      "outils ia",
      "outils d'ia",
      "formation ia",
      "gagner de l'argent avec ia",
      "gagner argent ia",
      "outil intelligence artificielle",
    ],
  },
  {
    key: "powerpoint_templates",
    label: "Templates PowerPoint",
    priceLabel: "Prix sur demande",
    priceType: "on_request",
    details: "Templates PowerPoint premium adaptés à votre image.",
    keywords: ["powerpoint", "template", "ppt", "presentation"],
  },
  {
    key: "showcase_website",
    label: "Site vitrine",
    priceLabel: "75000 FCFA",
    priceType: "fixed",
    details: "Création d'un site vitrine professionnel.",
    highlights: "Livraison en 4 jours.",
    keywords: ["site vitrine", "site web", "site internet", "vitrine"],
  },
  {
    key: "web_application",
    label: "Application web",
    priceLabel: "150000 FCFA",
    priceType: "fixed",
    details: "Développement d'applications web métier.",
    highlights: "Livraison en 7 jours.",
    keywords: ["application", "app web", "saas", "plateforme"],
  },
  {
    key: "ad_video",
    label: "Vidéo publicitaire",
    priceLabel: "75000 F",
    priceType: "fixed",
    details: "Vidéo promotionnelle pour booster vos ventes.",
    keywords: ["video publicitaire", "spot", "pub", "publicité"],
  },
  {
    key: "birthday_shoot",
    label: "Shooting anniversaire",
    priceLabel: "Prix sur demande",
    priceType: "on_request",
    details: "Photos shooting anniversaire personnalisées.",
    keywords: ["anniversaire", "shooting anniversaire", "photo anniversaire"],
  },
  {
    key: "product_shoot",
    label: "Shooting produit",
    priceLabel: "Prix sur demande",
    priceType: "on_request",
    details: "Photos publicitaires pour produits.",
    keywords: ["shooting produit", "photo produit", "photos produit", "shooting de produit"],
  },
  {
    key: "professional_cv",
    label: "CV professionnel",
    priceLabel: "1500 F",
    priceType: "fixed",
    details: "CV clair et attractif pour vos candidatures.",
    keywords: ["cv", "curriculum", "resume", "emploi"],
  },
];

export const SERVICE_BY_KEY: Record<ServiceKey, DigicodeService> = DIGICODE_SERVICES.reduce(
  (acc, service) => {
    acc[service.key] = service;
    return acc;
  },
  {} as Record<ServiceKey, DigicodeService>,
);

export const STARTER_SUGGESTIONS = [
  "Formation vidéos",
  "Formation Alibaba",
  "Chanson personnalisée",
  "Création de chatbot",
  "Création d'images pro",
  "Formation Facebook Ads",
  "Formation outils IA",
  "Templates PowerPoint",
  "Site vitrine",
  "Application web",
  "Vidéo publicitaire",
  "Shooting anniversaire",
  "Shooting produit",
  "CV professionnel",
];

export function getServicePriceLabel(serviceKey: ServiceKey | ""): string {
  if (!serviceKey) {
    return "À confirmer";
  }
  return SERVICE_BY_KEY[serviceKey]?.priceLabel ?? "À confirmer";
}

export function detectServiceFromText(text: string): ServiceKey | null {
  const normalized = text.toLowerCase();

  for (const service of DIGICODE_SERVICES) {
    if (service.keywords.some((keyword) => normalized.includes(keyword))) {
      return service.key;
    }
  }

  return null;
}
