"use client";

import {
  Activity,
  ArrowLeft,
  Briefcase,
  Clock,
  Moon,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  Legend,
  Rectangle,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Mock data matches statistik page totals
const dataMingguIni = {
  dailyData: [
    { hari: "Sen", Instagram: 130, TikTok: 180, YouTube: 45, WhatsApp: 60 },
    { hari: "Sel", Instagram: 90, TikTok: 210, YouTube: 60, WhatsApp: 80 },
    { hari: "Rab", Instagram: 65, TikTok: 82, YouTube: 30, WhatsApp: 50 },
    { hari: "Kam", Instagram: 0, TikTok: 0, YouTube: 0, WhatsApp: 0 },
    { hari: "Jum", Instagram: 0, TikTok: 0, YouTube: 0, WhatsApp: 0 },
    { hari: "Sab", Instagram: 0, TikTok: 0, YouTube: 0, WhatsApp: 0 },
    { hari: "Min", Instagram: 0, TikTok: 0, YouTube: 0, WhatsApp: 0 },
  ],
  topApps: [
    { name: "TikTok", sec: 28320 },
    { name: "Instagram", sec: 17100 },
    { name: "WhatsApp", sec: 11400 },
    { name: "YouTube", sec: 8100 },
    { name: "X (Twitter)", sec: 3600 },
  ],
};

const dataMingguLaju = {
  dailyData: [
    { hari: "Sen", Instagram: 120, TikTok: 150, YouTube: 60, WhatsApp: 45 },
    { hari: "Sel", Instagram: 110, TikTok: 180, YouTube: 40, WhatsApp: 50 },
    { hari: "Rab", Instagram: 130, TikTok: 190, YouTube: 55, WhatsApp: 55 },
    { hari: "Kam", Instagram: 140, TikTok: 220, YouTube: 80, WhatsApp: 60 },
    { hari: "Jum", Instagram: 150, TikTok: 210, YouTube: 70, WhatsApp: 70 },
    { hari: "Sab", Instagram: 180, TikTok: 240, YouTube: 90, WhatsApp: 80 },
    { hari: "Min", Instagram: 210, TikTok: 280, YouTube: 100, WhatsApp: 95 },
  ],
  topApps: [
    { name: "TikTok", sec: 89400 },
    { name: "Instagram", sec: 62400 },
    { name: "YouTube", sec: 29700 },
    { name: "WhatsApp", sec: 25200 },
    { name: "X (Twitter)", sec: 14400 },
  ],
};

const rankColors = ["#334155", "#475569", "#64748B", "#94A3B8", "#E2E8F0"];

// Custom shape for dynamic topmost rounded corner
// biome-ignore lint/suspicious/noExplicitAny: Recharts custom shape props are dynamic
const CustomBar = (props: any) => {
  const { height, payload, dataKey, rankedApps } = props;
  if (!payload || !dataKey || !height || height <= 0) return null;

  const appsOrder = rankedApps || [
    "Instagram",
    "TikTok",
    "YouTube",
    "WhatsApp",
  ];
  const activeApps = appsOrder.filter((app: string) => (payload[app] || 0) > 0);
  const isTop = activeApps[activeApps.length - 1] === dataKey;

  const radius = isTop ? [4, 4, 0, 0] : [0, 0, 0, 0];

  return <Rectangle {...props} radius={radius} />;
};

const getDailyDataForDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const dayName = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][
    date.getDay()
  ];

  const time = date.getTime();
  const weekStartIni = new Date(2026, 5, 1).getTime();
  const weekStartLalu = new Date(2026, 4, 25).getTime();

  let dataset = dataMingguIni.dailyData;
  let topApps = dataMingguIni.topApps;
  let isCurrent = true;

  if (time >= weekStartLalu && time < weekStartIni) {
    dataset = dataMingguLaju.dailyData;
    topApps = dataMingguLaju.topApps;
    isCurrent = false;
  }

  const dayData = dataset.find((d) => d.hari === dayName) || {
    Instagram: 0,
    TikTok: 0,
    YouTube: 0,
    WhatsApp: 0,
  };

  return { dayData, topApps, isCurrent };
};

const generateHourlyDataForDate = (dateStr: string) => {
  const { dayData } = getDailyDataForDate(dateStr);
  const apps = ["Instagram", "TikTok", "YouTube", "WhatsApp"];

  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hourLabel = `${String(i).padStart(2, "0")}.00`;
    const row: Record<string, string | number> = { jam: hourLabel };
    for (const app of apps) {
      row[app] = 0;
    }
    return row;
  });

  const distribution: Record<number, number> = {
    8: 0.15,
    10: 0.1,
    12: 0.2,
    14: 0.15,
    16: 0.1,
    20: 0.2,
    22: 0.1,
  };

  for (const app of apps) {
    const totalMinutes = (dayData as Record<string, number>)[app] || 0;
    if (totalMinutes > 0) {
      let remaining = totalMinutes;
      const hours = Object.keys(distribution).map(Number);
      for (let idx = 0; idx < hours.length; idx++) {
        const hr = hours[idx];
        const share = distribution[hr];
        const amount =
          idx === hours.length - 1
            ? remaining
            : Math.round(totalMinutes * share);
        hourlyData[hr][app] = amount;
        remaining -= amount;
      }
    }
  }

  return hourlyData;
};

const formatMinutesToHoursMins = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}j ${m}m`;
};

// Calculate behaviour_scores data dynamically for the given date
const getBehaviourScoresForDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const dayName = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][
    date.getDay()
  ];
  const time = date.getTime();
  const weekStartIni = new Date(2026, 5, 1).getTime();

  // Default Rabu/Wednesday (54 score breakdown)
  const scores = {
    totalScore: 54,
    statusEmoji: "😐",
    statusTitle: "Perlu Diperhatikan",
    statusDesc: "Ada beberapa kebiasaan yang terdeteksi hari ini.",
    statusCardBg: "bg-amber-50 border-amber-200 text-amber-800",

    durasiNilai: 20,
    durasiMax: 30,
    frekuensiNilai: 12,
    frekuensiMax: 20,
    tidurNilai: 14,
    tidurMax: 20,
    nonstopNilai: 0,
    nonstopMax: 15,
    distraksiNilai: 8,
    distraksiMax: 15,

    flagExcessive: false,
    flagCompulsive: true,
    flagMidnight: true,
    flagNonstop: false,
    flagDistraction: true,
  };

  if (time < weekStartIni) {
    // Previous week
    const dayIdx = date.getDay();
    const total = 35 + ((dayIdx * 7) % 45); // ranges 35 to 80

    scores.totalScore = total;
    if (total <= 39) {
      scores.statusEmoji = "😊";
      scores.statusTitle = "Hari yang Baik";
      scores.statusDesc = "Penggunaan HP-mu hari ini terkontrol.";
      scores.statusCardBg = "bg-emerald-50 border-emerald-200 text-emerald-800";
    } else if (total <= 69) {
      scores.statusEmoji = "😐";
      scores.statusTitle = "Perlu Diperhatikan";
      scores.statusDesc = "Ada beberapa kebiasaan yang terdeteksi hari ini.";
      scores.statusCardBg = "bg-amber-50 border-amber-200 text-amber-800";
    } else {
      scores.statusEmoji = "😟";
      scores.statusTitle = "Hari yang Berat";
      scores.statusDesc = "Banyak kebiasaan bermasalah terdeteksi hari ini.";
      scores.statusCardBg = "bg-red-50 border border-red-200 text-red-800";
    }

    scores.durasiNilai = Math.round(total * 0.3);
    scores.frekuensiNilai = Math.round(total * 0.2);
    scores.tidurNilai = Math.round(total * 0.2);
    scores.nonstopNilai = Math.round(total * 0.15);
    scores.distraksiNilai =
      total -
      (scores.durasiNilai +
        scores.frekuensiNilai +
        scores.tidurNilai +
        scores.nonstopNilai);

    scores.flagExcessive = scores.durasiNilai > 15;
    scores.flagCompulsive = scores.frekuensiNilai > 10;
    scores.flagMidnight = scores.tidurNilai > 10;
    scores.flagNonstop = scores.nonstopNilai > 7;
    scores.flagDistraction = scores.distraksiNilai > 7;
  } else {
    // Current week
    if (dayName === "Sen") {
      scores.totalScore = 76;
      scores.statusEmoji = "😟";
      scores.statusTitle = "Hari yang Berat";
      scores.statusDesc = "Banyak kebiasaan bermasalah terdeteksi hari ini.";
      scores.statusCardBg = "bg-red-50 border border-red-200 text-red-800";

      scores.durasiNilai = 28;
      scores.frekuensiNilai = 14;
      scores.tidurNilai = 10;
      scores.nonstopNilai = 12;
      scores.distraksiNilai = 12;

      scores.flagExcessive = true;
      scores.flagCompulsive = true;
      scores.flagMidnight = true;
      scores.flagNonstop = true;
      scores.flagDistraction = true;
    } else if (dayName === "Sel") {
      scores.totalScore = 78;
      scores.statusEmoji = "😟";
      scores.statusTitle = "Hari yang Berat";
      scores.statusDesc = "Banyak kebiasaan bermasalah terdeteksi hari ini.";
      scores.statusCardBg = "bg-red-50 border border-red-200 text-red-800";

      scores.durasiNilai = 30;
      scores.frekuensiNilai = 16;
      scores.tidurNilai = 8;
      scores.nonstopNilai = 10;
      scores.distraksiNilai = 14;

      scores.flagExcessive = true;
      scores.flagCompulsive = true;
      scores.flagMidnight = false;
      scores.flagNonstop = true;
      scores.flagDistraction = true;
    } else if (dayName === "Rab") {
      // Wed is 54
      scores.totalScore = 54;
      scores.statusEmoji = "😐";
      scores.statusTitle = "Perlu Diperhatikan";
      scores.statusDesc = "Ada beberapa kebiasaan yang terdeteksi hari ini.";
      scores.statusCardBg = "bg-amber-50 border-amber-200 text-amber-800";

      scores.durasiNilai = 20;
      scores.frekuensiNilai = 12;
      scores.tidurNilai = 14;
      scores.nonstopNilai = 0;
      scores.distraksiNilai = 8;

      scores.flagExcessive = false;
      scores.flagCompulsive = true;
      scores.flagMidnight = true;
      scores.flagNonstop = false;
      scores.flagDistraction = true;
    } else {
      // Future days (no data)
      scores.totalScore = 0;
      scores.statusEmoji = "😊";
      scores.statusTitle = "Hari yang Sempurna";
      scores.statusDesc = "Belum ada penggunaan gawai terdeteksi.";
      scores.statusCardBg = "bg-emerald-50 border-emerald-200 text-emerald-800";

      scores.durasiNilai = 0;
      scores.frekuensiNilai = 0;
      scores.tidurNilai = 0;
      scores.nonstopNilai = 0;
      scores.distraksiNilai = 0;

      scores.flagExcessive = false;
      scores.flagCompulsive = false;
      scores.flagMidnight = false;
      scores.flagNonstop = false;
      scores.flagDistraction = false;
    }
  }

  return scores;
};

// Calculate previous and next date info
const getPrevNextDates = (currentDateStr: string) => {
  const date = new Date(currentDateStr);

  const prev = new Date(date);
  prev.setDate(date.getDate() - 1);
  const prevStr = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(prev.getDate()).padStart(2, "0")}`;

  const next = new Date(date);
  next.setDate(date.getDate() + 1);
  const nextStr = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(next.getDate()).padStart(2, "0")}`;

  const validDates = [
    "2026-05-25",
    "2026-05-26",
    "2026-05-27",
    "2026-05-28",
    "2026-05-29",
    "2026-05-30",
    "2026-05-31",
    "2026-06-01",
    "2026-06-02",
    "2026-06-03",
  ];

  const hasPrev = validDates.includes(prevStr);
  const hasNext = validDates.includes(nextStr);

  return { prevStr, nextStr, hasPrev, hasNext };
};

export default function DetailClient({ tanggal }: { tanggal: string }) {
  // Format date display (Indonesian style)
  const formatIndonesianDateStr = (dateStr: string) => {
    try {
      const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];
      const date = new Date(dateStr);
      const dayName = days[date.getDay()];
      const dateNum = date.getDate();
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      return `${dayName}, ${dateNum} ${monthName} ${year}`;
    } catch {
      return dateStr;
    }
  };

  const formattedDate = formatIndonesianDateStr(tanggal);
  const { dayData, topApps } = getDailyDataForDate(tanggal);
  const scores = getBehaviourScoresForDate(tanggal);
  const { prevStr, nextStr, hasPrev, hasNext } = getPrevNextDates(tanggal);

  // Remap data
  const sortedPeriodApps = topApps.map((a) => a.name);
  const top4Apps = sortedPeriodApps.slice(0, 4);
  const otherApps = ["Instagram", "TikTok", "YouTube", "WhatsApp"].filter(
    (app) => !top4Apps.includes(app),
  );

  const hourlyChartData = generateHourlyDataForDate(tanggal);

  const rankedHourlyData = hourlyChartData.map((hourData) => {
    const newRow: Record<string, string | number> = { jam: hourData.jam };
    for (const app of top4Apps) {
      newRow[app] = hourData[app] || 0;
    }
    let otherSum = 0;
    for (const app of otherApps) {
      otherSum += (hourData[app] as number) || 0;
    }
    newRow.Lainnya = otherSum;
    return newRow;
  });

  const appMinutes = [
    { name: "Instagram", min: dayData.Instagram || 0 },
    { name: "TikTok", min: dayData.TikTok || 0 },
    { name: "YouTube", min: dayData.YouTube || 0 },
    { name: "WhatsApp", min: dayData.WhatsApp || 0 },
  ].sort((a, b) => b.min - a.min);

  const totalMin = appMinutes.reduce((acc, curr) => acc + curr.min, 0);
  const topApp = appMinutes[0]?.min > 0 ? appMinutes[0] : null;

  // Behavioral flags indicators (always visible)
  const flagsList = [
    {
      name: "Terlalu lama main HP",
      active: scores.flagExcessive,
      icon: Clock,
      descActive: "Pemakaian total melebihi batas 4 jam.",
      descInactive: "Pemakaian gawai harian terkontrol dengan baik.",
    },
    {
      name: "Sering buka-tutup aplikasi",
      active: scores.flagCompulsive,
      icon: RotateCcw,
      descActive: "Frekuensi buka-tutup aplikasi sangat tinggi.",
      descInactive: "Frekuensi buka-tutup dalam batas normal.",
    },
    {
      name: "Main HP waktu tidur",
      active: scores.flagMidnight,
      icon: Moon,
      descActive: "Terdeteksi aktivitas pada jam tidur utama.",
      descInactive: "Fokus tidur malam terjaga dengan baik.",
    },
    {
      name: "Nonstop tanpa jeda",
      active: scores.flagNonstop,
      icon: Activity,
      descActive: "Sering menggunakan HP tanpa jeda istirahat.",
      descInactive: "Rutin mengambil jeda untuk istirahat mata.",
    },
    {
      name: "Distraksi jam produktif",
      active: scores.flagDistraction,
      icon: Briefcase,
      descActive: "Banyak membuka media sosial di jam kerja/belajar.",
      descInactive: "Konsentrasi terjaga selama jam produktif.",
    },
  ];

  // Score breakdown items
  const breakdownItems = [
    {
      name: "Durasi pemakaian",
      icon: Clock,
      bobot: "30%",
      nilai: scores.durasiNilai,
      max: scores.durasiMax,
    },
    {
      name: "Frekuensi buka-tutup",
      icon: RotateCcw,
      bobot: "20%",
      nilai: scores.frekuensiNilai,
      max: scores.frekuensiMax,
    },
    {
      name: "Aktivitas jam tidur",
      icon: Moon,
      bobot: "20%",
      nilai: scores.tidurNilai,
      max: scores.tidurMax,
    },
    {
      name: "Penggunaan nonstop",
      icon: Activity,
      bobot: "15%",
      nilai: scores.nonstopNilai,
      max: scores.nonstopMax,
    },
    {
      name: "Distraksi jam produktif",
      icon: Briefcase,
      bobot: "15%",
      nilai: scores.distraksiNilai,
      max: scores.distraksiMax,
    },
  ];

  return (
    <div className="space-y-6 font-poppins">
      {/* Header with Back button */}
      <div>
        <Link
          href="/statistik"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-primary transition-all rounded-xl bg-card border border-border hover:border-primary/20 shadow-2xs font-bold mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Statistik</span>
        </Link>
      </div>

      {/* Date Header with Calendar Navigation (Plain structure, no card wrapper) */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
            {formattedDate}
          </h1>
          <p className="text-xs text-muted font-light mt-0.5">
            Rincian dan analisis penggunaan gawai pada tanggal ini.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold shrink-0 self-start sm:self-center">
          {hasPrev ? (
            <Link
              href={`/statistik/${prevStr}`}
              className="px-3.5 py-2 rounded-xl border border-border bg-card hover:border-primary/20 text-muted hover:text-primary transition-all cursor-pointer shadow-2xs"
            >
              ← Hari sebelumnya
            </Link>
          ) : (
            <span className="px-3.5 py-2 rounded-xl border border-border/40 bg-muted-light/10 text-muted/40 cursor-not-allowed select-none">
              ← Hari sebelumnya
            </span>
          )}

          {hasNext ? (
            <Link
              href={`/statistik/${nextStr}`}
              className="px-3.5 py-2 rounded-xl border border-border bg-card hover:border-primary/20 text-muted hover:text-primary transition-all cursor-pointer shadow-2xs"
            >
              Hari berikutnya →
            </Link>
          ) : (
            <span className="px-3.5 py-2 rounded-xl border border-border/40 bg-muted-light/10 text-muted/40 cursor-not-allowed select-none">
              Hari berikutnya →
            </span>
          )}
        </div>
      </div>

      {/* Rangkuman 3 Cards (Dashboard Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Status & Skor Hari Itu */}
        <div
          className={`border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36 ${scores.statusCardBg}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
              Status & Skor Hari Itu
            </span>
            <span className="text-xl">{scores.statusEmoji}</span>
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-2xl font-black leading-none">
              {scores.totalScore}/100
            </h3>
            <h4 className="text-xs font-bold">{scores.statusTitle}</h4>
            <p className="text-[9px] font-light leading-normal opacity-85">
              {scores.statusDesc}
            </p>
          </div>
        </div>

        {/* Card 2: Total Screen Time */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Total Screen Time
            </span>
            <div className="p-2 rounded-xl bg-muted-light/60">
              <Clock className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-2xl font-black text-primary leading-none">
              {formatMinutesToHoursMins(totalMin)}
            </h3>
            <p className="text-[9px] text-muted font-light leading-normal">
              Total durasi penggunaan gawai hari itu.
            </p>
          </div>
        </div>

        {/* Card 3: Aplikasi Paling Banyak Digunakan */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-36">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Tersering hari itu
            </span>
            <div className="p-2 rounded-xl bg-muted-light/60">
              <Activity className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-2xl font-black text-primary leading-none truncate max-w-full">
              {topApp ? topApp.name : "Tidak ada"}
            </h3>
            <p className="text-[9px] text-muted font-light leading-normal">
              {topApp
                ? `Digunakan selama ${formatMinutesToHoursMins(topApp.min)}.`
                : "Tidak ada pemakaian gawai."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Hourly Chart + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Chart (2 cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-extrabold text-base text-primary">
                Rincian Penggunaan per Jam
              </h3>
              <p className="text-xs text-muted font-light mt-0.5">
                Distribusi durasi penggunaan aplikasi dalam menit setiap jamnya.
              </p>
            </div>

            <div className="flex gap-4 text-[10px] font-bold text-muted uppercase tracking-wider shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#fff0f3] border border-pink-300 block" />
                <span>🌙 Jam Tidur</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#fffbeb] border border-amber-300 block" />
                <span>💼 Jam Produktif</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto lg:overflow-x-visible pb-2 scrollbar-thin">
            <div className="h-64 min-w-[700px] lg:min-w-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rankedHourlyData}
                  margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                >
                  <XAxis
                    dataKey="jam"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 120]}
                  />
                  {/* Highlight areas matching dashboard */}
                  <ReferenceArea
                    x1="22.00"
                    x2="23.00"
                    fill="#fff0f3"
                    fillOpacity={0.75}
                    stroke="none"
                  />
                  <ReferenceArea
                    x1="00.00"
                    x2="06.00"
                    fill="#fff0f3"
                    fillOpacity={0.75}
                    stroke="none"
                  />
                  <ReferenceArea
                    x1="08.00"
                    x2="17.00"
                    fill="#fffbeb"
                    fillOpacity={0.75}
                    stroke="none"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "16px",
                      borderColor: "#e1e8ef",
                      fontFamily: "Poppins",
                      fontSize: "11px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                    }}
                    // biome-ignore lint/suspicious/noExplicitAny: Recharts Tooltip formatter types
                    formatter={(value: any, name: any) => {
                      if (value === 0) return null;
                      return [`${value} menit`, name];
                    }}
                  />
                  <Legend
                    iconSize={8}
                    iconType="circle"
                    wrapperStyle={{ fontSize: 10, paddingTop: 10 }}
                  />
                  {top4Apps.map((appName, index) => (
                    <Bar
                      key={appName}
                      dataKey={appName}
                      stackId="a"
                      fill={rankColors[index]}
                      // biome-ignore lint/suspicious/noExplicitAny: Recharts custom shape receives dynamic properties
                      shape={(shapeProps: any) => (
                        <CustomBar
                          {...shapeProps}
                          rankedApps={[...top4Apps, "Lainnya"]}
                        />
                      )}
                    />
                  ))}
                  <Bar
                    dataKey="Lainnya"
                    stackId="a"
                    fill={rankColors[4]}
                    // biome-ignore lint/suspicious/noExplicitAny: Recharts custom shape receives dynamic properties
                    shape={(shapeProps: any) => (
                      <CustomBar
                        {...shapeProps}
                        rankedApps={[...top4Apps, "Lainnya"]}
                      />
                    )}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Apps breakdown & Flags (1 col) */}
        <div className="space-y-6">
          {/* Kebiasaan Terdeteksi (5 indicators always visible, no emojis) */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs">
            <h3 className="font-extrabold text-base text-primary mb-1">
              Kebiasaan yang Terdeteksi
            </h3>
            <p className="text-xs text-muted font-light mb-4">
              Pola kebiasaan penggunaan gawai teridentifikasi hari ini.
            </p>
            <div className="space-y-3">
              {flagsList.map((flag) => {
                const IconComp = flag.icon;
                return (
                  <div
                    key={flag.name}
                    className={`flex gap-3 items-center p-3 rounded-2xl border transition-all ${
                      flag.active
                        ? "bg-red-50/45 border-red-100 text-red-800"
                        : "bg-emerald-50/20 border-emerald-100/60 text-emerald-800"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                        flag.active
                          ? "bg-red-50 border-red-200 text-red-600"
                          : "bg-emerald-50 border-emerald-200 text-emerald-600"
                      }`}
                    >
                      <IconComp className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold truncate">
                          {flag.name}
                        </h4>
                        <span
                          className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                            flag.active
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {flag.active ? "Terdeteksi" : "Aman"}
                        </span>
                      </div>
                      <p className="text-[9px] font-light opacity-85 mt-0.5 leading-snug">
                        {flag.active ? flag.descActive : flag.descInactive}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Skor Perilaku (styled like Kebiasaan yang Sering Muncul grid cards, no emojis) */}
      <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs">
        <div className="mb-4">
          <h3 className="font-extrabold text-base text-primary">
            Breakdown Skor Perilaku
          </h3>
          <p className="text-xs text-muted font-light mt-0.5 leading-relaxed">
            Dari mana skor {scores.totalScore} ini berasal?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {breakdownItems.map((item) => {
            const Icon = item.icon;
            const percent = Math.round((item.nilai / item.max) * 100);

            // Icon background and colors matching flags style
            let iconBg = "bg-emerald-50 border-emerald-100";
            let iconColor = "text-emerald-600";
            let barColor = "bg-emerald-500";

            if (percent > 66) {
              iconBg = "bg-red-50 border-red-100";
              iconColor = "text-red-600";
              barColor = "bg-red-500";
            } else if (percent > 33) {
              iconBg = "bg-amber-50 border-amber-100";
              iconColor = "text-amber-600";
              barColor = "bg-amber-500";
            }

            return (
              <div
                key={item.name}
                className="flex gap-4 p-4 rounded-3xl border border-border bg-card shadow-xs items-center"
              >
                <div
                  className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-bold text-primary truncate">
                      {item.name}
                    </h4>
                    <span className="text-[10px] text-muted font-medium shrink-0">
                      {item.nilai} dari {item.max} poin
                    </span>
                  </div>

                  <div className="w-full h-2 bg-muted-light rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className="text-[9px] text-muted font-light leading-none">
                    Bobot: {item.bobot}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
