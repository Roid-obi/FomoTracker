"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, Clock, Send, Sparkles, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/utils/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function FomoAIPage() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const maxQuestions = 20;

  // SWR context fetching using TanStack Query
  const { data: initialContext, isLoading: isQueryLoading } = useQuery({
    queryKey: ["fomoAiContext"],
    queryFn: async () => {
      const res = await api.get("/api/ai");
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
  });

  const session = initialContext?.session;
  const questionsCount = initialContext?.questionsCount ?? 0;
  const rawHistory = initialContext?.history || [];

  // Compute messages with SWR history or fallback welcome message
  const messages: Message[] = rawHistory.length > 0
    ? rawHistory.map((msg: any, index: number) => ({
        id: msg.id || `msg-${index}`,
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
      }))
    : [
        {
          id: "welcome",
          role: "assistant",
          content:
            "Halo! Saya FomoAI, asisten pintar pemantau media sosial Anda. Di sini Anda bisa bertanya tentang data pemakaian aplikasi, pola kecanduan, hingga tips produktivitas dan pengurangan FOMO berdasarkan riwayat pribadi Anda. Ada yang ingin Anda diskusikan?",
          timestamp: new Date(),
        },
      ];

  // Auto-scroll to bottom of chat
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message or loading state update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending, isQueryLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    if (questionsCount >= maxQuestions) {
      alert("Anda telah mencapai batas maksimal 20 pertanyaan untuk hari ini.");
      return;
    }

    const userMsgContent = input;
    setInput("");
    setIsSending(true);

    const userMessage = {
      id: Math.random().toString(36).substring(7),
      role: "user" as const,
      content: userMsgContent,
      createdAt: new Date().toISOString(),
    };

    // Snapshot previous context for rollback
    const previousContext = queryClient.getQueryData(["fomoAiContext"]);

    // Optimistically update query cache
    queryClient.setQueryData(["fomoAiContext"], (old: any) => {
      const oldHistory = old?.history || [];
      return {
        ...old,
        questionsCount: (old?.questionsCount ?? 0) + 1,
        history: [...oldHistory, userMessage],
      };
    });

    try {
      const res = await api.post("/api/ai", {
        message: userMsgContent,
        session,
      });

      const data = res.data;
      const aiMessage = {
        id: data.message.id || Math.random().toString(36).substring(7),
        role: data.message.role,
        content: data.message.content,
        createdAt: data.message.createdAt || new Date().toISOString(),
      };

      // Update query cache with server confirmed messages
      queryClient.setQueryData(["fomoAiContext"], (old: any) => {
        const oldHistory = old?.history || [];
        const historyWithoutOptimisticUserMsg = oldHistory.filter(
          (m: any) => m.id !== userMessage.id,
        );
        return {
          session: data.session,
          questionsCount: data.questionsCount ?? (old?.questionsCount ?? 0),
          history: [...historyWithoutOptimisticUserMsg, userMessage, aiMessage],
        };
      });
    } catch (err) {
      console.error("Gagal mengirim pesan ke FomoAI:", err);
      // Rollback to previous context
      queryClient.setQueryData(["fomoAiContext"], previousContext);

      const errorMsg = (err as { response?: { data?: { error?: string } } })
        .response?.data?.error;
      const errorMessage =
        errorMsg || "Terjadi kesalahan pada sistem FomoAI. Silakan coba lagi.";

      // Append error message to history so it shows in chat
      queryClient.setQueryData(["fomoAiContext"], (old: any) => {
        const oldHistory = old?.history || [];
        return {
          ...old,
          history: [
            ...oldHistory,
            {
              id: Math.random().toString(36).substring(7),
              role: "assistant" as const,
              content: `Error: ${errorMessage}`,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus seluruh riwayat chat?")) {
      try {
        setIsSending(true);
        const res = await api.delete("/api/ai");
        const nextSession = res.data.session;
        
        // Update query cache to empty history
        queryClient.setQueryData(["fomoAiContext"], {
          session: nextSession,
          questionsCount: 0,
          history: [],
        });
      } catch (err) {
        console.error("Gagal melakukan reset sesi chat FomoAI:", err);
        alert("Gagal melakukan reset chat. Silakan coba lagi.");
      } finally {
        setIsSending(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] select-none">
      {/* Header Info Panel */}
      <div className="bg-card border border-border rounded-3xl p-5 mb-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10">
            <Sparkles className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h1 className="text-base font-bold font-poppins text-primary leading-tight flex items-center gap-2">
              Asisten FomoAI
              <span className="text-[10px] bg-accent text-secondary px-2 py-0.5 rounded-full border border-secondary/10 font-medium font-mono uppercase">
                BETA UI
              </span>
            </h1>
            <p className="text-xs text-muted font-light font-poppins mt-0.5">
              Analisis cerdas kecanduan & perilaku media sosial Anda secara
              real-time.
            </p>
          </div>
        </div>

        {/* Quota Badge & Reset Actions */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-muted-light/60 border border-border text-xs font-semibold text-secondary font-poppins">
            <Clock className="w-4 h-4 text-secondary/70" />
            <span>
              Batas Harian: {questionsCount}/{maxQuestions}
            </span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            disabled={messages.length <= 1 || isSending || isQueryLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer font-poppins"
            title="Hapus riwayat chat"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-card border border-border rounded-3xl flex flex-col overflow-hidden shadow-xs relative">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {isQueryLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="flex gap-3 max-w-[70%]">
                <div className="w-8 h-8 rounded-xl bg-muted-light border border-border shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted-light rounded-xl w-3/4" />
                  <div className="h-4 bg-muted-light rounded-xl w-1/2" />
                </div>
              </div>
              <div className="flex gap-3 max-w-[70%] ml-auto flex-row-reverse">
                <div className="w-8 h-8 rounded-xl bg-muted shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted-light rounded-xl w-2/3 ml-auto" />
                </div>
              </div>
              <div className="flex gap-3 max-w-[70%]">
                <div className="w-8 h-8 rounded-xl bg-muted-light border border-border shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted-light rounded-xl w-4/5" />
                  <div className="h-4 bg-muted-light rounded-xl w-2/3" />
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${
                      msg.role === "user"
                        ? "bg-primary border-primary/20 text-white"
                        : "bg-muted-light border-border text-primary"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div>
                    <div
                      className={`p-3.5 rounded-2xl text-sm font-poppins leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-white rounded-tr-none"
                          : "bg-muted-light/40 text-primary border border-border rounded-tl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted/60 font-light font-poppins mt-1 block px-1">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isSending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 mr-auto items-center"
                >
                  <div className="w-8 h-8 rounded-xl bg-muted-light border border-border text-primary flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-muted-light/40 border border-border rounded-2xl rounded-tl-none p-3.5 flex gap-1 items-center">
                    <span className="w-2.5 h-2.5 bg-muted rounded-full animate-bounce" />
                    <span className="w-2.5 h-2.5 bg-muted rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2.5 h-2.5 bg-muted rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-4 border-t border-border bg-card flex gap-3 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              questionsCount >= maxQuestions
                ? "Batas harian tercapai. Kembali besok!"
                : "Tanyakan pola kecanduan media sosial Anda..."
            }
            disabled={questionsCount >= maxQuestions || isSending || isQueryLoading}
            className="flex-1 bg-background text-foreground border border-border focus:border-secondary focus:ring-1 focus:ring-secondary rounded-2xl px-4 py-3.5 text-sm font-poppins outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <button
            type="submit"
            disabled={
              !input.trim() || questionsCount >= maxQuestions || isSending || isQueryLoading
            }
            className="p-3.5 bg-primary text-white rounded-2xl hover:bg-secondary disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
