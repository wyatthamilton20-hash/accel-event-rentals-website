import sharp from "sharp";
import { readdirSync, statSync } from "fs";
import { join } from "path";

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(jpe?g|png|webp)$/i.test(e.name)) out.push(p);
  }
  return out;
}

const usedInHero = new Set([
  "public\\images\\inspiration\\kualoa-ranch.jpeg",
  "public\\images\\social\\_DSC2706.jpg",
  "public\\images\\social\\OB3A0757.jpg",
  "public\\images\\social\\Sunset-Ranch.png",
  "public\\images\\social\\Four-Seasons_Accel-Events-Tents.png",
]);

const files = walk("public/images").sort();
const candidates = [];
for (const f of files) {
  try {
    const m = await sharp(f).metadata();
    const w = m.width, h = m.height;
    if (w >= h && w >= 1000) candidates.push({ f, w, h });
  } catch {}
}
candidates.sort((a, b) => (b.w * b.h) - (a.w * a.h));
for (const c of candidates) {
  const marker = usedInHero.has(c.f) ? "  [used in hero]" : "";
  console.log(`${c.w}x${c.h}\t${c.f}${marker}`);
}
