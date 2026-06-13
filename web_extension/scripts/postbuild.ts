import { readdir, rename, cp, readFile, writeFile, rm } from "fs/promises";
import { join, extname } from "path";
import { existsSync } from "fs";

const OUT_DIR = "./out";

// Folders to rename: [oldName, newName]
const RENAMES: [string, string][] = [["_next", "nextassets"]];

// Folders to just delete (not needed for extension)
const DELETE_DIRS = ["_not-found"];

async function getAllFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function replaceInFile(
  filePath: string,
  replacements: [string, string][],
) {
  const textExtensions = [".html", ".js", ".css", ".json", ".txt", ".map"];
  if (!textExtensions.includes(extname(filePath))) return;

  let content = await readFile(filePath, "utf-8");
  let changed = false;

  for (const [oldName, newName] of replacements) {
    const updated = content
      .replaceAll(`/${oldName}/`, `/${newName}/`)
      .replaceAll(`"${oldName}/`, `"${newName}/`)
      .replaceAll(`'${oldName}/`, `'${newName}/`)
      .replaceAll(`\\u002F${oldName}\\u002F`, `\\u002F${newName}\\u002F`)
      .replaceAll(`/${oldName}"`, `/${newName}"`)
      .replaceAll(`"/${oldName}`, `"/${newName}`);

    if (updated !== content) {
      content = updated;
      changed = true;
    }
  }

  if (changed) {
    await writeFile(filePath, content, "utf-8");
    console.log(`  Updated: ${filePath}`);
  }
}

async function removeUnderscoreFiles(dir: string) {
  // Remove __next.* files (Next.js internal RSC payload files) from root
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith("__next.") || entry.name.startsWith("__next_")) {
      const fullPath = join(dir, entry.name);
      await rm(fullPath, { recursive: true, force: true });
      console.log(`  Removed: ${fullPath}`);
    }
  }
}

async function removeUnneededDirs(dir: string) {
  // These Next.js pages aren't needed in a browser extension
  const toRemove = ["404", "notfound", "404.html", "index.txt"];
  for (const name of toRemove) {
    const fullPath = join(dir, name);
    if (existsSync(fullPath)) {
      await rm(fullPath, { recursive: true, force: true });
      console.log(`  Removed: ${fullPath}`);
    }
  }

  // Also remove .txt payload files at root
  const entries = await readdir(dir);
  for (const name of entries) {
    if (name.endsWith(".txt")) {
      const fullPath = join(dir, name);
      await rm(fullPath, { recursive: true, force: true });
    }
  }
}

async function safeRename(oldPath: string, newPath: string) {
  try {
    // Try fast rename first
    await rename(oldPath, newPath);
  } catch {
    // Fallback: copy then delete (works around Windows EPERM on locked dirs)
    await cp(oldPath, newPath, { recursive: true });
    await rm(oldPath, { recursive: true, force: true });
  }
}

async function main() {
  // Step 1: Delete underscore dirs we don't need
  for (const dirName of DELETE_DIRS) {
    const fullPath = join(OUT_DIR, dirName);
    if (existsSync(fullPath)) {
      await rm(fullPath, { recursive: true, force: true });
      console.log(`✓ Deleted "${dirName}"`);
    }
  }

  // Step 2: Rename _next → nextassets (with Windows-safe fallback)
  for (const [oldName, newName] of RENAMES) {
    const oldPath = join(OUT_DIR, oldName);
    const newPath = join(OUT_DIR, newName);
    if (existsSync(oldPath)) {
      await safeRename(oldPath, newPath);
      console.log(`✓ Renamed "${oldName}" → "${newName}"`);
    }
  }

  // Step 3: Update all references in output files
  const files = await getAllFiles(OUT_DIR);
  for (const file of files) {
    await replaceInFile(file, RENAMES);
  }

  // Step 4: Remove __next.* RSC payload files from root
  await removeUnderscoreFiles(OUT_DIR);

  // Step 5: Remove unneeded Next.js pages and .txt payloads
  await removeUnneededDirs(OUT_DIR);

  console.log(`\n✓ All done! Extension output ready in ${OUT_DIR}/`);
}

main().catch((err) => {
  console.error("Post-build failed:", err);
  process.exit(1);
});
