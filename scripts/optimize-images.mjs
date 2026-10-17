/**
 * Optimize public/courses + public/images → WebP (max 1600px, q78).
 * Keeps logo.png / *.svg as-is.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const DIRS = ["public/courses", "public/images"];
const KEEP_AS_IS = new Set(["logo.png", "logo.svg", "hanzi-placeholder.svg"]);
const EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

async function optimizeFile(filePath) {
  const base = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  if (!EXTS.has(ext)) return null;
  if (KEEP_AS_IS.has(base)) {
    console.log(`SKIP  ${path.relative(ROOT, filePath)}`);
    return null;
  }

  const dir = path.dirname(filePath);
  const name = path.basename(filePath, ext);
  const outPath = path.join(dir, `${name}.webp`);

  const input = sharp(filePath, { failOn: "none" });
  const meta = await input.metadata();
  const width = meta.width || 0;
  const pipeline =
    width > 1600 ? input.resize({ width: 1600, withoutEnlargement: true }) : input;

  await pipeline.webp({ quality: 78, effort: 4 }).toFile(outPath);

  const before = fs.statSync(filePath).size;
  const after = fs.statSync(outPath).size;
  console.log(
    `OK    ${path.relative(ROOT, filePath)} → ${path.basename(outPath)}  ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB`,
  );

  // Remove original if we created a different file
  if (path.resolve(filePath) !== path.resolve(outPath)) {
    fs.unlinkSync(filePath);
  }
  return outPath;
}

async function walk(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) {
    console.log(`MISS  ${dir}`);
    return;
  }
  const entries = fs.readdirSync(abs, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(abs, ent.name);
    if (ent.isDirectory()) continue;
    try {
      await optimizeFile(full);
    } catch (e) {
      console.error(`FAIL  ${path.relative(ROOT, full)}: ${e.message}`);
    }
  }
}

function folderSize(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return 0;
  return fs
    .readdirSync(abs)
    .map((f) => fs.statSync(path.join(abs, f)).size)
    .reduce((a, b) => a + b, 0);
}

async function main() {
  for (const dir of DIRS) {
    console.log(`\n── ${dir} ──`);
    await walk(dir);
  }
  const courses = folderSize("public/courses");
  const images = folderSize("public/images");
  console.log(`\npublic/courses: ${(courses / 1024 / 1024).toFixed(2)} MB`);
  console.log(`public/images:  ${(images / 1024 / 1024).toFixed(2)} MB`);
  if (courses > 1.5 * 1024 * 1024) {
    console.warn("WARN: public/courses still > 1.5 MB");
    process.exitCode = 1;
  }
}

main();
