import Image from "next/image";
import { ChatRole } from "@/types/chat";

interface ChatBubbleProps {
  role: ChatRole;
  content: string;
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isAssistant = role === "assistant";

  return (
    <div className={`chat-bubble-enter flex py-1.5 ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-relaxed sm:text-[15px] ${
          isAssistant
            ? "rounded-tl-md border border-white/10 bg-[#2b2b2b] text-zinc-100"
            : "rounded-tr-md border border-[#646d79]/50 bg-[#38414d] text-zinc-100"
        }`}
      >
        <p
          className={`mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] ${isAssistant ? "text-zinc-400" : "text-zinc-300"}`}
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
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-300/80" />
          )}
          {isAssistant ? "Digicode" : "Vous"}
        </p>
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
