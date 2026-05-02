"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PromptChips } from "./prompt-chips";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function InsightsChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showChips, setShowChips] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSendMessage(messageText: string) {
    if (!messageText.trim()) return;

    // Snapshot history (excluding any still-streaming placeholder) before
    // adding the new user message, then include the new message in the payload.
    const historySnapshot = messages
      .filter((m) => !m.isStreaming)
      .map((m) => ({ role: m.role, content: m.content }));

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setShowChips(false);
    setIsLoading(true);

    // Add streaming AI message placeholder
    const aiMessageId = `ai-${Date.now()}`;
    const aiMessage: Message = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };
    setMessages((prev) => [...prev, aiMessage]);

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          history: historySnapshot,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI response");
      }

      if (!response.body) throw new Error("Empty response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMessageId ? { ...m, isStreaming: false } : m,
              ),
            );
            return;
          }

          try {
            const chunk = JSON.parse(payload);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMessageId ? { ...m, content: m.content + chunk } : m,
              ),
            );
          } catch (e) {
            console.error("Failed to parse chunk:", e);
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId ? { ...m, isStreaming: false } : m,
        ),
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to get AI response. Please try again.");

      // Remove the failed AI message
      setMessages((prev) => prev.filter((m) => m.id !== aiMessageId));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="glass flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3 sm:space-y-4 sm:p-5">
        {messages.length === 0 && showChips ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-4">
            <PromptChips onChipClick={handleSendMessage} />
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2.5 sm:max-w-[70%] sm:px-4 sm:py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground font-medium"
                      : "glass text-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                    {message.isStreaming && (
                      <span className="ml-1 inline-block animate-pulse">▌</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            {isLoading &&
              messages[messages.length - 1]?.role === "assistant" && (
                <div className="flex justify-start">
                  <div className="glass px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-primary"
                        style={{ animationDelay: "0.15s" }}
                      />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-primary"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-border/50 p-3 sm:p-4">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                e.preventDefault();
                handleSendMessage(input);
              }
            }}
            placeholder="Ask about your finances…"
            disabled={isLoading}
            className="flex-1 text-base"
            autoComplete="off"
            inputMode="text"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className="h-10 w-10 shrink-0 cursor-pointer"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
