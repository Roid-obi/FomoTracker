"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Brain, Clock, Send, Sparkles, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/utils/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface HistoryMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

interface FomoAiContext {
  session?: string;
  questionsCount?: number;
  history?: HistoryMessage[];
}

const suggestedPrompts = [
  {
    title: "Analisis Kecanduan",
    description: "Bagaimana pola penggunaan media sosial saya?",
    text: "Bagaimana pola penggunaan media sosial saya berdasarkan riwayat pelacakan terbaru? Apakah ada tanda-tanda kecanduan?",
    icon: Brain,
  },
  {
    title: "Kurangi Screen Time",
    description: "Beri tips kurangi waktu layar secara efektif",
    text: "Berikan beberapa tips praktis dan terbukti efektif untuk membantu saya mengurangi screen time harian.",
    icon: Clock,
  },
  {
    title: "Mengatasi FOMO",
    description: "Cara mengatasi cemas tertinggal info",
    text: "Saya sering merasa cemas tertinggal (FOMO) setelah melihat update orang lain. Bagaimana cara mengatasinya secara psikologis?",
    icon: Sparkles,
  },
  {
    title: "Rekomendasi Detoks",
    description: "Buat draf jadwal detoks digital harian",
    text: "Buatkan saya draf jadwal detoks digital harian yang ramah bagi pemula agar saya bisa lebih produktif.",
    icon: Bot,
  },
];

export default function FomoAIPage() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const maxQuestions = 20;

  // SWR context fetching using TanStack Query
  const { data: initialContext, isLoading: isQueryLoading } =
    useQuery<FomoAiContext>({
      queryKey: ["fomoAiContext"],
      queryFn: async () => {
        const res = await api.get<FomoAiContext>("/api/ai");
        return res.data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes stale time
    });

  const session = initialContext?.session;
  const questionsCount = initialContext?.questionsCount ?? 0;
  const rawHistory = initialContext?.history || [];

  // Compute messages with SWR history or fallback welcome message
  const messages: Message[] =
    rawHistory.length > 0
      ? rawHistory.map((msg, index) => ({
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

  const isChatEmpty = rawHistory.length === 0;

  // Auto-scroll to bottom of chat
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message or loading state update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending, isQueryLoading]);

  const handleSend = async (e?: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customInput || input).trim();
    if (!textToSend || isSending) return;

    if (questionsCount >= maxQuestions) {
      alert("Anda telah mencapai batas maksimal 20 pertanyaan untuk hari ini.");
      return;
    }

    const userMsgContent = textToSend;
    setInput("");
    setIsSending(true);

    const userMessage: HistoryMessage = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content: userMsgContent,
      createdAt: new Date().toISOString(),
    };

    // Snapshot previous context for rollback
    const previousContext = queryClient.getQueryData(["fomoAiContext"]);

    // Optimistically update query cache
    queryClient.setQueryData<FomoAiContext>(["fomoAiContext"], (old) => {
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
      const aiMessage: HistoryMessage = {
        id: data.message.id || Math.random().toString(36).substring(7),
        role: data.message.role,
        content: data.message.content,
        createdAt: data.message.createdAt || new Date().toISOString(),
      };

      // Update query cache with server confirmed messages
      queryClient.setQueryData<FomoAiContext>(["fomoAiContext"], (old) => {
        const oldHistory = old?.history || [];
        const historyWithoutOptimisticUserMsg = oldHistory.filter(
          (m) => m.id !== userMessage.id,
        );
        return {
          session: data.session,
          questionsCount: data.questionsCount ?? old?.questionsCount ?? 0,
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
      queryClient.setQueryData<FomoAiContext>(["fomoAiContext"], (old) => {
        const oldHistory = old?.history || [];
        return {
          ...old,
          history: [
            ...oldHistory,
            {
              id: Math.random().toString(36).substring(7),
              role: "assistant",
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
        queryClient.setQueryData<FomoAiContext>(["fomoAiContext"], {
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

  const handleSuggestionClick = (text: string) => {
    handleSend(undefined, text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-13.5rem-env(safe-area-inset-bottom))] md:h-[calc(100vh-8rem)] select-none">
      {/* Main Unified Chat Container */}
      <div className="flex-1 bg-card border border-border rounded-3xl flex flex-col overflow-hidden shadow-xs relative">
        {/* Integrated Header Info Panel */}
        <div className="border-b border-border bg-card/60 backdrop-blur-md px-4 py-3 md:px-6 md:py-4 flex items-center justify-between z-10 shrink-0 select-none">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="p-2 md:p-2.5 bg-primary/5 rounded-xl md:rounded-2xl border border-primary/10 shrink-0">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-secondary animate-pulse" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs md:text-base font-bold font-poppins text-primary leading-tight flex items-center gap-1.5 md:gap-2">
                Asisten FomoAI
                <span className="text-[9px] bg-accent text-secondary px-1.5 py-0.5 rounded-full border border-secondary/10 font-bold font-mono">
                  BETA UI
                </span>
              </h1>
              <p className="text-[10px] md:text-xs text-muted font-light font-poppins truncate mt-0.5">
                Analisis cerdas kecanduan & perilaku media sosial Anda secara
                real-time.
              </p>
            </div>
          </div>

          {/* Quota Badge & Reset Actions */}
          <div className="flex items-center gap-1.5 md:gap-3 shrink-0 ml-2">
            <div className="flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-xl bg-muted-light/60 border border-border text-[9px] md:text-xs font-semibold text-secondary font-poppins">
              <Clock className="w-3.5 h-3.5 text-secondary/70 shrink-0" />
              <span>
                {questionsCount}/{maxQuestions}
              </span>
            </div>

            <button
              type="button"
              onClick={handleReset}
              disabled={messages.length <= 1 || isSending || isQueryLoading}
              className="flex items-center gap-1 px-2 py-1 md:px-2.5 md:py-1.5 rounded-xl text-[9px] md:text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer font-poppins border border-transparent hover:border-red-100"
              title="Hapus riwayat chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Chat</span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin bg-card/30">
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
              {isChatEmpty ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center min-h-full py-4 md:py-8 text-center"
                >
                  {/* Glowing AI Icon */}
                  <div className="relative mb-3 md:mb-4">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150 animate-pulse" />
                    <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center border border-primary/20 shadow-md">
                      <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-accent animate-pulse" />
                    </div>
                  </div>

                  {/* Header Title */}
                  <h2 className="text-sm md:text-lg font-extrabold font-poppins text-primary mb-1.5 md:mb-2">
                    Mulai Diskusi dengan FomoAI
                  </h2>

                  {/* Welcome Message Bubble */}
                  <div className="max-w-md bg-muted-light/30 border border-border p-3.5 rounded-2xl text-[10px] md:text-xs font-poppins text-muted leading-relaxed mb-5 md:mb-6 shadow-xs mx-4 text-center">
                    {messages[0].content}
                  </div>

                  {/* Suggested Prompts Title */}
                  <div className="w-full max-w-2xl px-4 text-left">
                    <p className="text-[10px] font-bold font-poppins text-secondary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-secondary/80" />
                      Pertanyaan yang Disarankan:
                    </p>
                  </div>

                  {/* Suggested Prompts Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl w-full px-4">
                    {suggestedPrompts.map((prompt) => {
                      const Icon = prompt.icon;
                      return (
                        <button
                          key={prompt.title}
                          type="button"
                          onClick={() => handleSuggestionClick(prompt.text)}
                          className="flex items-start gap-2.5 p-3 rounded-2xl border border-border bg-card hover:bg-muted-light/60 hover:border-primary/20 transition-all text-left group cursor-pointer shadow-xs hover:shadow-sm"
                        >
                          <div className="p-2 rounded-xl bg-primary/5 group-hover:bg-primary/10 border border-primary/10 text-primary shrink-0 transition-colors">
                            <Icon className="w-3.5 h-3.5 text-secondary" />
                          </div>
                          <div>
                            <h4 className="text-[11px] md:text-xs font-bold font-poppins text-primary leading-snug group-hover:text-secondary transition-colors">
                              {prompt.title}
                            </h4>
                            <p className="text-[9px] md:text-[10px] text-muted font-light font-poppins mt-0.5 line-clamp-2 leading-normal">
                              {prompt.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2.5 max-w-[85%] ${
                      msg.role === "user"
                        ? "ml-auto flex-row-reverse"
                        : "mr-auto"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center border shrink-0 ${
                        msg.role === "user"
                          ? "bg-primary border-primary/20 text-white"
                          : "bg-muted-light border-border text-primary"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div>
                      <div
                        className={`p-3 rounded-2xl text-xs md:text-sm font-poppins leading-relaxed shadow-xs ${
                          msg.role === "user"
                            ? "bg-primary text-white rounded-tr-none"
                            : "bg-muted-light/40 text-primary border border-border rounded-tl-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-muted/60 font-light font-poppins mt-1 block px-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}

              {isSending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5 mr-auto items-center"
                >
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-muted-light border border-border text-primary flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                  <div className="bg-muted-light/40 border border-border rounded-2xl rounded-tl-none p-3 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => handleSend(e)}
          className="p-3 border-t border-border bg-card flex gap-2 items-center shrink-0"
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
            disabled={
              questionsCount >= maxQuestions || isSending || isQueryLoading
            }
            className="flex-1 bg-background text-foreground border border-border focus:border-secondary focus:ring-1 focus:ring-secondary rounded-2xl px-4 py-3 text-xs md:text-sm font-poppins outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <button
            type="submit"
            disabled={
              !input.trim() ||
              questionsCount >= maxQuestions ||
              isSending ||
              isQueryLoading
            }
            className="p-3 bg-primary text-white rounded-2xl hover:bg-secondary disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
