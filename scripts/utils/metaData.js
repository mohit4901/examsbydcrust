import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

/* ---------------- PDF TEXT ---------------- */
export async function readFirstPageText(pdfPath) {
  try {
    if (!fs.existsSync(pdfPath)) return null;
    const buffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(buffer);
    return data.text
      .slice(0, 4000)
      .replace(/\s+/g, " ")
      .toLowerCase();
  } catch {
    return null;
  }
}

/* ---------------- SEMESTER ---------------- */
const SEMESTER_REGEX = [
  { re: /first\s+semester/, val: 1 },
  { re: /second\s+semester/, val: 2 },
  { re: /third\s+semester/, val: 3 },
  { re: /fourth\s+semester/, val: 4 },
  { re: /fifth\s+semester/, val: 5 },
  { re: /sixth\s+semester/, val: 6 },
  { re: /seventh\s+semester/, val: 7 },
  { re: /eighth\s+semester/, val: 8 }
];

export function extractSemester(text) {
  if (!text) return null;
  for (const s of SEMESTER_REGEX) {
    if (s.re.test(text)) return s.val;
  }
  return null;
}

/* ---------------- DEGREE ---------------- */
export function extractDegree(text) {
  if (!text) return null;
  if (/b\.?\s*tech/.test(text)) return "B.Tech";
  if (/m\.?\s*tech/.test(text)) return "M.Tech";
  if (/bca/.test(text)) return "BCA";
  if (/mca/.test(text)) return "MCA";
  return null;
}

/* ---------------- SCHEME ---------------- */
export function extractScheme(text) {
  if (!text) return null;
  if (/\(a\s*scheme\)/.test(text)) return "A";
  if (/\(b\s*scheme\)/.test(text)) return "B";
  if (/\(c\s*scheme\)/.test(text)) return "C";
  return null;
}

/* ---------------- COMMON / BRANCH ---------------- */
export function extractPaperType(text) {
  if (!text) return null;
  if (/common\s+for\s+all\s+branches/.test(text)) {
    return "COMMON_FOR_ALL";
  }
  return null;
}
