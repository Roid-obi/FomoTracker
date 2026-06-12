"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, Clock, Send, Sparkles, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function FomoAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Halo! Saya FomoAI, asisten pintar pemantau media sosial Anda. Di sini Anda bisa bertanya tentang data pemakaian aplikasi, pola kecanduan, hingga tips produktivitas dan pengurangan FOMO berdasarkan riwayat pribadi Anda. Ada yang ingin Anda diskusikan?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionsCount, setQuestionsCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const maxQuestions = 20;

  // Auto-scroll to bottom of chat
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message or loading state update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (questionsCount >= maxQuestions) {
      alert("Anda telah mencapai batas maksimal 20 pertanyaan untuk hari ini.");
      return;
    }

    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setQuestionsCount((prev) => prev + 1);
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      let aiReply = "";
      const lowerInput = userMessage.content.toLowerCase();

      if (lowerInput.includes("instagram") || lowerInput.includes("ig")) {
        aiReply =
          "Berdasarkan data harian Anda, screen time Instagram Anda rata-rata mencapai 2 jam 45 menit. Puncak aktivitas terjadi di malam hari pukul 21:00-23:00. Ini berkontribusi tinggi terhadap gangguan tidur Anda. Saya sarankan batasi pemakaian maksimal 45 menit sehari.";
      } else if (
        lowerInput.includes("tidur") ||
        lowerInput.includes("malam") ||
        lowerInput.includes("begadang")
      ) {
        aiReply =
          "Analisis kami menunjukkan Anda sering membuka HP di atas pukul 22:00, dengan durasi rata-rata 35 menit per sesi. Cahaya biru dari layar dapat menekan produksi melatonin. Cobalah menyalakan fitur 'Mode Tidur' di HP Anda 1 jam sebelum tidur.";
      } else if (
        lowerInput.includes("produktif") ||
        lowerInput.includes("kerja") ||
        lowerInput.includes("belajar")
      ) {
        aiReply =
          "Selama jam produktif (08:00 - 17:00), kami mendeteksi Anda membuka aplikasi hiburan sebanyak 18 kali hari ini. Rata-rata jeda waktu fokus Anda terputus setiap 22 menit. Mengaktifkan mode Do Not Disturb dapat meningkatkan fokus Anda hingga 40%.";
      } else if (
        lowerInput.includes("fomo") ||
        lowerInput.includes("kecanduan") ||
        lowerInput.includes("kurangi")
      ) {
        aiReply =
          "Kecanduan FOMO biasanya dipicu oleh kebiasaan reflek membuka media sosial saat bosan. Cobalah teknik 'Jeda 10 Detik': ketika ingin membuka Instagram, tunggu 10 detik dan tanyakan 'apakah saya benar-benar butuh melihat ini sekarang?'. Ini membantu melatih kontrol diri.";
      } else if (
        lowerInput.includes("halo") ||
        lowerInput.includes("hi") ||
        lowerInput.includes("siapa")
      ) {
        aiReply =
          "Halo! Saya adalah FomoAI. Saya dapat memproyeksikan data screen time, frekuensi buka-tutup aplikasi, serta waktu aktif Anda ke dalam bentuk solusi yang disesuaikan secara personal. Silakan tanyakan hal-hal yang berkaitan dengan penggunaan perangkat Anda!";
      } else {
        aiReply =
          "Analisis riwayat mingguan menunjukkan screen time keseluruhan Anda menurun 12% dibandingkan minggu lalu. Ini pencapaian yang bagus! Namun, frekuensi buka-tutup aplikasi (open frequency) Anda masih di atas 65 kali sehari. Cobalah kurangi reflex mengecek HP secara berulang.";
      }

      const aiMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: aiReply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleReset = () => {
    if (confirm("Apakah Anda yakin ingin menghapus seluruh riwayat chat?")) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Halo! Saya FomoAI, asisten pintar pemantau media sosial Anda. Di sini Anda bisa bertanya tentang data pemakaian aplikasi, pola kecanduan, hingga tips produktivitas dan pengurangan FOMO berdasarkan riwayat pribadi Anda. Ada yang ingin Anda diskusikan?",
          timestamp: new Date(),
        },
      ]);
      setQuestionsCount(0);
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
            disabled={messages.length <= 1}
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

            {isLoading && (
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
            disabled={questionsCount >= maxQuestions || isLoading}
            className="flex-1 bg-background text-foreground border border-border focus:border-secondary focus:ring-1 focus:ring-secondary rounded-2xl px-4 py-3.5 text-sm font-poppins outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <button
            type="submit"
            disabled={
              !input.trim() || questionsCount >= maxQuestions || isLoading
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
