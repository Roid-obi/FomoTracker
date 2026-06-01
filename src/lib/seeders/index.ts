import { reset, seed } from "drizzle-seed";
import { db } from "../databases";
import { table } from "../databases/schema";

const RISK_LEVELS = ["low", "moderate", "high", "critical"];
const RISK_TRENDS = ["improving", "stable", "worsening"];
const INSIGHT_TYPES = ["warning", "tip", "summary", "alert"];
const APP_CATEGORIES = [
  "social_media",
  "productivity",
  "entertainment",
  "games",
  "news",
  "finance",
];
const PLATFORMS = ["android", "ios", "web"];

async function main() {
  const mode = getMode();

  if (mode === "fresh") {
    await reset(db, table);
  } else if (mode === "reset") {
    await reset(db, table);
    console.log("Reset complete!");
    process.exit(0);
  }

  await seed(db, { ...table }).refine((f) => ({
    // ─────────────────────────────────────────────
    // Users
    // ─────────────────────────────────────────────
    users: {
      count: 20,
      columns: {
        username: f.firstName(),
        email: f.email(),
        createdAt: f.date({ minDate: "2024-01-01", maxDate: "2024-12-31" }),
        updatedAt: f.date({ minDate: "2025-01-01", maxDate: "2025-06-01" }),
      },
    },

    // ─────────────────────────────────────────────
    // Sessions
    // ─────────────────────────────────────────────
    sessions: {
      count: 20,
      columns: {
        expiredAt: f.date({ minDate: "2025-06-01", maxDate: "2025-12-31" }),
        createdAt: f.date({ minDate: "2025-01-01", maxDate: "2025-06-01" }),
      },
    },

    // ─────────────────────────────────────────────
    // Profiles
    // ─────────────────────────────────────────────
    profiles: {
      count: 20,
      columns: {
        url: f.default({ defaultValue: "https://placehold.net/avatar.svg" }),
        createdAt: f.date({ minDate: "2024-01-01", maxDate: "2024-12-31" }),
        updatedAt: f.date({ minDate: "2025-01-01", maxDate: "2025-06-01" }),
      },
    },

    // ─────────────────────────────────────────────
    // Notifications
    // ─────────────────────────────────────────────
    notifications: {
      count: 80,
      columns: {
        message: f.loremIpsum({ sentencesCount: 1 }),
        isRead: f.boolean(),
        createdAt: f.date({ minDate: "2025-01-01", maxDate: "2025-06-01" }),
      },
    },

    // ─────────────────────────────────────────────
    // Behaviour Scores
    // ─────────────────────────────────────────────
    behaviourScores: {
      count: 100,
      columns: {
        scoreDate: f.date({ minDate: "2025-01-01", maxDate: "2025-06-01" }),
        usageDurationScore: f.number({
          minValue: 0,
          maxValue: 100,
          precision: 2,
        }),
        openFrequencyScore: f.number({
          minValue: 0,
          maxValue: 100,
          precision: 2,
        }),
        midnightUsageScore: f.number({
          minValue: 0,
          maxValue: 100,
          precision: 2,
        }),
        continuousUsageScore: f.number({
          minValue: 0,
          maxValue: 100,
          precision: 2,
        }),
        productivityHourScore: f.number({
          minValue: 0,
          maxValue: 100,
          precision: 2,
        }),
        totalScore: f.number({ minValue: 0, maxValue: 100, precision: 2 }),
        riskLevel: f.valuesFromArray({ values: RISK_LEVELS }),
        excessiveUsageFlag: f.boolean(),
        compulsiveCheckingFlag: f.boolean(),
        midnightTendencyFlag: f.boolean(),
        continuousUsageFlag: f.boolean(),
        distractionTendencyFlag: f.boolean(),
        createdAt: f.date({ minDate: "2025-01-01", maxDate: "2025-06-01" }),
        updatedAt: f.date({ minDate: "2025-01-01", maxDate: "2025-06-01" }),
      },
    },

    // ─────────────────────────────────────────────
    // Weekly Reports
    // ─────────────────────────────────────────────
    weeklyReports: {
      count: 50,
      columns: {
        weekStart: f.date({ minDate: "2025-01-01", maxDate: "2025-05-01" }),
        weekEnd: f.date({ minDate: "2025-01-07", maxDate: "2025-05-31" }),
        totalScreenTimeSeconds: f.int({ minValue: 3600, maxValue: 302400 }), // 1h – 84h/week
        avgBehavioralScore: f.number({
          minValue: 0,
          maxValue: 100,
          precision: 2,
        }),
        avgRiskLevel: f.valuesFromArray({ values: RISK_LEVELS }),
        prevWeekScreenTimeSec: f.int({ minValue: 3600, maxValue: 302400 }),
        screenTimeChangePct: f.number({
          minValue: -50,
          maxValue: 100,
          precision: 2,
        }),
        riskTrend: f.valuesFromArray({ values: RISK_TRENDS }),
        usageSummary: f.default({
          defaultValue: {
            topApps: ["Instagram", "YouTube", "WhatsApp"],
            peakDay: "Saturday",
            avgDailySeconds: 14400,
          },
        }),
        aiReflection: f.loremIpsum({ sentencesCount: 3 }),
        createdAt: f.date({ minDate: "2025-01-01", maxDate: "2025-06-01" }),
        updatedAt: f.date({ minDate: "2025-01-01", maxDate: "2025-06-01" }),
      },
    },

    // ─────────────────────────────────────────────
    // AI Insights
    // ─────────────────────────────────────────────
    aiInsights: {
      count: 80,
      columns: {
        insightType: f.valuesFromArray({ values: INSIGHT_TYPES }),
        content: f.loremIpsum({ sentencesCount: 2 }),
        recommendation: f.loremIpsum({ sentencesCount: 2 }),
        createdAt: f.date({ minDate: "2025-01-01", maxDate: "2025-06-01" }),
      },
    },

    // ─────────────────────────────────────────────
    // Apps
    // ─────────────────────────────────────────────
    apps: {
      count: 30,
      columns: {
        packageName: f.string({ isUnique: true }),
        appName: f.companyName(),
        category: f.valuesFromArray({ values: APP_CATEGORIES }),
        platform: f.valuesFromArray({ values: PLATFORMS }),
        isActive: f.boolean(),
        createdAt: f.date({ minDate: "2023-01-01", maxDate: "2024-12-31" }),
      },
    },

    // ─────────────────────────────────────────────
    // Daily Stats
    // ─────────────────────────────────────────────
    dailyStats: {
      count: 200,
      columns: {
        statDate: f.date({ minDate: "2025-01-01", maxDate: "2025-06-01" }),
        totalDurationSeconds: f.int({ minValue: 60, maxValue: 43200 }), // 1m – 12h
        openFrequency: f.int({ minValue: 1, maxValue: 120 }),
        midnightDurationSeconds: f.int({ minValue: 0, maxValue: 7200 }), // 0 – 2h
        productiveHourDurationSeconds: f.int({ minValue: 0, maxValue: 14400 }), // 0 – 4h
        maxContinuousSeconds: f.int({ minValue: 60, maxValue: 10800 }), // 1m – 3h
        peakActiveHour: f.int({ minValue: 0, maxValue: 23 }),
      },
    },

    // ─────────────────────────────────────────────
    // Activity Log
    // ─────────────────────────────────────────────
    activityLog: {
      count: 500,
      columns: {
        startedAt: f.date({ minDate: "2025-01-01", maxDate: "2025-06-01" }),
        endedAt: f.date({ minDate: "2025-01-01", maxDate: "2025-06-01" }),
        durationSeconds: f.int({ minValue: 60, maxValue: 43200 }),
        isMidnight: f.boolean(),
        isProductiveHour: f.boolean(),
        isContinuous: f.boolean(),
        createdAt: f.date({ minDate: "2025-01-01", maxDate: "2025-06-01" }),
      },
    },

    // ─────────────────────────────────────────────
    // User Settings
    // ─────────────────────────────────────────────
    userSettings: {
      count: 20,
      columns: {
        productivityStart: f.default({ defaultValue: "09:00:00" }),
        productivityEnd: f.default({ defaultValue: "17:00:00" }),
        midnightStart: f.default({ defaultValue: "22:00:00" }),
        midnightEnd: f.default({ defaultValue: "05:00:00" }),
        screenTimeThresholdSec: f.int({ minValue: 3600, maxValue: 28800 }), // 1h – 8h
        continuousThresholdSec: f.int({ minValue: 1800, maxValue: 7200 }), // 30m – 2h
        notificationEnabled: f.boolean(),
        updatedAt: f.date({ minDate: "2025-01-01", maxDate: "2025-06-01" }),
      },
    },
  }));
  console.log("Seeding complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

type Mode = "fresh" | "reset" | null;

function getMode(): Mode {
  const args = process.argv.slice(2);

  const fresh = args.includes("--fresh");
  const reset = args.includes("--reset");

  if (fresh && reset) {
    console.error("Error: gunakan salah satu saja (--fresh atau --reset)");

    process.exit(1);
  }

  if (fresh) return "fresh";
  if (reset) return "reset";

  return null;
}
