import { Jimp } from "jimp";
import * as path from "node:path";
import * as fs from "node:fs";

const sourceIconPath = path.resolve("assets/icon.png");
const resDir = path.resolve("android/app/src/main/res");

const mipmaps = [
  { folder: "mipmap-mdpi", size: 48, fgSize: 108 },
  { folder: "mipmap-hdpi", size: 72, fgSize: 162 },
  { folder: "mipmap-xhdpi", size: 96, fgSize: 216 },
  { folder: "mipmap-xxhdpi", size: 144, fgSize: 324 },
  { folder: "mipmap-xxxhdpi", size: 192, fgSize: 432 },
];

async function generate() {
  try {
    console.log(`Loading source icon from: ${sourceIconPath}`);
    if (!fs.existsSync(sourceIconPath)) {
      throw new Error(`Source icon not found at ${sourceIconPath}`);
    }

    for (const mipmap of mipmaps) {
      const folderPath = path.join(resDir, mipmap.folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // 1. Generate ic_launcher.png (Regular Icon)
      const launcherIcon = await Jimp.read(sourceIconPath);
      launcherIcon.resize({ w: mipmap.size, h: mipmap.size });
      const launcherPath = path.join(folderPath, "ic_launcher.png");
      await launcherIcon.write(launcherPath);
      console.log(`Generated: ${launcherPath} (${mipmap.size}x${mipmap.size})`);

      // 2. Generate ic_launcher_round.png (Round Icon)
      const roundIcon = await Jimp.read(sourceIconPath);
      roundIcon.resize({ w: mipmap.size, h: mipmap.size });
      const roundPath = path.join(folderPath, "ic_launcher_round.png");
      await roundIcon.write(roundPath);
      console.log(`Generated: ${roundPath} (${mipmap.size}x${mipmap.size})`);

      // 3. Generate ic_launcher_foreground.png (Adaptive Icon Foreground)
      const fgCanvasSize = mipmap.fgSize;
      const logoSize = Math.round(fgCanvasSize * 0.65); // 65% of the canvas size to fit Android's icon safe-zone

      const resizedLogoForFg = await Jimp.read(sourceIconPath);
      resizedLogoForFg.resize({ w: logoSize, h: logoSize });

      // Create a transparent background canvas
      const fgCanvas = new Jimp({
        width: fgCanvasSize,
        height: fgCanvasSize,
        color: "#00000000",
      });

      // Center and composite the logo into the canvas
      const xOffset = Math.round((fgCanvasSize - logoSize) / 2);
      const yOffset = Math.round((fgCanvasSize - logoSize) / 2);
      fgCanvas.composite(resizedLogoForFg, xOffset, yOffset);

      const fgPath = path.join(folderPath, "ic_launcher_foreground.png");
      await fgCanvas.write(fgPath);
      console.log(
        `Generated adaptive foreground: ${fgPath} (${fgCanvasSize}x${fgCanvasSize})`,
      );
    }

    console.log("Android launcher icons generated successfully!");
  } catch (error) {
    console.error("Failed to generate Android launcher icons:", error);
    process.exit(1);
  }
}

generate();
