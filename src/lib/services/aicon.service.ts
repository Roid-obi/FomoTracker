import { db } from "@/lib/databases";
import { table } from "@/lib/databases/schema";
import { createSupabaseServer } from "@/lib/databases/supabase";
import { AiconModel } from "@/lib/models/aicon.model";
import { generateChatResponseAI } from "@/lib/utils/ai";
import { and, asc, desc, eq, gte } from "drizzle-orm";
import { z } from "zod";

type ServiceResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: unknown };

async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function validationError(error: z.ZodError) {
  return z.treeifyError(error);
}

export async function getLatestSessionService(): Promise<
  ServiceResult<{ session: number }>
> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "User not authenticated" };

  const latest = await db.query.aiConversations.findFirst({
    where: eq(table.aiConversations.userId, userId),
    orderBy: [desc(table.aiConversations.session)],
  });

  return { success: true, data: { session: latest ? latest.session : 1 } };
}

export async function getHistoryService(
  session: number,
): Promise<ServiceResult<AiconModel.historySchema>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "User not authenticated" };

  const historyRows = await db.query.aiConversations.findMany({
    where: and(
      eq(table.aiConversations.userId, userId),
      eq(table.aiConversations.session, session),
    ),
    orderBy: [asc(table.aiConversations.createdAt)],
  });

  const parsed = AiconModel.historySchema.safeParse(
    historyRows.map((r) => ({
      role: r.role,
      content: r.content,
      createdAt: r.createdAt ?? undefined,
    })),
  );

  if (!parsed.success)
    return { success: false, error: validationError(parsed.error) };

  return { success: true, data: parsed.data };
}

export async function sendMessageService(
  body: unknown,
): Promise<ServiceResult<AiconModel.chatResponseSchema>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "User not authenticated" };

  const reqParsed = AiconModel.requestSchema.safeParse(body);
  if (!reqParsed.success)
    return { success: false, error: validationError(reqParsed.error) };

  const { message, session: reqSession } = reqParsed.data;

  // Cek batas harian (20 pertanyaan per hari)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayRows = await db.query.aiConversations.findMany({
    where: and(
      eq(table.aiConversations.userId, userId),
      eq(table.aiConversations.role, "user"),
      gte(table.aiConversations.createdAt, today),
    ),
    columns: { id: true },
  });

  if (todayRows.length >= 20) {
    return {
      success: false,
      error: "Batas maksimal 20 pertanyaan per hari telah tercapai.",
    };
  }

  // Tentukan session. Jika tidak dikirim, ambil session terbaru
  let currentSession = reqSession;
  if (!currentSession) {
    const latest = await db.query.aiConversations.findFirst({
      where: eq(table.aiConversations.userId, userId),
      orderBy: [desc(table.aiConversations.session)],
    });
    currentSession = latest ? latest.session : 1;
  }

  // 1. Simpan pesan user ke database
  await db.insert(table.aiConversations).values({
    userId,
    session: currentSession,
    role: "user",
    content: message,
  });

  // 2. Ambil seluruh history di sesi ini (termasuk pesan user yang baru di-insert)
  const historyRows = await db.query.aiConversations.findMany({
    where: and(
      eq(table.aiConversations.userId, userId),
      eq(table.aiConversations.session, currentSession),
    ),
    orderBy: [asc(table.aiConversations.createdAt)],
  });

  // 3. Siapkan konteks untuk API AI (@google/genai menggunakan "model" untuk balasan AI)
  const historyContent = historyRows.slice(0, -1).map((row) => ({
    role: row.role === "user" ? ("user" as const) : ("model" as const),
    content: row.content,
  }));

  // 4. Konfigurasi System Prompt
  const systemPrompt = `Kamu adalah FomoAI, asisten pintar pemantau media sosial dari platform FomoTracker.
Karakteristikmu: Empatik, suportif, informatif, dan tidak menghakimi.
Gaya bahasa: Santai namun profesional (menggunakan bahasa Indonesia).

Tugas utamamu:
Membantu pengguna memahami data pemakaian aplikasi mereka, mengenali pola kecanduan, serta memberikan tips produktivitas dan cara mengurangi FOMO (Fear of Missing Out) berdasarkan riwayat pribadi mereka.

Konteks Sistem FomoTracker (Acuan Analisismu):
1. Data Pemakaian (Daily Stats):
   - Total Duration: Total waktu layar (screen time) harian.
   - Open Frequency: Seberapa sering pengguna refleks membuka/menutup aplikasi (indikasi compulsive checking).
   - Peak Active Hour: Jam paling aktif dalam sehari.

2. Pola Kecanduan & Pengganggu (Behavioral Flags):
   - Midnight Usage: Aktivitas media sosial di jam tidur/begadang (mengganggu kualitas tidur).
   - Productive Hour Distraction: Bermain HP saat jam kerja atau jam belajar.
   - Continuous Usage: Sesi pemakaian nonstop tanpa jeda istirahat (mengurangi fokus).

3. Behavioral Score & Status:
   - Skor harian dari 0-100 (semakin rendah semakin baik).
   - Status kesejahteraan digital: Good (Sehat), Attention (Perlu Perhatian), Heavy (Kecanduan Berat).

Aturan Menjawab:
- Berikan analisis dari perspektif metrik di atas jika pengguna bertanya tentang data atau kecanduan mereka.
- Berikan tips produktivitas yang praktis, realistis, dan berpusat pada perbaikan metrik (misal: "Coba kurangi open frequency dengan menjauhkan HP").
- Jangan pernah memarahi pengguna, berikan motivasi.
- Jawablah secara ringkas, to the point, namun tetap bermanfaat.
- Jika ditanyakan data aktual pengguna namun tidak ada, jawab data belum tersedia, berikan respons yang jelas dan sederhana.`;

  // --- Ambil Konteks Data Pengguna Aktual ---
  const userRecord = await db
    .select({ name: table.users.name })
    .from(table.users)
    .where(eq(table.users.id, userId))
    .limit(1)
    .then((res) => res[0]);

  const todayDate = new Date();
  const sevenDaysAgo = new Date(todayDate);
  sevenDaysAgo.setDate(todayDate.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  const last7DaysScores = await db
    .select()
    .from(table.behavioralScores)
    .where(
      and(
        eq(table.behavioralScores.userId, userId),
        gte(table.behavioralScores.scoreDate, sevenDaysAgoStr)
      )
    )
    .orderBy(desc(table.behavioralScores.scoreDate))
    .limit(7);

  const last7DaysStats = await db
    .select({
      appName: table.apps.name,
      duration: table.dailyStats.totalDurationSeconds,
      opens: table.dailyStats.openFrequency,
      date: table.dailyStats.statDate,
    })
    .from(table.dailyStats)
    .innerJoin(table.apps, eq(table.dailyStats.appId, table.apps.id))
    .where(
      and(
        eq(table.dailyStats.userId, userId),
        gte(table.dailyStats.statDate, sevenDaysAgoStr)
      )
    )
    .orderBy(
      desc(table.dailyStats.statDate),
      desc(table.dailyStats.totalDurationSeconds),
    );

  const groupedStats: Record<string, typeof last7DaysStats> = {};
  for (const stat of last7DaysStats) {
    if (!groupedStats[stat.date]) {
      groupedStats[stat.date] = [];
    }
    if (groupedStats[stat.date].length < 3) {
      groupedStats[stat.date].push(stat);
    }
  }
  const topStatsPerDay = Object.values(groupedStats).flat();

  let userContextText = `\n\n--- DATA AKTUAL PENGGUNA SAAT INI ---`;
  if (userRecord) {
    userContextText += `\nNama Pengguna: ${userRecord.name}`;
  }

  if (last7DaysScores.length > 0) {
    userContextText += `\n\nData Skor Perilaku (Maks 7 Hari Terakhir):`;
    last7DaysScores.forEach((score) => {
      userContextText += `\nTanggal: ${score.scoreDate}
- Skor: ${score.totalScore}/100 (Kategori: ${score.dailyStatus})
- Kendala Utama: ${
        [
          score.flagExcessiveUsage ? "Pemakaian Berlebih" : "",
          score.flagCompulsiveChecking ? "Sering Cek HP" : "",
          score.flagMidnightUsage ? "Bermain HP saat jam tidur" : "",
          score.flagContinuousUsage ? "Sesi nonstop tanpa jeda" : "",
          score.flagProductiveHourDistraction ? "Distraksi jam produktif" : "",
        ]
          .filter(Boolean)
          .join(", ") || "Tidak ada"
      }`;
    });
  } else {
    userContextText += `\nData Skor Perilaku: Belum ada data dalam 7 hari terakhir.`;
  }

  if (topStatsPerDay.length > 0) {
    userContextText += `\n\nData Pemakaian Aplikasi (Maks 7 Hari Terakhir, Top 3 per hari):`;
    topStatsPerDay.forEach((stat) => {
      const minutes = Math.floor(stat.duration / 60);
      userContextText += `\n- ${stat.date} | ${stat.appName}: ${minutes} menit (${stat.opens}x dibuka)`;
    });
  } else {
    userContextText += `\nData Aplikasi: Belum ada data pemakaian aplikasi dalam 7 hari terakhir.`;
  }

  userContextText += `\n-------------------------------\nINSTRUKSI TAMBAHAN: Jadikan data aktual di atas sebagai dasar untuk memberikan jawaban spesifik, rekomendasi personal, dan sentuhan empati. Panggil pengguna dengan namanya jika sesuai.`;

  const finalSystemPrompt = systemPrompt + userContextText;

  try {
    // 5. Generate respons dari AI
    const aiResponseText = await generateChatResponseAI(
      finalSystemPrompt,
      historyContent,
      message,
    );

    // 6. Simpan balasan AI ke database
    const [savedAiMessage] = await db
      .insert(table.aiConversations)
      .values({
        userId,
        session: currentSession,
        role: "assistant",
        content: aiResponseText,
      })
      .returning();

    const responseParsed = AiconModel.chatResponseSchema.safeParse({
      session: currentSession,
      message: {
        role: savedAiMessage.role,
        content: savedAiMessage.content,
        createdAt: savedAiMessage.createdAt ?? undefined,
      },
    });

    if (!responseParsed.success) {
      return { success: false, error: validationError(responseParsed.error) };
    }

    return { success: true, data: responseParsed.data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
