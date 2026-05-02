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

    // Add user message
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
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI response");
      }

      const reader = response.body!.getReader();
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
    <div className="flex flex-col gap-4 overflow-hidden rounded-2xl backdrop-blur-lg bg-white/10 dark:bg-[rgba(32,32,32,0.6)] border border-white/15 dark:border-white/8 h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && showChips ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
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
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-secondary font-medium"
                      : "backdrop-blur-lg bg-white/10 dark:bg-[rgba(32,32,32,0.6)] border border-white/15 dark:border-white/8 text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block ml-1 animate-pulse">▌</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            {isLoading &&
              messages[messages.length - 1]?.role === "assistant" && (
                <div className="flex justify-start">
                  <div className="backdrop-blur-lg bg-white/10 dark:bg-[rgba(32,32,32,0.6)] border border-white/15 dark:border-white/8 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/15 dark:border-white/8 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                e.preventDefault();
                handleSendMessage(input);
              }
            }}
            placeholder="Ask about your finances..."
            disabled={isLoading}
            className="flex-1 border-white/20 dark:border-white/10"
          />
          <Button
            onClick={() => handleSendMessage(input)}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
