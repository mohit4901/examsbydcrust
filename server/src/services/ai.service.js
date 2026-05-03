import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import axios from "axios";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Robust PDF-parse import for ESM
let pdf;
try {
  const pdfRaw = require("pdf-parse");
  pdf = typeof pdfRaw === 'function' ? pdfRaw : pdfRaw.default || pdfRaw;
} catch (e) {
  console.error("Failed to load pdf-parse:", e.message);
}

import { SYLLABUS_MAP, getSubjectInfo } from "../utils/syllabus.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Utility to fetch and extract text from a PDF URL
 */
const extractTextFromPDF = async (url) => {
  try {
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      timeout: 20000 
    });
    
    if (!response.data || response.data.length === 0) return "";
    
    if (typeof pdf !== 'function') {
      console.error("PDF parser is not a function. Type:", typeof pdf);
      return "[PDF Parser Error]";
    }

    const data = await pdf(response.data);
    return data.text || "";
  } catch (error) {
    console.error(`[PDF Error] ${url}:`, error.message);
    return ""; 
  }
};

/**
 * Deep Analysis: Using Groq (Llama 3.3 70B) for strongest reasoning and better reliability
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

    console.log(`[AI] Deep Analysis for ${subjectCode} using Groq`);

    const paperTexts = await Promise.all(
      relevantPapers.map(async (p) => {
        const text = await extractTextFromPDF(p.pdf_url);
        // Limit each paper to 10k chars to stay safe within Groq context (128k)
        const cleanText = text.replace(/\s+/g, ' ').substring(0, 10000); 
        return `YEAR: ${p.year}, SESSION: ${p.session}\nCONTENT: ${cleanText}\n---`;
      })
    );

    const combinedText = paperTexts.join("\n\n");
    const subjectInfo = getSubjectInfo(subjectCode);
    
    const unit1Name = subjectInfo?.units[0] || "Unit I";
    const unit2Name = subjectInfo?.units[1] || "Unit II";
    const unit3Name = subjectInfo?.units[2] || "Unit III";
    const unit4Name = subjectInfo?.units[3] || "Unit IV";

    const prompt = `
      You are the "DCRUST Academic Oracle". 
      Subject: ${subjectInfo ? subjectInfo.name : subjectCode} (${subjectCode})
      Units: ${subjectInfo ? subjectInfo.units.join(", ") : "Unit I, II, III, IV"}
      
      DATA: Text from ${relevantPapers.length} papers.
      ${combinedText}

      TASK:
      1. Map questions to Units.
      2. Find EXACT repeated questions.
      3. List high-frequency topics.
      4. Create a Success Roadmap.

      OUTPUT FORMAT (Strict JSON):
      {
        "subject": "${subjectCode}",
        "subjectName": "${subjectInfo ? subjectInfo.name : ''}",
        "analysis": [
          { "unit": "Unit I", "officialName": "${unit1Name}", "repeatedQuestions": [], "importantTopics": [] },
          { "unit": "Unit II", "officialName": "${unit2Name}", "repeatedQuestions": [], "importantTopics": [] },
          { "unit": "Unit III", "officialName": "${unit3Name}", "repeatedQuestions": [], "importantTopics": [] },
          { "unit": "Unit IV", "officialName": "${unit4Name}", "repeatedQuestions": [], "importantTopics": [] }
        ],
        "compulsorySection": [],
        "roadmap": "",
        "diagrams": [],
        "expertTip": ""
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    return JSON.parse(chatCompletion.choices[0]?.message?.content);
  } catch (error) {
    console.error("[AI Deep Analysis Error]:", error);
    throw new Error(error.message || "Deep analysis failed.");
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
    const prompt = `DCRUST Sage. Context: ${context}. User: ${message}`;
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });
    return chatCompletion.choices[0]?.message?.content;
  } catch (error) {
    console.error("[AI Chat Error]:", error);
    throw new Error("AI Chat failed");
  }
};
