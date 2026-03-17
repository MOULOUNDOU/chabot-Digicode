"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  BriefcaseBusiness,
  FileText,
  Film,
  Globe,
  GraduationCap,
  Menu,
  Moon,
  Music2,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { SalesChat, SidebarPrompt } from "@/components/sales-chat";
import { useVisualViewportHeight } from "@/hooks/use-visual-viewport-height";

const QUICK_ACTIONS = [
  {
    label: "Site vitrine",
    icon: Globe,
    prompt: "Je veux un site vitrine à 75000 FCFA avec livraison en 4 jours. Pouvez-vous me guider ?",
  },
  {
    label: "Application web",
    icon: BriefcaseBusiness,
    prompt: "Je souhaite développer une application web à 150000 FCFA avec livraison en 7 jours. Quels détails faut-il fournir ?",
  },
  {
    label: "Formation vidéos (Veo 3)",
    icon: GraduationCap,
    prompt: "Je suis intéressé par le pack de formation vidéos avec Veo 3 à 2500 F.",
  },
  {
    label: "Formation Alibaba",
    icon: ShoppingBag,
    prompt:
      "Je suis intéressé par la formation Alibaba, achat en Chine et export depuis l'Afrique à 75000 F, avec transitaire offert.",
  },
  {
    label: "Chanson personnalisée",
    icon: Music2,
    prompt: "Je veux une chanson personnalisée. Pouvez-vous m'aider à préparer la demande ?",
  },
  {
    label: "Création de chatbot",
    icon: BriefcaseBusiness,
    prompt: "Je veux un chatbot pour mon entreprise à 15000 F, avec livraison sous 3 jours.",
  },
  {
    label: "Création d'images pro",
    icon: Film,
    prompt: "Je veux des images professionnelles pour faire la publicité de mes produits.",
  },
  {
    label: "Formation Facebook Ads",
    icon: GraduationCap,
    prompt:
      "Je suis intéressé par la formation Facebook Ads à 5000 F pour apprendre à lancer des campagnes et attirer des clients sur WhatsApp.",
  },
  {
    label: "Formation outils IA",
    icon: Sparkles,
    prompt: "Je veux une formation sur les outils d'IA pour gagner de l'argent à 10000 F.",
  },
  {
    label: "CV professionnel",
    icon: FileText,
    prompt: "Je veux un CV professionnel à 1500 F.",
  },
  {
    label: "Vidéo publicitaire",
    icon: Film,
    prompt: "Je veux une vidéo publicitaire à 75000 F.",
  },
  {
    label: "Shooting produit",
    icon: ShoppingBag,
    prompt: "Je veux un shooting photo pour mes produits.",
  },
];

const CONTACT_WHATSAPP_LABEL = "+221 77 726 94 84";
const CONTACT_WHATSAPP_LINK = "https://wa.me/221777269484";
const THEME_STORAGE_KEY = "digicode-theme";

type ThemeMode = "dark" | "light";

function getThemeSnapshot(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
}

function getThemeServerSnapshot(): ThemeMode {
  return "dark";
}

function subscribeTheme(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      onStoreChange();
    }
  };

  const handleLocalThemeChange = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener("digicode-theme-change", handleLocalThemeChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("digicode-theme-change", handleLocalThemeChange);
  };
}

function persistTheme(nextTheme: ThemeMode) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  window.dispatchEvent(new Event("digicode-theme-change"));
}

interface SidebarContentProps {
  mobile?: boolean;
  isLightMode: boolean;
  onCloseMobileSidebar: () => void;
  onNewChat: () => void;
  onQuickAction: (prompt: string) => void;
  onAdvisor: () => void;
  onToggleTheme: () => void;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M13.601 2.326A7.853 7.853 0 0 0 8.0 0C3.582 0 0 3.582 0 8a7.95 7.95 0 0 0 1.145 4.125L0 16l4.003-1.12A7.95 7.95 0 0 0 8 16c4.418 0 8-3.582 8-8a7.853 7.853 0 0 0-2.399-5.674ZM8 14.559a6.53 6.53 0 0 1-3.325-.91l-.239-.142-2.375.664.634-2.315-.154-.245A6.532 6.532 0 0 1 1.44 8c0-3.616 2.944-6.56 6.56-6.56A6.56 6.56 0 0 1 14.56 8c0 3.616-2.944 6.56-6.56 6.56Zm3.594-4.94c-.197-.099-1.167-.576-1.347-.642-.181-.066-.312-.099-.443.099-.132.197-.509.642-.624.775-.115.132-.23.148-.427.049-.197-.099-.833-.307-1.587-.978-.586-.522-.982-1.166-1.098-1.363-.115-.197-.012-.304.087-.402.089-.088.197-.23.296-.345.099-.115.132-.197.197-.329.066-.132.033-.247-.016-.345-.05-.099-.443-1.067-.607-1.46-.159-.384-.32-.332-.443-.338l-.378-.007a.723.723 0 0 0-.525.247c-.181.197-.69.675-.69 1.647 0 .972.707 1.911.805 2.043.099.132 1.393 2.13 3.375 2.986.472.204.84.326 1.127.417.474.151.904.13 1.244.079.379-.057 1.167-.477 1.331-.937.165-.46.165-.855.115-.937-.049-.083-.18-.132-.378-.23Z" />
    </svg>
  );
}

function SidebarContent({
  mobile = false,
  isLightMode,
  onCloseMobileSidebar,
  onNewChat,
  onQuickAction,
  onAdvisor,
  onToggleTheme,
}: SidebarContentProps) {
  return (
    <>
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Image
            src="/logo-digicode.PNG"
            alt="Logo Digicode"
            width={24}
            height={24}
            className="h-6 w-6 rounded-full object-cover"
            priority
          />
          <span className="text-sm font-semibold">Digicode</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isLightMode ? "Passer en mode sombre" : "Passer en mode clair"}
            className={`grid h-8 w-8 place-items-center rounded-lg transition ${
              isLightMode
                ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                : "text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {isLightMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          {mobile ? (
            <button
              type="button"
              onClick={onCloseMobileSidebar}
              aria-label="Fermer le menu"
              className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                isLightMode
                  ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  : "text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-hidden px-3 pb-4 pt-2 md:overflow-y-auto">
        <button
          type="button"
          onClick={onNewChat}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
            isLightMode
              ? "border-zinc-200 bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
              : "border-white/10 bg-[#232323] text-zinc-100 hover:bg-[#2c2c2c]"
          }`}
        >
          <RefreshCw className="h-4 w-4" />
          Nouveau chat
        </button>

        <section
          className={`rounded-2xl border p-2 ${
            isLightMode ? "border-zinc-200 bg-white" : "border-white/10 bg-[#1f1f1f]"
          }`}
        >
          <p
            className={`px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
              isLightMode ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            Actions rapides
          </p>
          <div className="space-y-2">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => onQuickAction(action.prompt)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition ${
                    isLightMode ? "hover:bg-zinc-100" : "hover:bg-white/5"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`} />
                  <span className={`text-sm ${isLightMode ? "text-zinc-700" : "text-zinc-200"}`}>{action.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section
          className={`rounded-2xl border p-3 ${
            isLightMode ? "border-zinc-200 bg-white" : "border-white/10 bg-[#1f1f1f]"
          }`}
        >
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${
              isLightMode ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            Contact direct
          </p>
          <a
            href={CONTACT_WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-2 flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
              isLightMode
                ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                : "bg-[#242424] text-zinc-200 hover:bg-[#2d2d2d]"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <WhatsAppIcon className="h-4 w-4 text-emerald-500" />
              WhatsApp
            </span>
            <span className={`text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>{CONTACT_WHATSAPP_LABEL}</span>
          </a>
        </section>
      </div>

      <div className={`border-t p-3 ${isLightMode ? "border-zinc-200" : "border-white/10"}`}>
        <button
          type="button"
          onClick={onAdvisor}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            isLightMode ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200" : "bg-[#2a2a2a] text-zinc-200 hover:bg-[#343434]"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Parler à l&apos;assistant
        </button>
      </div>
    </>
  );
}

export default function Home() {
  const [queuedPrompt, setQueuedPrompt] = useState<SidebarPrompt | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const themeMode = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  const isLightMode = themeMode === "light";

  const queuePrompt = useCallback((text: string) => {
    setQueuedPrompt({ id: Date.now(), text });
  }, []);

  const resetChatToBase = useCallback(() => {
    setQueuedPrompt(null);
    setResetSignal((value) => value + 1);
  }, []);

  const consumePrompt = useCallback(() => {
    setQueuedPrompt(null);
  }, []);

  useVisualViewportHeight();

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);

  const toggleTheme = useCallback(() => {
    persistTheme(themeMode === "dark" ? "light" : "dark");
  }, [themeMode]);

  const closeMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  const handleQuickAction = useCallback(
    (prompt: string) => {
      queuePrompt(prompt);
      closeMobileSidebar();
    },
    [queuePrompt, closeMobileSidebar],
  );

  const handleNewChat = useCallback(() => {
    resetChatToBase();
    closeMobileSidebar();
  }, [resetChatToBase, closeMobileSidebar]);

  const handleAdvisor = useCallback(() => {
    queuePrompt("Je veux parler à un conseiller Digicode pour finaliser ma demande.");
    closeMobileSidebar();
  }, [queuePrompt, closeMobileSidebar]);

  return (
    <div
      className={`app-shell relative isolate flex min-h-0 w-full overflow-hidden ${isLightMode ? "bg-[#eef2f8] text-zinc-900" : "bg-[#1f1f1f] text-zinc-100"}`}
    >
      <aside
        className={`hidden h-full min-h-0 w-[300px] flex-col border-r md:flex ${
          isLightMode ? "border-zinc-200 bg-white" : "border-white/10 bg-[#171717]"
        }`}
      >
        <SidebarContent
          isLightMode={isLightMode}
          onCloseMobileSidebar={closeMobileSidebar}
          onNewChat={handleNewChat}
          onQuickAction={handleQuickAction}
          onAdvisor={handleAdvisor}
          onToggleTheme={toggleTheme}
        />
      </aside>

      <div
        aria-hidden={!mobileSidebarOpen}
        className={`absolute inset-0 z-40 transition-opacity duration-300 md:hidden ${
          mobileSidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={closeMobileSidebar}
          className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ${
            mobileSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex h-full w-[300px] max-w-[85vw] min-h-0 flex-col border-r shadow-2xl transition-transform duration-300 ease-out ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } ${isLightMode ? "border-zinc-200 bg-white" : "border-white/10 bg-[#171717]"}`}
        >
          <SidebarContent
            mobile
            isLightMode={isLightMode}
            onCloseMobileSidebar={closeMobileSidebar}
            onNewChat={handleNewChat}
            onQuickAction={handleQuickAction}
            onAdvisor={handleAdvisor}
            onToggleTheme={toggleTheme}
          />
        </aside>
      </div>

      <main className="flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden">
        <header
          className={`flex h-16 shrink-0 items-center justify-between border-b px-4 text-[15px] sm:h-14 sm:px-6 sm:text-sm ${
            isLightMode ? "border-zinc-200 text-zinc-600" : "border-white/10 text-zinc-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Ouvrir le menu"
              className={`grid h-10 w-10 place-items-center rounded-lg transition md:hidden ${
                isLightMode ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900" : "text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isLightMode ? "Passer en mode sombre" : "Passer en mode clair"}
              className={`grid h-10 w-10 place-items-center rounded-lg transition md:hidden ${
                isLightMode ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900" : "text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {isLightMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <Image
              src="/logo-digicode.PNG"
              alt="Logo Digicode"
              width={24}
              height={24}
              className="h-6 w-6 rounded-full object-cover md:hidden"
            />
            <span className="text-base font-semibold leading-none sm:text-sm sm:font-medium">Digicode</span>
          </div>
          <span className={`rounded-full px-3.5 py-1.5 text-[13px] sm:px-3 sm:py-1 sm:text-xs ${isLightMode ? "bg-zinc-100 text-zinc-600" : "bg-white/5"}`}>
            Service commercial
          </span>
        </header>

        <section className="relative min-w-0 min-h-0 flex-1 overflow-hidden">
          <SalesChat
            queuedPrompt={queuedPrompt}
            resetSignal={resetSignal}
            onPromptConsumed={consumePrompt}
            themeMode={themeMode}
          />
        </section>

        <footer
          className={`app-footer hidden shrink-0 items-center justify-between border-t px-4 py-2 text-[11px] md:flex md:px-6 md:py-2 ${
            isLightMode ? "border-zinc-200 bg-white/60 text-zinc-500" : "border-white/10 bg-[#1c1c1c] text-zinc-500"
          }`}
        >
          <span>Digicode</span>
          <span className="hidden sm:inline">WhatsApp: {CONTACT_WHATSAPP_LABEL}</span>
        </footer>
      </main>
    </div>
  );
}
