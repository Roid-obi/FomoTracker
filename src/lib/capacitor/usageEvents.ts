import { registerPlugin } from "@capacitor/core";

export interface UsageEventData {
  packageName: string;
  eventType: number; // 1 for RESUMED, 2 for PAUSED
  timeStamp: number;
}

export interface UsageEventsPluginType {
  queryEvents(options: {
    startTime: number;
    endTime: number;
  }): Promise<{ events: UsageEventData[] }>;
}

const UsageEvents = registerPlugin<UsageEventsPluginType>("UsageEvents");

export async function fetchUsageEvents(
  startTime: number,
  endTime: number,
): Promise<UsageEventData[]> {
  try {
    const { events } = await UsageEvents.queryEvents({ startTime, endTime });
    return events;
  } catch (error) {
    console.error("Failed to query usage events:", error);
    return [];
  }
}

/**
 * Helper untuk parse HH:mm:ss menjadi detik sejak 00:00:00
 */
function parseTimeStrToSeconds(timeStr: string): number {
  const parts = timeStr.split(":");
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  const s = parseInt(parts[2], 10) || 0;
  return h * 3600 + m * 60 + s;
}

/**
 * Menghitung durasi overlap antara interval sesi [sessionStart, sessionEnd]
 * dengan interval jam dalam sehari [boundStart, boundEnd]
 * Semua input dalam detik sejak midnight hari itu.
 */
function calculateOverlap(
  sessionStart: number,
  sessionEnd: number,
  boundStart: number,
  boundEnd: number,
): number {
  const start = Math.max(sessionStart, boundStart);
  const end = Math.min(sessionEnd, boundEnd);
  return Math.max(0, end - start);
}

export function analyzeUsageEvents(
  events: UsageEventData[],
  midnightStartStr = "00:00:00",
  midnightEndStr = "05:00:00",
  productiveStartStr = "09:00:00",
  productiveEndStr = "17:00:00",
) {
  const midnightStart = parseTimeStrToSeconds(midnightStartStr);
  const midnightEnd = parseTimeStrToSeconds(midnightEndStr);
  const productiveStart = parseTimeStrToSeconds(productiveStartStr);
  const productiveEnd = parseTimeStrToSeconds(productiveEndStr);

  const appSessions: Record<
    string,
    {
      frequency: number;
      midnightDurationSeconds: number;
      productiveHourDurationSeconds: number;
      lastResumedTime: number | null;
    }
  > = {};

  for (const event of events) {
    if (!appSessions[event.packageName]) {
      appSessions[event.packageName] = {
        frequency: 0,
        midnightDurationSeconds: 0,
        productiveHourDurationSeconds: 0,
        lastResumedTime: null,
      };
    }

    const session = appSessions[event.packageName];

    if (event.eventType === 1) {
      session.frequency++;
      session.lastResumedTime = event.timeStamp;
    } else if (event.eventType === 2 && session.lastResumedTime !== null) {
      const resumedTime = session.lastResumedTime;
      const pausedTime = event.timeStamp;

      const resumedDate = new Date(resumedTime);
      const pausedDate = new Date(pausedTime);

      const resumedSecs =
        resumedDate.getHours() * 3600 +
        resumedDate.getMinutes() * 60 +
        resumedDate.getSeconds();
      const pausedSecs =
        pausedDate.getHours() * 3600 +
        pausedDate.getMinutes() * 60 +
        pausedDate.getSeconds();

      // Cek apakah melewati tengah malam (pausedSecs < resumedSecs)
      if (pausedSecs < resumedSecs) {
        // Jika menyeberang tengah malam, kita pisahkan jadi dua hari (atau anggap saja untuk hari start)
        // Untuk sederhananya, potong di 23:59:59 (86400 detik)
        session.midnightDurationSeconds += calculateOverlap(
          resumedSecs,
          86400,
          midnightStart,
          midnightEnd,
        );
        session.productiveHourDurationSeconds += calculateOverlap(
          resumedSecs,
          86400,
          productiveStart,
          productiveEnd,
        );

        session.midnightDurationSeconds += calculateOverlap(
          0,
          pausedSecs,
          midnightStart,
          midnightEnd,
        );
        session.productiveHourDurationSeconds += calculateOverlap(
          0,
          pausedSecs,
          productiveStart,
          productiveEnd,
        );
      } else {
        session.midnightDurationSeconds += calculateOverlap(
          resumedSecs,
          pausedSecs,
          midnightStart,
          midnightEnd,
        );
        session.productiveHourDurationSeconds += calculateOverlap(
          resumedSecs,
          pausedSecs,
          productiveStart,
          productiveEnd,
        );
      }

      session.lastResumedTime = null;
    }
  }

  return appSessions;
}
