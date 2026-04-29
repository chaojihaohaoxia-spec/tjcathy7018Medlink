"use client";

import { useMemo, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

function buildResponse(message: string, t: (key: string) => string) {
  const lower = message.toLowerCase();

  if (lower.includes("authorization") || lower.includes("consent")) {
    return t("support_response_consent");
  }

  if (/\bai\b/i.test(message) || lower.includes("diagnosis")) {
    return t("support_response_ai");
  }

  if (lower.includes("blockchain")) {
    return t("support_response_blockchain");
  }

  if (lower.includes("hospital") || lower.includes("integration")) {
    return t("support_response_integration");
  }

  if (lower.includes("prescription") || lower.includes("routing")) {
    return t("support_response_prescription");
  }

  return t("support_response_default");
}

export default function SupportChat() {
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: t("support_greeting")
    }
  ]);

  const nextId = useMemo(() => messages.length + 1, [messages.length]);
  const quickQuestions =
    translations[language].quick_questions ?? translations.en.quick_questions;

  const submitMessage = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: Message = { id: nextId, role: "user", content: trimmed };
    const assistantMessage: Message = {
      id: nextId + 1,
      role: "assistant",
      content: buildResponse(trimmed, t)
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput("");
  };

  return (
    <>
      {open ? (
        <section className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{t("support_title")}</p>
                <p className="text-xs text-slate-500">{t("support_subtitle")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              aria-label={t("support.close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-xl px-3 py-2 text-sm leading-6 ${
                  message.role === "assistant"
                    ? "mr-6 border border-slate-200 bg-slate-100 text-slate-700"
                    : "ml-6 bg-sky-500 text-white"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>

          <div className="grid gap-2 border-t border-slate-200 px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => submitMessage(question)}
                  className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-sky-400 hover:text-slate-900"
                >
                  {question}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                submitMessage(input);
              }}
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400"
                  placeholder={t("support_placeholder")}
              />
              <button type="submit" className="primary-button h-10 w-10 p-0" aria-label={t("support.send")}>
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-2xl shadow-sky-500/20 transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
        aria-label={t("support.open")}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </>
  );
}
