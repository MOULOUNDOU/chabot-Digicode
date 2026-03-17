"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import {
  BriefcaseBusiness,
  FileText,
  Film,
  Globe,
  GraduationCap,
  MessageCircle,
  Music2,
  RefreshCw,
  ShoppingBag,
  Sparkles,
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

export default function Home() {
  const [queuedPrompt, setQueuedPrompt] = useState<SidebarPrompt | null>(null);
  const [resetSignal, setResetSignal] = useState(0);

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

  return (
    <div className="flex h-screen overflow-hidden bg-[#1f1f1f] text-zinc-100">
      <aside className="hidden h-full min-h-0 w-[300px] flex-col border-r border-white/10 bg-[#171717] md:flex">
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
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">En ligne</span>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-4 pt-2">
          <button
            type="button"
            onClick={resetChatToBase}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#232323] px-3 py-2.5 text-sm font-medium text-zinc-100 transition hover:bg-[#2c2c2c]"
          >
            <RefreshCw className="h-4 w-4" />
            Nouveau chat
          </button>

          <section className="rounded-2xl border border-white/10 bg-[#1f1f1f] p-2">
            <p className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
              Actions rapides
            </p>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => queuePrompt(action.prompt)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition hover:bg-white/5"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-zinc-400" />
                    <span className="text-sm text-zinc-200">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#1f1f1f] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Contact direct</p>
            <a
              href={CONTACT_WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-between rounded-lg bg-[#242424] px-3 py-2 text-sm text-zinc-200 transition hover:bg-[#2d2d2d]"
            >
              <span className="inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                WhatsApp
              </span>
              <span className="text-xs text-zinc-400">{CONTACT_WHATSAPP_LABEL}</span>
            </a>
          </section>
        </div>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => queuePrompt("Je veux parler à un conseiller Digicode pour finaliser ma demande.")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2a2a2a] px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-[#343434]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Parler à l&apos;assistant
          </button>
        </div>
      </aside>

      <main className="flex h-full min-h-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-white/10 px-4 text-sm text-zinc-300 sm:px-6">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-digicode.PNG"
              alt="Logo Digicode"
              width={18}
              height={18}
              className="h-[18px] w-[18px] rounded-sm object-cover md:hidden"
            />
            <span>Digicode</span>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs">Service commercial</span>
        </header>

        <section className="relative min-h-0 flex-1 overflow-hidden">
          <SalesChat
            queuedPrompt={queuedPrompt}
            resetSignal={resetSignal}
            onPromptConsumed={consumePrompt}
          />
        </section>
      </main>
    </div>
  );
}
