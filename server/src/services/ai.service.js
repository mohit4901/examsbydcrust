import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import axios from "axios";
import { SYLLABUS_MAP, getSubjectInfo } from "../utils/syllabus.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" }, { apiVersion: "v1beta" }); 
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * NVIDIA NIM Integration (High Quality Reasoning Fallback)
 */
const callNVIDIA = async (prompt) => {
  try {
    const response = await axios.post(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        model: "meta/llama-3.1-405b-instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4096,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error("[NVIDIA Error]:", error.message);
    return null;
  }
};

/**
 * Bulletproof PDF Parser: ESM compatible require
 */
const parsePDF = async (buffer) => {
  try {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const pdf = require('pdf-parse');
    
    if (typeof pdf === 'function') {
      return await pdf(buffer);
    } else if (pdf && typeof pdf.default === 'function') {
      return await pdf.default(buffer);
    }
    return null;
  } catch (error) {
    console.error("[PDF Parser Fatal]:", error.message);
    return null;
  }
};

/**
 * Fetch PDF as Base64 for Gemini
 */
const fetchPDFAsBase64 = async (url) => {
  try {
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      timeout: 25000 
    });
    return Buffer.from(response.data).toString("base64");
  } catch (error) {
    console.error(`[PDF Fetch Error] ${url}:`, error.message);
    return null;
  }
};

/**
 * Deep Analysis: Using Gemini with a fallback to Groq if Gemini 404s
 */
export const getDeepAnalysis = async (subjectCode, papers) => {
  try {
    const relevantPapers = papers
      .filter(p => p.subject_code.toUpperCase().replace(/\s+/g, '') === subjectCode.toUpperCase().replace(/\s+/g, ''))
      .sort((a, b) => b.year - a.year)
      .slice(0, 3);

    if (relevantPapers.length === 0) {
      throw new Error(`No papers found for ${subjectCode}.`);
    }

    console.log(`[AI] Deep Analysis for ${subjectCode} (Attempting Gemini 1.5 Flash)`);

    const paperParts = await Promise.all(
      relevantPapers.map(async (p) => {
        const base64 = await fetchPDFAsBase64(p.pdf_url);
        if (!base64) return null;
        return {
          inlineData: {
            data: base64,
            mimeType: "application/pdf"
          }
        };
      })
    );

    const validParts = paperParts.filter(p => p !== null);
    
    const subjectInfo = getSubjectInfo(subjectCode);
    const prompt = `
      You are the "DCRUST Academic Oracle". 
      Subject: ${subjectInfo ? subjectInfo.name : subjectCode} (${subjectCode})
      Units: ${subjectInfo ? subjectInfo.units.join(", ") : "Standard 4 Units"}

      TASK:
      1. CRITICAL: Identify all REPEATED QUESTIONS across these years. Count their frequency and list the years.
      2. Map all questions to Units I, II, III, IV based on the syllabus.
      3. Create a success strategy.

      OUTPUT FORMAT (Strict JSON):
      {
        "subject": "${subjectCode}",
        "subjectName": "${subjectInfo ? subjectInfo.name : ''}",
        "analysis": [
          { "unit": "Unit I", "officialName": "${subjectInfo?.units[0] || 'Unit I'}", "repeatedQuestions": [], "importantTopics": [] },
          { "unit": "Unit II", "officialName": "${subjectInfo?.units[1] || 'Unit II'}", "repeatedQuestions": [], "importantTopics": [] },
          { "unit": "Unit III", "officialName": "${subjectInfo?.units[2] || 'Unit III'}", "repeatedQuestions": [], "importantTopics": [] },
          { "unit": "Unit IV", "officialName": "${subjectInfo?.units[3] || 'Unit IV'}", "repeatedQuestions": [], "importantTopics": [] }
        ],
        "compulsorySection": [],
        "roadmap": "Strategy roadmap",
        "diagrams": [],
        "expertTip": ""
      }
    `;

    try {
      const result = await model.generateContent([prompt, ...validParts]);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (geminiError) {
      console.warn("[AI] Gemini failed, attempting NVIDIA NIM (Llama 3.1 405B)");
      
      const fallbackTexts = await Promise.all(
        relevantPapers.map(async (p) => {
          try {
            const response = await axios.get(p.pdf_url, { responseType: 'arraybuffer', timeout: 15000 });
            const buffer = Buffer.from(response.data);
            const parsed = await parsePDF(buffer);
            let text = parsed ? parsed.text : "";
            if (!text) {
              const str = buffer.toString('utf-8');
              const matches = str.match(/\((.*?)\)/g);
              text = matches ? matches.map(m => m.slice(1, -1)).join(' ') : "";
            }
            text = text.replace(/[^\x20-\x7E\n\t]/g, "").replace(/\s+/g, " ").substring(0, 2000);
            return `YEAR: ${p.year}, SESSION: ${p.session}\nCONTENT: ${text}\n---`;
          } catch (e) { return `YEAR: ${p.year} (Error: ${e.message})`; }
        })
      );

      const fallbackPrompt = `
        PRIMARY TASK: Identify EXACT REPEATED QUESTIONS across these papers. Count frequency.
        DATA: ${fallbackTexts.join("\n")}
        REQUIRED JSON FORMAT: Same as above. Return ONLY JSON.
      `;

      // Try NVIDIA First (Higher Quality than Groq)
      const nvidiaResult = await callNVIDIA(fallbackPrompt);
      if (nvidiaResult) return nvidiaResult;

      console.warn("[AI] NVIDIA failed, falling back to Groq");
      const groqCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: fallbackPrompt }],
        model: "llama-3.3-70b-versatile",
        max_tokens: 4096,
        response_format: { type: "json_object" } 
      });

      return JSON.parse(groqCompletion.choices[0]?.message?.content);
    }
  } catch (error) {
    console.error("[AI Deep Analysis Fatal Error]:", error);
    // Return a valid empty structure instead of throwing 500 to prevent frontend crash
    const subjectInfo = getSubjectInfo(subjectCode);
    return {
      subject: subjectCode,
      subjectName: subjectInfo?.name || subjectCode,
      analysis: [
        { unit: "Unit I", officialName: "Unit I", repeatedQuestions: [], importantTopics: [] },
        { unit: "Unit II", officialName: "Unit II", repeatedQuestions: [], importantTopics: [] },
        { unit: "Unit III", officialName: "Unit III", repeatedQuestions: [], importantTopics: [] },
        { unit: "Unit IV", officialName: "Unit IV", repeatedQuestions: [], importantTopics: [] }
      ],
      compulsorySection: [],
      roadmap: "Our AI engine is temporarily overloaded. Please try again in a few minutes for a detailed analysis.",
      diagrams: [],
      expertTip: "Focus on the most recent 2 years' papers for now."
    };
  }
};

/**
 * Get personalized study recommendations
 */
export const getStudyRecommendations = async (user, papers) => {
  try {
    if (!papers || papers.length === 0) return { summary: "No papers.", toughSubjects: [], strategy: "", tips: [], priorityPapers: [] };
    const prompt = `User: ${user.name} (${user.branch}, Sem ${user.semester}). Papers: ${papers.map(p => p.subject_name).join(', ')}. Format as JSON.`;
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });
    return JSON.parse(chatCompletion.choices[0]?.message?.content);
  } catch (error) {
    console.error("[AI Insights Error]:", error);
    throw error;
  }
};

/**
 * General chat with the AI
 */
export const chatWithAI = async (message, context = "") => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: `Sage. Context: ${context}. User: ${message}` }],
      model: "llama-3.3-70b-versatile",
    });
    return chatCompletion.choices[0]?.message?.content;
  } catch (error) {
    console.error("[AI Chat Error]:", error);
    throw new Error("AI Chat failed");
  }
};
