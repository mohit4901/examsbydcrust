import fs from "fs";
import { createCanvas } from "@napi-rs/canvas";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import Tesseract from "tesseract.js";


const INPUT = "./papers.json";
const OUTPUT = "./papers_normalized.jsonl";
const CHECKPOINT = "./checkpoint.txt";

const BATCH_SIZE = 4;      // accuracy > speed
const OCR_DELAY = 300;


const BRANCH_RULES = {
  AER: "AERONAUTICAL ENGINEERING",
  AE: "AUTOMOBILE ENGINEERING",
  ME: "MECHANICAL ENGINEERING",
  CE: "CIVIL ENGINEERING",
  EEE: "ELECTRICAL ENGINEERING",
  EE: "ELECTRICAL ENGINEERING",
  ECE: "ELECTRONICS & COMMUNICATION",
  EC: "ELECTRONICS & COMMUNICATION",
  CH: "CHEMICAL ENGINEERING",
  BT: "BIOTECHNOLOGY",
  CSE: "COMPUTER SCIENCE",
  CS: "COMPUTER SCIENCE",
  IT: "INFORMATION TECHNOLOGY",
  BCA: "BCA",
  MCA: "MCA"
};

function detectBranchFromCode(code = "") {
  const c = code.toUpperCase();
  for (const k of Object.keys(BRANCH_RULES).sort((a, b) => b.length - a.length)) {
    if (c.startsWith(k)) return BRANCH_RULES[k];
  }
  return "GENERAL";
}


const worker = await Tesseract.createWorker("eng");


async function extractTextFromPDF(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!res.ok) throw new Error("PDF fetch failed");

    const buffer = await res.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1.7 }); // accuracy biased
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");

    await page.render({ canvasContext: ctx, viewport }).promise;

    const image = canvas.toBuffer("image/png");
    const { data } = await worker.recognize(image);

    page.cleanup();
    pdf.cleanup();
    canvas.width = 0;
    canvas.height = 0;

    return data.text || "";
  } catch {
    return "";
  }
}


function cleanText(text = "") {
  return text
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[|_~]/g, "")
    .toLowerCase();
}


const SEM_MAP = {
  first: 1, i: 1,
  second: 2, ii: 2,
  third: 3, iii: 3,
  fourth: 4, iv: 4,
  fifth: 5, v: 5,
  sixth: 6, vi: 6,
  seventh: 7, vii: 7,
  eighth: 8, viii: 8
};

function detectSemester(text) {
  const t = cleanText(text);
  const m = t.match(
    /(first|second|third|fourth|fifth|sixth|seventh|eighth|\bi{1,3}\b|\biv\b|\bv\b|\bvi\b|\bvii\b|\bviii\b)\s*semester/
  );
  return m ? SEM_MAP[m[1]] : null;
}


function detectDegree(text) {
  const t = cleanText(text);
  if (/\bb\.?\s*tech\b/.test(t)) return "B.Tech";
  if (/\bm\.?\s*tech\b/.test(t)) return "M.Tech";
  if (/\bbca\b/.test(t)) return "BCA";
  if (/\bmca\b/.test(t)) return "MCA";
  return null;
}


function detectScheme(text) {
  const t = cleanText(text);
  if (/\bc\s*scheme\b/.test(t)) return "C";
  if (/\bb\s*scheme\b/.test(t)) return "B";
  if (/\ba\s*scheme\b/.test(t)) return "A";
  return null;
}


async function normalize() {
  const raw = JSON.parse(fs.readFileSync(INPUT, "utf8"));
  let startIndex = fs.existsSync(CHECKPOINT)
    ? Number(fs.readFileSync(CHECKPOINT))
    : 0;

  console.log(` STARTING OCR FROM ${startIndex}/${raw.length}`);

  for (let i = startIndex; i < raw.length; i += BATCH_SIZE) {
    const batch = raw.slice(i, i + BATCH_SIZE);

    for (let j = 0; j < batch.length; j++) {
      const idx = i + j;
      const p = batch[j];
      const start = Date.now();

      console.log(` ${idx + 1}/${raw.length} → ${p.subject_code}`);

      const text = await extractTextFromPDF(p.pdf_url);

      const record = {
        subject_code: p.subject_code,
        subject_name: p.subject_name,
        branch: detectBranchFromCode(p.subject_code),
        semester: detectSemester(text),
        degree: detectDegree(text),
        scheme: detectScheme(text),
        year: p.year,
        session: p.session,
        examid: p.examid,
        pdf_url: p.pdf_url,
        created_at: new Date().toISOString()
      };

      fs.appendFileSync(OUTPUT, JSON.stringify(record) + "\n");
      fs.writeFileSync(CHECKPOINT, String(idx + 1));

      console.log(
        ` ${record.semester ?? "?"} | 🏫 ${record.degree ?? "?"} | 📘 ${record.scheme ?? "?"} | ⏱ ${(Date.now() - start) / 1000}s`
      );

      await new Promise(r => setTimeout(r, OCR_DELAY));
    }

    global.gc && global.gc();
    console.log(`Batch ${(i / BATCH_SIZE) + 1} complete`);
  }

  await worker.terminate();
  console.log("✅ NORMALIZATION COMPLETE (ACCURACY MODE)");
}

normalize();
