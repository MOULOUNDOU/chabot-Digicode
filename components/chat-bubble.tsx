import Image from "next/image";
import { ChatRole } from "@/types/chat";

interface ChatBubbleProps {
  role: ChatRole;
  content: string;
  themeMode?: "dark" | "light";
}

export function ChatBubble({ role, content, themeMode = "dark" }: ChatBubbleProps) {
  const isAssistant = role === "assistant";
  const isLightMode = themeMode === "light";

  return (
    <div className={`chat-bubble-enter flex py-1.5 ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[88%] rounded-3xl px-4 py-3 text-[16px] leading-relaxed sm:text-[16px] ${
          isAssistant
            ? isLightMode
              ? "rounded-tl-md border border-zinc-200 bg-white text-zinc-800"
              : "rounded-tl-md border border-white/10 bg-[#2b2b2b] text-zinc-100"
            : isLightMode
              ? "rounded-tr-md border border-indigo-200 bg-indigo-50 text-zinc-900"
              : "rounded-tr-md border border-[#646d79]/50 bg-[#38414d] text-zinc-100"
        }`}
      >
        <p
          className={`mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] ${
            isAssistant
              ? isLightMode
                ? "text-zinc-500"
                : "text-zinc-400"
              : isLightMode
                ? "text-indigo-500"
                : "text-zinc-300"
          }`}
        >
          {isAssistant ? (
            <Image
              src="/logo-digicode.PNG"
              alt="Digicode"
              width={14}
              height={14}
              className="h-3.5 w-3.5 rounded-full object-cover"
            />
          ) : (
            <span className={`h-1.5 w-1.5 rounded-full ${isLightMode ? "bg-indigo-400" : "bg-zinc-300/80"}`} />
          )}
          {isAssistant ? "Digicode" : "Vous"}
        </p>
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
