import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import axios from "axios";
import { SYLLABUS_MAP, getSubjectInfo } from "../utils/syllabus.js";

dotenv.config();

// Attempt to use v1 API version which is more stable for flash models
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
      1. Map all questions from these PDFs to Units I, II, III, IV.
      2. Identify repeated questions.
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
      return JSON.parse(response.text().match(/\{[\s\S]*\}/)[0]);
    } catch (geminiError) {
      console.warn("[AI] Gemini failed, falling back to Llama 3.3 70B with text extraction hack");
      
      // Fallback: If Gemini fails, we use Groq with a basic text extraction
      const fallbackTexts = await Promise.all(
        relevantPapers.map(async (p) => {
          const response = await axios.get(p.pdf_url, { responseType: 'arraybuffer' });
          const buffer = Buffer.from(response.data);
          // Very basic text extraction from PDF binary (finding strings in parentheses)
          const str = buffer.toString('utf-8');
          const matches = str.match(/\((.*?)\)/g);
          const text = matches ? matches.map(m => m.slice(1, -1)).join(' ').substring(0, 8000) : "PDF data hidden";
          return `YEAR: ${p.year}\nCONTENT: ${text}\n---`;
        })
      );

      const fallbackCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt + "\n\nDATA:\n" + fallbackTexts.join("\n") }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });
      return JSON.parse(fallbackCompletion.choices[0]?.message?.content);
    }
  } catch (error) {
    console.error("[AI Deep Analysis Error]:", error);
    throw new Error("Deep analysis service is currently under maintenance. Please try again later.");
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
      messages: [{ role: "user", content: chatCompletion }], // Fix: message should be here
      messages: [{ role: "user", content: `Sage. Context: ${context}. User: ${message}` }],
      model: "llama-3.3-70b-versatile",
    });
    return chatCompletion.choices[0]?.message?.content;
  } catch (error) {
    console.error("[AI Chat Error]:", error);
    throw new Error("AI Chat failed");
  }
};
