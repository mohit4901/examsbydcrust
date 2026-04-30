import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://www.dcrustedp.in";
const OUTPUT_FILE = path.join(__dirname, "papers.json");

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  Accept: "text/html"
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));


async function fetchWithRetry(client, url, retries = 3) {
  for (let i = 1; i <= retries; i++) {
    try {
      return await client.get(url);
    } catch (err) {
      console.log(`      ⚠ retry ${i}/${retries}`);
      if (i === retries) throw err;
      await delay(1000 * i); // exponential backoff
    }
  }
}


async function parseSessions() {
  console.log("🚀 REAL FINAL PARSER (COOKIE + RETRY)");

  const jar = new CookieJar();
  const client = wrapper(
    axios.create({
      jar,
      withCredentials: true,
      headers: HEADERS,
      timeout: 60000 //  IMPORTANT (60s)
    })
  );

  const allPapers = [];
  const seen = new Set();

  
  const sessionRes = await client.get(`${BASE_URL}/dcrustpqp.php`);
  const $s = cheerio.load(sessionRes.data);

  const sessions = [];
  $s('a[href*="dcrustpqp2.php"]').each((_, el) => {
    const href = $s(el).attr("href");
    const text = $s(el).text().trim();
    const match = href?.match(/examid=(\d+)/);
    if (!match) return;

    const info = extractSessionInfo(text);
    if (!info.session_folder) return;

    sessions.push({
      examid: match[1],
      text,
      ...info
    });
  });

  console.log(` Sessions found: ${sessions.length}`);

  
  for (const session of sessions) {
    console.log(`\n📚 ${session.text} | examid=${session.examid}`);

    
    await client.get(
      `${BASE_URL}/dcrustpqp2.php?examid=${session.examid}`
    );

    for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
      console.log(`   🔤 ${letter}`);

      try {
        const res = await fetchWithRetry(
          client,
          `${BASE_URL}/pqp.php?letter=${letter}`
        );

        const $ = cheerio.load(res.data);
        let count = 0;

        $("tr").each((_, row) => {
          const tds = $(row).find("td");
          if (tds.length < 3) return;

          const code = $(tds[1]).text().trim();
          const name = $(tds[2]).text().trim();

          if (!code || !name || code.toLowerCase().includes("course")) return;

          const key = `${session.examid}_${code}`;
          if (seen.has(key)) return;
          seen.add(key);

          allPapers.push({
            subject_code: code,
            subject_name: name,
            session: session.session,
            year: session.year,
            examid: session.examid,
            pdf_url: `${BASE_URL}/dcrustpqp/${session.session_folder}/${code}.pdf`
          });

          count++;
        });

        if (count) console.log(` ${count} papers`);
        await delay(200);
      } catch (err) {
        console.log(`skipped (timeout / server slow)`);
        continue;
      }
    }

    await delay(600);
  }


  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allPapers, null, 2));
  console.log(`\n🎉 DONE! TOTAL PAPERS: ${allPapers.length}`);
}


function extractSessionInfo(text) {
  const lower = text.toLowerCase();
  const yearMatch = text.match(/20\d{2}/);
  if (!yearMatch) return {};

  const year = parseInt(yearMatch[0]);
  let session = "";
  let folder = "";

  if (lower.includes("june") || lower.includes("jun")) {
    session = "June";
    folder = `june${year}`;
  } else if (lower.includes("jan")) {
    session = "Jan";
    folder = `jan${year}`;
  } else if (lower.includes("dec")) {
    session = "Dec";
    folder = `dec${year}`;
  } else if (lower.includes("may")) {
    session = "May";
    folder = `may${year}`;
  }

  return { session, session_folder: folder, year };
}

parseSessions().catch(console.error);
