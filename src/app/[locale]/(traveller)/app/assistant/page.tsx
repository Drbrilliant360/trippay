"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Bot, LifeBuoy, Send } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChatMessage {
  from: "user" | "assistant";
  text: string;
}

/**
 * Mock assistant: canned, non-account-specific answers only. It never invents
 * balances, payment results or rates, and always offers human escalation.
 */
export default function AssistantPage() {
  const t = useTranslations("assistant");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: "assistant", text: t("welcome") },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  function send() {
    const text = input.trim();
    if (!text) return;
    const reply = pickReply(text);
    setMessages((prev) => [
      ...prev,
      { from: "user", text },
      { from: "assistant", text: reply },
    ]);
    setInput("");
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    });
  }

  function pickReply(text: string): string {
    const q = text.toLowerCase();
    if (q.includes("pend")) return t("answers.pending");
    if (q.includes("fee") || q.includes("ada")) return t("answers.fees");
    if (q.includes("refund") || q.includes("rejesh")) return t("answers.refunds");
    if (q.includes("pin") || q.includes("otp")) return t("answers.pin");
    return t("answers.fallback");
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-14rem)] w-full max-w-2xl flex-col space-y-4">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto rounded-2xl border bg-card p-4"
        aria-live="polite"
      >
        {messages.map((message, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2",
              message.from === "user" ? "justify-end" : "justify-start",
            )}
          >
            {message.from === "assistant" && (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                <Bot className="size-4" aria-hidden="true" />
              </span>
            )}
            <p
              className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                message.from === "user"
                  ? "bg-brand text-white"
                  : "bg-muted text-foreground",
              )}
            >
              {message.text}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{t("boundaryNote")}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("inputPlaceholder")}
          aria-label={t("inputPlaceholder")}
        />
        <Button type="submit" size="icon" aria-label={t("send")}>
          <Send className="size-4" aria-hidden="true" />
        </Button>
      </form>

      <Button asChild variant="outline" className="w-full">
        <Link href="/app/support">
          <LifeBuoy data-icon="inline-start" aria-hidden="true" />
          {t("escalate")}
        </Link>
      </Button>
    </div>
  );
}
