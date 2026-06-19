import { sql } from "drizzle-orm";
import { db } from "./src/lib/databases";
import { table } from "./src/lib/databases/schema";

async function main() {
  const result = await db
    .select({
      userId: table.dailyStats.userId,
      appId: table.dailyStats.appId,
      statDate: table.dailyStats.statDate,
      count: sql<number>`count(*)`,
    })
    .from(table.dailyStats)
    .groupBy(
      table.dailyStats.userId,
      table.dailyStats.appId,
      table.dailyStats.statDate,
    )
    .having(sql`count(*) > 1`);

  console.log("Duplicate daily_stats rows:", result);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
