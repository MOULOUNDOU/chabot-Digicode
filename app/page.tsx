"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  FileText,
  Film,
  Globe,
  GraduationCap,
  Menu,
  MessageCircle,
  Moon,
  Music2,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { SalesChat, SidebarPrompt } from "@/components/sales-chat";

const QUICK_ACTIONS = [
  {
    label: "Site vitrine",
    icon: Globe,
    prompt: "Je veux un site vitrine pour mon activité. Pouvez-vous me guider ?",
  },
  {
    label: "Application web",
    icon: BriefcaseBusiness,
    prompt: "Je souhaite développer une application web. Quels détails faut-il fournir ?",
  },
  {
    label: "Formation vidéos (Veo 3)",
    icon: GraduationCap,
    prompt: "Je suis intéressé par le pack de formation vidéos avec Veo 3 à 2500 F.",
  },
  {
    label: "Chanson personnalisée",
    icon: Music2,
    prompt: "Je veux une chanson personnalisée. Pouvez-vous m'aider à préparer la demande ?",
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

type ThemeMode = "dark" | "light";

interface SidebarContentProps {
  mobile?: boolean;
  isLightMode: boolean;
  onCloseMobileSidebar: () => void;
  onNewChat: () => void;
  onQuickAction: (prompt: string) => void;
  onAdvisor: () => void;
  onToggleTheme: () => void;
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
            className="h-6 w-6 rounded-md object-cover"
            priority
          />
          <span className="text-sm font-semibold">Digicode</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              isLightMode ? "bg-emerald-100 text-emerald-700" : "bg-emerald-500/20 text-emerald-300"
            }`}
          >
            En ligne
          </span>
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

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-4 pt-2">
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
              <MessageCircle className="h-4 w-4 text-emerald-500" />
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
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const storedTheme = window.localStorage.getItem("digicode-theme");
    return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
  });

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

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    window.localStorage.setItem("digicode-theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (!mobileSidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSidebarOpen]);

  const toggleTheme = useCallback(() => {
    setThemeMode((previous) => (previous === "dark" ? "light" : "dark"));
  }, []);

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
    <div className={`flex h-[100svh] overflow-hidden md:h-screen ${isLightMode ? "bg-[#eef2f8] text-zinc-900" : "bg-[#1f1f1f] text-zinc-100"}`}>
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

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={closeMobileSidebar}
            className="absolute inset-0 bg-black/45"
          />
          <aside
            className={`absolute inset-y-0 left-0 flex h-full w-[300px] max-w-[85vw] min-h-0 flex-col border-r shadow-2xl ${
              isLightMode ? "border-zinc-200 bg-white" : "border-white/10 bg-[#171717]"
            }`}
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
      ) : null}

      <main className="flex h-full min-h-0 flex-1 flex-col">
        <header
          className={`flex h-14 items-center justify-between border-b px-4 text-sm sm:px-6 ${
            isLightMode ? "border-zinc-200 text-zinc-600" : "border-white/10 text-zinc-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Ouvrir le menu"
              className={`grid h-8 w-8 place-items-center rounded-lg transition md:hidden ${
                isLightMode ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900" : "text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Menu className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isLightMode ? "Passer en mode sombre" : "Passer en mode clair"}
              className={`grid h-8 w-8 place-items-center rounded-lg transition md:hidden ${
                isLightMode ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900" : "text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {isLightMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <Image
              src="/logo-digicode.PNG"
              alt="Logo Digicode"
              width={18}
              height={18}
              className="h-[18px] w-[18px] rounded-sm object-cover md:hidden"
            />
            <span>Digicode</span>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs ${isLightMode ? "bg-zinc-100 text-zinc-600" : "bg-white/5"}`}>
            Service commercial
          </span>
        </header>

        <section className="relative min-h-0 flex-1 overflow-hidden">
          <SalesChat
            queuedPrompt={queuedPrompt}
            resetSignal={resetSignal}
            onPromptConsumed={consumePrompt}
            themeMode={themeMode}
          />
        </section>

        <footer
          className={`flex h-10 shrink-0 items-center justify-between border-t px-4 text-[11px] sm:px-6 ${
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
