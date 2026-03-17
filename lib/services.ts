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
    keywords: ["formation", "video ia", "vidéo ia", "pack ia", "veo 3", "veo3", "formation veo"],
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
    priceLabel: "100000 F",
    priceType: "fixed",
    details: "Création d'un site vitrine professionnel.",
    highlights: "Hébergement inclus + nom de domaine gratuit.",
    keywords: ["site vitrine", "site web", "site internet", "vitrine"],
  },
  {
    key: "web_application",
    label: "Application web",
    priceLabel: "1500000 F",
    priceType: "fixed",
    details: "Développement d'applications web métier.",
    highlights: "Hébergement inclus + nom de domaine gratuit.",
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
    keywords: ["shooting produit", "photo produit", "produit"],
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
  "Chanson personnalisée",
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
