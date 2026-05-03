import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import axios from "axios";
import { SYLLABUS_MAP, getSubjectInfo } from "../utils/syllabus.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use gemini-1.5-flash with v1 for maximum stability
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1" }); 
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
        },
        timeout: 20000
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
      timeout: 15000 
    });
    return Buffer.from(response.data).toString("base64");
  } catch (error) {
    console.error(`[PDF Fetch Error] ${url}:`, error.message);
    return null;
  }
};

/**
 * Stage 1: Extraction (Using Gemini 1.5 Flash - Direct REST API)
 */
const extractTextFromPDF = async (url) => {
  try {
    const base64 = await fetchPDFAsBase64(url);
    if (!base64) return null;

    const prompt = "Extract all text from this exam paper. Include questions and units. Return raw text only.";
    
    // Direct REST API call to bypass SDK issues
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "application/pdf", data: base64 } }
          ]
        }]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.warn(`[Extraction Error] ${url}:`, error.response?.data || error.message);
    return null;
  }
};

/**
 * Deep Analysis: Triple-Model Pipeline
 * Stage 1: Gemini (Text Extraction)
 * Stage 2: NVIDIA (Deep Reasoning)
 * Stage 3: Groq (Verification & JSON Formatting)
 */
export const getDeepAnalysis = async (subjectCode, papers) => {
  const subjectInfo = getSubjectInfo(subjectCode);
  
  try {
    const relevantPapers = papers
      .filter(p => p.subject_code.toUpperCase().replace(/\s+/g, '') === subjectCode.toUpperCase().replace(/\s+/g, ''))
      .sort((a, b) => b.year - a.year)
      .slice(0, 3);

    if (relevantPapers.length === 0) throw new Error(`No papers found for ${subjectCode}.`);

    console.log(`[AI Pipeline] Starting Analysis for ${subjectCode}`);

    // STAGE 1: Extract Text from all papers using Gemini
    const extractedTexts = await Promise.all(
      relevantPapers.map(async (p) => {
        const text = await extractTextFromPDF(p.pdf_url);
        return text ? `YEAR: ${p.year}\nCONTENT: ${text}\n---` : null;
      })
    );

    const fullRawText = extractedTexts.filter(t => t !== null).join("\n");
    if (!fullRawText) throw new Error("Could not extract text from any papers.");

    // STAGE 2: Deep Analysis using NVIDIA Llama 3.1 405B
    console.log("[AI Pipeline] Stage 2: NVIDIA (Deep Reasoning)");
    const analysisPrompt = `
      Subject: ${subjectInfo?.name || subjectCode}
      Data: ${fullRawText.substring(0, 10000)}
      
      TASK: 
      1. Find all REPEATED questions and their frequency.
      2. Map questions to Units I, II, III, IV.
      3. Create a success strategy.
      
      Return JSON:
      {
        "subject": "${subjectCode}",
        "subjectName": "${subjectInfo?.name || subjectCode}",
        "analysis": [
          { "unit": "Unit I", "officialName": "${subjectInfo?.units[0] || 'Unit I'}", "repeatedQuestions": [], "importantTopics": [] },
          { "unit": "Unit II", "officialName": "${subjectInfo?.units[1] || 'Unit II'}", "repeatedQuestions": [], "importantTopics": [] },
          { "unit": "Unit III", "officialName": "${subjectInfo?.units[2] || 'Unit III'}", "repeatedQuestions": [], "importantTopics": [] },
          { "unit": "Unit IV", "officialName": "${subjectInfo?.units[3] || 'Unit IV'}", "repeatedQuestions": [], "importantTopics": [] }
        ],
        "roadmap": "detailed strategy",
        "diagrams": ["list of diagrams"],
        "expertTip": "tip"
      }
    `;

    let finalResult = await callNVIDIA(analysisPrompt);

    // STAGE 3: Final Verification & Formatting using Groq
    if (!finalResult) {
      console.log("[AI Pipeline] Stage 3: Groq (Fallback Analysis)");
      const groqCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: analysisPrompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" } 
      });
      finalResult = JSON.parse(groqCompletion.choices[0]?.message?.content);
    }

    return finalResult;
  } catch (error) {
    console.error("[AI Pipeline Fatal]:", error);
    return {
      subject: subjectCode,
      subjectName: subjectInfo?.name || subjectCode,
      analysis: [
        { unit: "Unit I", repeatedQuestions: [], importantTopics: ["Could not extract paper text. Check PDF availability."] },
        { unit: "Unit II", repeatedQuestions: [], importantTopics: [] },
        { unit: "Unit III", repeatedQuestions: [], importantTopics: [] },
        { unit: "Unit IV", repeatedQuestions: [], importantTopics: [] }
      ],
      roadmap: "Our AI pipeline encountered an issue reading the source PDFs. Please try again later.",
      expertTip: "Try a different subject code or check if papers are available."
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
