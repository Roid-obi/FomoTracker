import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

const srcDir = path.resolve("src/app");
const renamedFiles: { original: string; temp: string }[] = [];
const modifiedFiles: { path: string; originalContent: string }[] = [];

// Specific dynamic pages to stub for the mobile static export
const stubs: { [filePath: string]: string } = {
  "src/app/(app)/insight/[id]/page.tsx": `import { redirect } from "next/navigation";

export async function generateStaticParams() {
  return [{ id: "1" }];
}

export default async function DetailInsightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  redirect(\`https://fomotracker.vercel.app/insight/\${id}\`);
}
`,
};

// Recursive function to process files
function processFiles(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processFiles(fullPath);
    } else if (entry.isFile()) {
      if (entry.name === "route.ts" || entry.name === "route.js") {
        const tempPath = `${fullPath}.bak`;
        console.log(`Renaming route: ${fullPath} -> ${tempPath}`);
        fs.renameSync(fullPath, tempPath);
        renamedFiles.push({ original: fullPath, temp: tempPath });
      }
    }
  }
}

try {
  // Clear Next.js build cache and output directory to prevent any caching issues
  const nextDir = path.resolve(".next");
  const outDir = path.resolve("out");

  if (fs.existsSync(nextDir)) {
    console.log("Clearing .next cache...");
    fs.rmSync(nextDir, { recursive: true, force: true });
  }
  if (fs.existsSync(outDir)) {
    console.log("Clearing out directory...");
    fs.rmSync(outDir, { recursive: true, force: true });
  }

  // 1. Rename route handlers
  if (fs.existsSync(srcDir)) {
    console.log(`Scanning and disabling route handlers in ${srcDir} for mobile build...`);
    processFiles(srcDir);
  }

  // 2. Apply page stubs for dynamic server-side pages
  for (const [relativePath, stubContent] of Object.entries(stubs)) {
    const fullPath = path.resolve(relativePath);
    if (fs.existsSync(fullPath)) {
      console.log(`Stubbing dynamic page: ${fullPath}`);
      const originalContent = fs.readFileSync(fullPath, "utf-8");
      modifiedFiles.push({ path: fullPath, originalContent });
      fs.writeFileSync(fullPath, stubContent, "utf-8");
    }
  }

  console.log("Running Next.js build...");
  const buildEnv = {
    ...process.env,
    NEXT_PUBLIC_BUILD_TARGET: "mobile",
  };

  const buildResult = spawnSync("bun", ["run", "build"], {
    stdio: "inherit",
    env: buildEnv,
    shell: true,
  });

  if (buildResult.status !== 0) {
    throw new Error(`Next.js build failed with exit code ${buildResult.status}`);
  }

  console.log("Running Capacitor sync...");
  const capResult = spawnSync("bunx", ["cap", "sync", "android"], {
    stdio: "inherit",
    shell: true,
  });

  if (capResult.status !== 0) {
    throw new Error(`Capacitor sync failed with exit code ${capResult.status}`);
  }

  console.log("Build and sync completed successfully!");
} catch (error) {
  console.error("An error occurred during build:", error);
  process.exitCode = 1;
} finally {
  // Restore renamed files
  if (renamedFiles.length > 0) {
    console.log("Restoring route files...");
    for (const file of renamedFiles) {
      if (fs.existsSync(file.temp)) {
        try {
          fs.renameSync(file.temp, file.original);
          console.log(`Restored: ${file.original}`);
        } catch (restoreError) {
          console.error(`Failed to restore route: ${file.original}`, restoreError);
        }
      }
    }
  }

  // Restore modified files
  if (modifiedFiles.length > 0) {
    console.log("Restoring modified page files...");
    for (const file of modifiedFiles) {
      try {
        fs.writeFileSync(file.path, file.originalContent, "utf-8");
        console.log(`Restored content of: ${file.path}`);
      } catch (restoreError) {
        console.error(`Failed to restore content of: ${file.path}`, restoreError);
      }
    }
  }
}
