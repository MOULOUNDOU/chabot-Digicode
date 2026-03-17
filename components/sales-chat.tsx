"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardCopy,
  LoaderCircle,
  Plus,
  RefreshCw,
  SendHorizonal,
} from "lucide-react";
import { ChatBubble } from "@/components/chat-bubble";
import { buildLeadSummary, buildWhatsappLink, EMPTY_LEAD, mergeLeadData } from "@/lib/lead";
import { cleanText, sanitizeWhatsappNumber } from "@/lib/sanitize";
import { STARTER_SUGGESTIONS } from "@/lib/services";
import { ChatApiResponse, UiChatMessage } from "@/types/chat";

const MAX_USER_MESSAGE_LENGTH = 700;
const QUICK_PROMPTS = STARTER_SUGGESTIONS.slice(0, 6);

type ThemeMode = "dark" | "light";

export interface SidebarPrompt {
  id: number;
  text: string;
}

interface SalesChatProps {
  queuedPrompt?: SidebarPrompt | null;
  resetSignal?: number;
  onPromptConsumed?: () => void;
  themeMode?: ThemeMode;
}

function createMessage(role: UiChatMessage["role"], content: string): UiChatMessage {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function SalesChat({
  queuedPrompt = null,
  resetSignal = 0,
  onPromptConsumed,
  themeMode = "dark",
}: SalesChatProps) {
  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [lead, setLead] = useState({ ...EMPTY_LEAD });
  const [summary, setSummary] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [serverReadyForWhatsapp, setServerReadyForWhatsapp] = useState(false);

  const isLightMode = themeMode === "light";

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const hasConversation = messages.length > 0;

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const hasWhatsappNumber = Boolean(sanitizeWhatsappNumber(whatsappNumber));

  const computedSummary = useMemo(() => summary || buildLeadSummary(lead), [lead, summary]);
  const whatsappLink = useMemo(
    () => buildWhatsappLink(lead, whatsappNumber, computedSummary),
    [computedSummary, lead, whatsappNumber],
  );

  const isWhatsappReady = serverReadyForWhatsapp && hasWhatsappNumber && Boolean(whatsappLink);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isLoading, messages]);

  const submitMessage = useCallback(async (rawText: string) => {
    const cleanedMessage = cleanText(rawText, MAX_USER_MESSAGE_LENGTH);
    if (!cleanedMessage || isLoading) {
      return;
    }

    setError("");
    setCopied(false);
    setServerReadyForWhatsapp(false);

    const userMessage = createMessage("user", cleanedMessage);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({ role: message.role, content: message.content })),
          lead,
        }),
      });

      const payload = (await response.json()) as ChatApiResponse;

      if (!response.ok) {
        throw new Error(payload.error || "Erreur de communication avec l'assistant.");
      }

      const mergedLead = mergeLeadData(lead, payload.leadUpdates, payload.detectedService);
      const mergedSummary = payload.summary || buildLeadSummary(mergedLead);

      setLead(mergedLead);
      setSummary(mergedSummary);
      setServerReadyForWhatsapp(payload.readyForWhatsapp === true);
      setMessages((previous) => [
        ...previous,
        createMessage("assistant", payload.reply || "Je suis prêt à continuer."),
      ]);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Une erreur est survenue. Merci de réessayer.";

      setError(message);
      setMessages((previous) => [
        ...previous,
        createMessage("assistant", "Petit souci technique. Réessaie dans quelques secondes."),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, lead, messages]);

  useEffect(() => {
    if (!queuedPrompt || isLoading) {
      return;
    }

    submitMessage(queuedPrompt.text);
    onPromptConsumed?.();
  }, [queuedPrompt, isLoading, submitMessage, onPromptConsumed]);

  useEffect(() => {
    if (resetSignal === 0) {
      return;
    }
    handleReset();
  }, [resetSignal]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage(input);
  }

  function handleReset() {
    setMessages([]);
    setLead({ ...EMPTY_LEAD });
    setSummary("");
    setServerReadyForWhatsapp(false);
    setError("");
    setInput("");
    setCopied(false);
  }

  async function handleCopySummary() {
    try {
      await navigator.clipboard.writeText(computedSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Impossible de copier pour le moment.");
    }
  }

  function renderComposer(isFloating: boolean) {
    return (
      <form
        onSubmit={handleSubmit}
        className={`rounded-[28px] border p-2 ${
          isLightMode
            ? "border-zinc-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.08)]"
            : "border-white/10 bg-[#2b2b2b] shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
        } ${isFloating ? "backdrop-blur" : ""}`}
      >
        <div className="flex items-center gap-2">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
            <Plus className="h-5 w-5" />
          </span>

          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={MAX_USER_MESSAGE_LENGTH}
            placeholder="Poser une question"
            className={`h-11 flex-1 border-none bg-transparent px-1 text-[16px] outline-none sm:text-sm ${
              isLightMode ? "text-zinc-900 placeholder:text-zinc-400" : "text-zinc-100 placeholder:text-zinc-500"
            }`}
            disabled={isLoading}
          />

          {hasConversation ? (
            <button
              type="button"
              onClick={handleReset}
              title="Nouveau chat"
              className={`grid h-9 w-9 place-items-center rounded-full transition ${
                isLightMode
                  ? "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <RefreshCw className="h-4.5 w-4.5" />
            </button>
          ) : null}

          {hasConversation ? (
            <button
              type="button"
              onClick={handleCopySummary}
              title={copied ? "Résumé copié" : "Copier le résumé"}
              className={`grid h-9 w-9 place-items-center rounded-full transition ${
                isLightMode
                  ? "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <ClipboardCopy className="h-4.5 w-4.5" />
            </button>
          ) : null}

          <button
            type="submit"
            disabled={isLoading || !cleanText(input, MAX_USER_MESSAGE_LENGTH)}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition disabled:cursor-not-allowed ${
              isLightMode
                ? "bg-zinc-900 text-white hover:bg-zinc-700 disabled:bg-zinc-400"
                : "bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-500"
            }`}
          >
            {isLoading ? <LoaderCircle className="h-4.5 w-4.5 animate-spin" /> : <SendHorizonal className="h-4.5 w-4.5" />}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      {hasConversation ? (
        <>
          <div className="touch-scroll mx-auto min-h-0 w-full max-w-4xl flex-1 overflow-y-auto px-4 pb-36 pt-6 sm:px-6">
            <div className="space-y-4 sm:space-y-5">
              {messages.map((message) => (
                <ChatBubble key={message.id} role={message.role} content={message.content} themeMode={themeMode} />
              ))}

              {isLoading ? (
                <div className="chat-bubble-enter flex justify-start">
                  <div
                    className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs ${
                      isLightMode ? "border-zinc-200 bg-white text-zinc-500" : "border-white/10 bg-[#2b2b2b] text-zinc-400"
                    }`}
                  >
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    En cours...
                  </div>
                </div>
              ) : null}
            </div>

            {error ? (
              <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                {error}
              </p>
            ) : null}

            <div ref={chatEndRef} />
          </div>

          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 border-t px-4 pb-5 pt-6 sm:px-6 ${
              isLightMode
                ? "border-zinc-200 bg-gradient-to-t from-[#eef2f8] via-[#eef2f8] to-transparent"
                : "border-white/10 bg-gradient-to-t from-[#1f1f1f] via-[#1f1f1f] to-transparent"
            }`}
          >
            <div className="pointer-events-auto mx-auto w-full max-w-4xl">
              {isWhatsappReady ? (
                <div className="mb-3 flex justify-start">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white transition hover:bg-emerald-600 sm:w-auto"
                  >
                    Soumettre votre demande
                  </a>
                </div>
              ) : null}
              {renderComposer(true)}
            </div>
          </div>
        </>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-start overflow-hidden px-4 pb-20 pt-16 sm:touch-scroll sm:justify-center sm:overflow-y-auto sm:px-6 sm:pt-0">
          <h1
            className={`text-center text-3xl font-semibold tracking-tight sm:text-5xl ${
              isLightMode ? "text-zinc-800" : "text-zinc-100"
            }`}
          >
            Que voulez-vous acheter ?
          </h1>

          <div className="mt-7 w-full max-w-3xl">{renderComposer(false)}</div>

          <div className="mt-4 flex w-full max-w-3xl flex-wrap justify-center gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => submitMessage(`Je suis intéressé par ${prompt}.`)}
                disabled={isLoading}
                className={`rounded-full border px-3 py-1.5 text-[13px] transition disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs ${
                  isLightMode
                    ? "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800"
                    : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
              {error}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
