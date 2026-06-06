import DetailClient from "./detail-client";

interface PageProps {
  params: Promise<{
    tanggal: string;
  }>;
}

export async function generateStaticParams() {
  const dates = [];
  // 2026-06-01 to 2026-06-07
  for (let i = 1; i <= 7; i++) {
    dates.push({ tanggal: `2026-06-0${i}` });
  }
  // 2026-05-25 to 2026-05-31
  for (let i = 25; i <= 31; i++) {
    dates.push({ tanggal: `2026-05-${i}` });
  }
  return dates;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <DetailClient tanggal={resolvedParams.tanggal} />;
}
