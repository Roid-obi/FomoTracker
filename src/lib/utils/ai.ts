import { GoogleGenAI } from "@google/genai";
import { InsightModel } from "@/lib/models/insight.model";

export interface WeeklyAiInput {
  weekStart: string;
  weekEnd: string;
  weeklyStatus: "good" | "attention" | "heavy";
  avgBehavioralScore: number;
  totalScreenTimeSeconds: number;
  prevWeekScreenTimeSeconds: number | null;
  bestDay: string | null;
  worstDay: string | null;
  topAppName: string | null;
  dailyScores: Array<{
    scoreDate: string;
    dailyStatus: string;
    totalScore: number;
    usageDurationScore: number;
    openFrequencyScore: number;
    midnightUsageScore: number;
    continuousUsageScore: number;
    productiveHourScore: number;
    flagExcessiveUsage: boolean;
    flagCompulsiveChecking: boolean;
    flagMidnightUsage: boolean;
    flagContinuousUsage: boolean;
    flagProductiveHourDistraction: boolean;
  }>;
  dailyStats: Array<{
    statDate: string;
    totalDurationSeconds: number;
    openFrequency: number;
    midnightDurationSeconds: number;
    productiveHourDurationSeconds: number;
    maxContinuousSeconds: number;
  }>;
}

function buildPrompt(input: WeeklyAiInput): string {
  const fmt = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}j ${m}m`;
  };

  const statusLabel: Record<string, string> = {
    good: "Baik (0–39)",
    attention: "Perlu Perhatian (40–69)",
    heavy: "Berat (70–100)",
  };

  const prevChange =
    input.prevWeekScreenTimeSeconds != null
      ? `${input.totalScreenTimeSeconds > input.prevWeekScreenTimeSeconds ? "naik" : "turun"} dari ${fmt(input.prevWeekScreenTimeSeconds)} minggu lalu`
      : "tidak ada data minggu lalu";

  const dailyScoreRows = input.dailyScores
    .map((d) => {
      const flags = [
        d.flagExcessiveUsage && "excessive",
        d.flagCompulsiveChecking && "compulsive",
        d.flagMidnightUsage && "midnight",
        d.flagContinuousUsage && "continuous",
        d.flagProductiveHourDistraction && "productive-hour",
      ]
        .filter(Boolean)
        .join(", ");
      return `  - ${d.scoreDate}: skor=${d.totalScore.toFixed(1)} (${d.dailyStatus})${flags ? `, flag=[${flags}]` : ""}`;
    })
    .join("\n");

  const dailyStatRows = input.dailyStats
    .map(
      (d) =>
        `  - ${d.statDate}: ${fmt(d.totalDurationSeconds)} total, ${d.openFrequency}x buka, malam=${fmt(d.midnightDurationSeconds)}, produktif=${fmt(d.productiveHourDurationSeconds)}, maks-nonstop=${fmt(d.maxContinuousSeconds)}`,
    )
    .join("\n");

  return `Kamu adalah asisten digital wellbeing dari FomoTracker — platform behavioral analytics berbasis AI.
Tugasmu adalah menganalisis data penggunaan media sosial mingguan pengguna dan menghasilkan insight yang personal, empatik, dan membangun.

Tulis dalam Bahasa Indonesia yang santai namun profesional. Hindari bahasa teknis berlebihan.

=== DATA MINGGU ${input.weekStart} s/d ${input.weekEnd} ===

Status mingguan    : ${statusLabel[input.weeklyStatus] ?? input.weeklyStatus}
Skor rata-rata     : ${input.avgBehavioralScore.toFixed(1)} / 100 (semakin rendah semakin baik)
Total screen time  : ${fmt(input.totalScreenTimeSeconds)} (${prevChange})
Hari terbaik       : ${input.bestDay ?? "tidak ada data"}
Hari terberat      : ${input.worstDay ?? "tidak ada data"}
Aplikasi teratas   : ${input.topAppName ?? "tidak ada data"}

--- Skor Harian (behavioral_scores) ---
${dailyScoreRows || "  (tidak ada data)"}

--- Statistik Harian (daily_stats, semua app digabung) ---
${dailyStatRows || "  (tidak ada data)"}

=== INSTRUKSI OUTPUT ===

Balas HANYA dengan JSON valid berikut (tanpa markdown, tanpa penjelasan di luar JSON):
{
  "weeklyStatusLabel": "<judul singkat minggu ini, contoh: 'Minggu yang Berat 😓' atau 'Minggu yang Produktif! 🌟'>",
  "positiveNotes": "<1-2 kalimat hal positif dari data minggu ini>",
  "concernNotes": "<1-2 kalimat hal yang perlu diperhatikan berdasarkan flag atau tren buruk>",
  "analysis": "<2-4 kalimat analisis mendalam pola digital minggu ini>",
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}

Catatan:
- weeklyStatusLabel: maks 60 karakter, boleh pakai 1 emoji
- positiveNotes: temukan hal baik meski data buruk, jika tidak ada puji konsistensinya
- concernNotes: jika status good, berikan saran preventif ringan
- analysis: hubungkan tren antar hari, jangan ulangi angka mentah
- tips: 3 tips praktis yang spesifik dan actionable, bukan generik
`;
}

export async function generateWeeklyInsightAI(
  input: WeeklyAiInput,
): Promise<InsightModel.aiOutputSchema> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY tidak tersedia di environment");
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildPrompt(input);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  const rawText = response.text ?? "";

  // Ambil JSON dari respons (toleran terhadap markdown code block)
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(
      `AI tidak mengembalikan JSON valid. Raw response: ${rawText.slice(0, 300)}`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error(`Gagal parse JSON dari AI: ${jsonMatch[0].slice(0, 300)}`);
  }

  // Validasi dengan Zod schema
  const validated = InsightModel.aiOutputSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(
      `Output AI tidak sesuai schema: ${JSON.stringify(validated.error.flatten())}`,
    );
  }

  return validated.data;
}
