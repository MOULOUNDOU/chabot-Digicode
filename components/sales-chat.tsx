"use client";

import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
const QUICK_PROMPTS = STARTER_SUGGESTIONS;
const TEXTAREA_MIN_HEIGHT = 44;
const TEXTAREA_MAX_HEIGHT = 112;

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
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const viewportSyncTimeoutRef = useRef<number | null>(null);
  const hasConversation = messages.length > 0;

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const hasWhatsappNumber = Boolean(sanitizeWhatsappNumber(whatsappNumber));

  const computedSummary = useMemo(() => summary || buildLeadSummary(lead), [lead, summary]);
  const whatsappLink = useMemo(
    () => buildWhatsappLink(lead, whatsappNumber, computedSummary),
    [computedSummary, lead, whatsappNumber],
  );

  const isWhatsappReady = serverReadyForWhatsapp && hasWhatsappNumber && Boolean(whatsappLink);

  const scrollToConversationEnd = useCallback((behavior: ScrollBehavior = "smooth") => {
    chatEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const resetTextareaHeight = useCallback(() => {
    const textarea = textAreaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = `${TEXTAREA_MIN_HEIGHT}px`;
  }, []);

  const autoResizeTextarea = useCallback(() => {
    const textarea = textAreaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = `${TEXTAREA_MIN_HEIGHT}px`;
    textarea.style.height = `${Math.min(textarea.scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
  }, []);

  useEffect(() => {
    resetTextareaHeight();
  }, [resetTextareaHeight]);

  useEffect(() => {
    scrollToConversationEnd("smooth");
  }, [isLoading, messages, scrollToConversationEnd]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const viewport = window.visualViewport;
    if (!viewport) {
      return;
    }

    let frameId = 0;

    const syncToVisibleViewport = () => {
      if (document.activeElement !== textAreaRef.current) {
        return;
      }

      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        scrollToConversationEnd("auto");
      });
    };

    viewport.addEventListener("resize", syncToVisibleViewport);
    viewport.addEventListener("scroll", syncToVisibleViewport);

    return () => {
      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
      }

      viewport.removeEventListener("resize", syncToVisibleViewport);
      viewport.removeEventListener("scroll", syncToVisibleViewport);
    };
  }, [scrollToConversationEnd]);

  useEffect(() => {
    return () => {
      if (viewportSyncTimeoutRef.current !== null) {
        window.clearTimeout(viewportSyncTimeoutRef.current);
      }
    };
  }, []);

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
    resetTextareaHeight();
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
  }, [isLoading, lead, messages, resetTextareaHeight]);

  useEffect(() => {
    if (!queuedPrompt || isLoading) {
      return;
    }

    submitMessage(queuedPrompt.text);
    onPromptConsumed?.();
  }, [queuedPrompt, isLoading, submitMessage, onPromptConsumed]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage(input);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage(input);
    }
  }

  const syncComposerWithViewport = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    scrollToConversationEnd("auto");

    if (viewportSyncTimeoutRef.current !== null) {
      window.clearTimeout(viewportSyncTimeoutRef.current);
    }

    viewportSyncTimeoutRef.current = window.setTimeout(() => {
      scrollToConversationEnd("smooth");
      viewportSyncTimeoutRef.current = null;
    }, 140);
  }, [scrollToConversationEnd]);

  const handleReset = useCallback(() => {
    setMessages([]);
    setLead({ ...EMPTY_LEAD });
    setSummary("");
    setServerReadyForWhatsapp(false);
    setError("");
    setInput("");
    setCopied(false);
    resetTextareaHeight();
  }, [resetTextareaHeight]);

  useEffect(() => {
    if (resetSignal === 0) {
      return;
    }
    handleReset();
  }, [handleReset, resetSignal]);

  async function handleCopySummary() {
    if (!computedSummary) {
      return;
    }

    try {
      await navigator.clipboard.writeText(computedSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Impossible de copier pour le moment.");
    }
  }

  function renderComposer() {
    return (
      <form
        onSubmit={handleSubmit}
        className={`rounded-[28px] border p-2 ${
          isLightMode
            ? "border-zinc-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.08)]"
            : "border-white/10 bg-[#2b2b2b] shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
        }`}
      >
        <div className="flex items-end gap-2">
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
              isLightMode ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            <Plus className="h-5 w-5" />
          </span>

          <div className="min-w-0 flex-1">
            <textarea
              ref={textAreaRef}
              value={input}
              rows={1}
              name="chat-message"
              onChange={(event) => {
                setInput(event.target.value);
                autoResizeTextarea();
              }}
              onFocus={syncComposerWithViewport}
              onKeyDown={handleInputKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              inputMode="text"
              enterKeyHint="send"
              maxLength={MAX_USER_MESSAGE_LENGTH}
              placeholder="Poser une question"
              className={`block h-11 min-h-[44px] max-h-28 w-full min-w-0 resize-none overflow-y-auto border-none bg-transparent px-1 py-2 text-[16px] leading-[1.35] outline-none ${
                isLightMode ? "text-zinc-900 placeholder:text-zinc-400" : "text-zinc-100 placeholder:text-zinc-500"
              }`}
              disabled={isLoading}
            />
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {hasConversation ? (
              <button
                type="button"
                onClick={handleReset}
                title="Nouveau chat"
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition ${
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
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition ${
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
        </div>
      </form>
    );
  }

  return (
    <div className="relative flex h-full min-w-0 min-h-0 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-hidden">
        {hasConversation ? (
          <div className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col">
            <div className="touch-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
              <div className="space-y-5">
                {messages.map((message) => (
                  <ChatBubble key={message.id} role={message.role} content={message.content} themeMode={themeMode} />
                ))}

                {isLoading ? (
                  <div className="chat-bubble-enter flex justify-start">
                    <div
                      className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs ${
                        isLightMode
                          ? "border-zinc-200 bg-white text-zinc-500"
                          : "border-white/10 bg-[#2b2b2b] text-zinc-400"
                      }`}
                    >
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                      En cours...
                    </div>
                  </div>
                ) : null}

                {error ? (
                  <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                    {error}
                  </p>
                ) : null}

                <div ref={chatEndRef} />
              </div>
            </div>
          </div>
        ) : (
          <div className="touch-scroll min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
              <div className="w-full max-w-3xl">
                <h1
                  className={`text-center text-3xl font-semibold tracking-tight sm:text-5xl ${
                    isLightMode ? "text-zinc-800" : "text-zinc-100"
                  }`}
                >
                  Que voulez-vous acheter ?
                </h1>

                <div className="mt-6">
                  {renderComposer()}
                </div>

                <div className="carousel-scroll mt-6 -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => submitMessage(`Je suis intéressé par ${prompt}.`)}
                      disabled={isLoading}
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] transition disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs ${
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
                  <p className="mt-4 w-full rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                    {error}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>

      {hasConversation ? (
        <div
          className={`shrink-0 border-t px-3 pb-[calc(0.75rem+var(--app-safe-bottom))] pt-3 sm:px-6 sm:pb-5 sm:pt-4 ${
            isLightMode
              ? "border-zinc-200 bg-gradient-to-t from-[#eef2f8] via-[#eef2f8] to-[#eef2f8]"
              : "border-white/10 bg-gradient-to-t from-[#1f1f1f] via-[#1f1f1f] to-[#1f1f1f]"
          }`}
        >
          <div className="mx-auto w-full max-w-4xl">
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
            {renderComposer()}
          </div>
        </div>
      ) : null}
    </div>
  );
}
