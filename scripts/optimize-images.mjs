/**
 * Optimize public/courses + public/images → WebP (max 1200px, q78).
 * Input: .jpg / .jpeg / .png. Skips logos. Idempotent if .webp already exists.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const DIRS = ["public/courses", "public/images"];
const SOURCE_EXTS = new Set([".jpg", ".jpeg", ".png"]);
const KEEP_NAMES = new Set([
  "logo.png",
  "logo-official.jpg",
  "logo-fb.jpg",
  "logo.svg",
  "hanzi-placeholder.svg",
]);

function shouldKeep(base) {
  return KEEP_NAMES.has(base);
}

function folderSize(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return 0;
  return fs
    .readdirSync(abs)
    .map((f) => fs.statSync(path.join(abs, f)).size)
    .reduce((a, b) => a + b, 0);
}

async function optimizeSource(filePath) {
  const base = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  if (!SOURCE_EXTS.has(ext)) return;
  if (shouldKeep(base)) {
    console.log(`SKIP  ${path.relative(ROOT, filePath)} (keep)`);
    return;
  }

  const dir = path.dirname(filePath);
  const name = path.basename(filePath, ext);
  const outPath = path.join(dir, `${name}.webp`);

  if (fs.existsSync(outPath)) {
    console.log(`SKIP  ${path.relative(ROOT, filePath)} (.webp exists)`);
    return;
  }

  const before = fs.statSync(filePath).size;
  const tmp = path.join(dir, `${name}.__opt.webp`);
  await sharp(filePath, { failOn: "none" })
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 78, effort: 4 })
    .toFile(tmp);
  fs.renameSync(tmp, outPath);
  const after = fs.statSync(outPath).size;
  console.log(
    `OK    ${path.relative(ROOT, filePath)} → ${path.basename(outPath)}  ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB`,
  );
}

async function walk(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) {
    console.log(`MISS  ${dir}`);
    return;
  }
  const entries = fs.readdirSync(abs, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.isDirectory()) continue;
    if (ent.name.includes(".__opt.")) continue;
    const full = path.join(abs, ent.name);
    try {
      await optimizeSource(full);
    } catch (e) {
      console.error(`FAIL  ${path.relative(ROOT, full)}: ${e.message}`);
    }
  }
}

async function main() {
  const beforeCourses = folderSize("public/courses");
  const beforeImages = folderSize("public/images");

  for (const dir of DIRS) {
    console.log(`\n── ${dir} ──`);
    await walk(dir);
  }

  const afterCourses = folderSize("public/courses");
  const afterImages = folderSize("public/images");
  console.log(
    `\nBEFORE  courses ${(beforeCourses / 1024 / 1024).toFixed(2)} MB  images ${(beforeImages / 1024 / 1024).toFixed(2)} MB`,
  );
  console.log(
    `AFTER   courses ${(afterCourses / 1024 / 1024).toFixed(2)} MB  images ${(afterImages / 1024 / 1024).toFixed(2)} MB`,
  );
  console.log(
    `SAVED   ${(((beforeCourses + beforeImages) - (afterCourses + afterImages)) / 1024 / 1024).toFixed(2)} MB`,
  );
}

main();
