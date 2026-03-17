export type ChatRole = "user" | "assistant";

export type ServiceKey =
  | "ai_video_training"
  | "custom_song"
  | "powerpoint_templates"
  | "showcase_website"
  | "web_application"
  | "ad_video"
  | "birthday_shoot"
  | "product_shoot"
  | "professional_cv";

export interface UiChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface ClientChatMessage {
  role: ChatRole;
  content: string;
}

export interface LeadData {
  clientName: string;
  clientWhatsapp: string;
  service: ServiceKey | "";
  clientApproval: string;
  description: string;
  budget: string;
  deadline: string;
  email: string;
  language: string;
  creativeStyle: string;
  businessType: string;
  websiteGoal: string;
  websitePages: string;
  websiteContentReady: string;
  appProjectType: string;
  targetAudience: string;
  features: string;
  songOccasion: string;
  songNames: string;
  songMusicStyle: string;
  songVoiceType: string;
  songLanguage: string;
  songTheme: string;
  songPaymentReady: string;
  cvTargetRole: string;
  cvExperience: string;
  cvEducation: string;
  adOffer: string;
  adStyle: string;
  adDuration: string;
  adReferences: string;
  pptType: string;
  pptStyle: string;
  pptSlides: string;
  birthdayEventType: string;
  birthdayEventDate: string;
  birthdayStyle: string;
  birthdayLocation: string;
  productType: string;
  productQuantity: string;
  productStyle: string;
  productUsage: string;
  trainingLevel: string;
  trainingGoal: string;
}

export interface ChatApiRequest {
  messages: ClientChatMessage[];
  lead: LeadData;
}

export interface ChatApiResponse {
  reply: string;
  leadUpdates: Partial<LeadData>;
  detectedService: ServiceKey | null;
  summary: string;
  missingFields: string[];
  readyForWhatsapp: boolean;
  error?: string;
}

export interface StructuredAssistantOutput {
  reply: string;
  lead_updates?: Partial<LeadData>;
  detected_service?: ServiceKey | null;
  summary?: string;
  missing_fields?: string[];
  ready_for_whatsapp?: boolean;
}
