import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import axios from "axios";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import { SYLLABUS_MAP, getSubjectInfo } from "../utils/syllabus.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Using 1.5-flash which has a massive context window for reading multiple PDFs
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Utility to fetch and extract text from a PDF URL
 */
const extractTextFromPDF = async (url) => {
  try {
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      timeout: 20000 // 20s timeout for larger PDFs
    });
    
    // PDF-parse can be sensitive to empty buffers
    if (!response.data || response.data.length === 0) {
      return "[Empty PDF Content]";
    }

    const data = await pdf(response.data);
    return data.text || "[No Text Extracted]";
  } catch (error) {
    console.error(`[AI PDF Error] Failed to parse PDF at ${url}:`, error.message);
    return `[Error reading PDF: ${error.message}]`; 
  }
};

/**
 * Deep Analysis: Reads actual PDF content and finds repeated questions
 * This is the "Strongest Reasoning Layer" for Unit-wise Deep Analysis
 */
export const getDeepAnalysis = async (subjectCode, papers) => {
  try {
    // Filter papers to match subject code and sort by year
    const relevantPapers = papers
      .filter(p => p.subject_code.toUpperCase().replace(/\s+/g, '') === subjectCode.toUpperCase().replace(/\s+/g, ''))
      .sort((a, b) => b.year - a.year)
      .slice(0, 3); // Using 3 papers is safer for speed and context limits

    if (relevantPapers.length === 0) {
      throw new Error(`No papers found for subject code ${subjectCode} in our database.`);
    }

    console.log(`[AI] Deep Analysis: Analyzing ${relevantPapers.length} papers for ${subjectCode}`);

    // Fetch and parse all PDFs in parallel with a concurrency limit or just all at once for 3
    const paperTexts = await Promise.all(
      relevantPapers.map(async (p) => {
        const text = await extractTextFromPDF(p.pdf_url);
        // Clean text to remove excessive whitespace and binary artifacts
        const cleanText = text.replace(/\s+/g, ' ').substring(0, 15000); // Limit each paper to 15k chars for prompt safety
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
      
      DATA: Text from ${relevantPapers.length} Previous Year Papers.
      ${combinedText}

      TASK:
      1. Map questions to Unit I, II, III, or IV.
      2. Find EXACT repeated questions (very important).
      3. List high-frequency topics.
      4. Create a specific Success Roadmap.

      OUTPUT FORMAT (Strict JSON):
      {
        "subject": "${subjectCode}",
        "subjectName": "${subjectInfo ? subjectInfo.name : ''}",
        "analysis": [
          { "unit": "Unit I", "officialName": "${unit1Name}", "repeatedQuestions": [{ "question": "...", "years": [2022], "frequency": "High" }], "importantTopics": ["..."] },
          { "unit": "Unit II", "officialName": "${unit2Name}", "repeatedQuestions": [], "importantTopics": [] },
          { "unit": "Unit III", "officialName": "${unit3Name}", "repeatedQuestions": [], "importantTopics": [] },
          { "unit": "Unit IV", "officialName": "${unit4Name}", "repeatedQuestions": [], "importantTopics": [] }
        ],
        "compulsorySection": ["Topics for Q1"],
        "roadmap": "Actionable roadmap",
        "diagrams": ["Must-draw diagrams"],
        "expertTip": "One secret score hack"
      }
    `;

    // Try Gemini first
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI returned malformed response. Please try again.");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[AI Deep Analysis Error]:", error);
    throw new Error(error.message || "Deep analysis failed due to an internal server error.");
  }
};

/**
 * Get personalized study recommendations based on user's branch and semester
 */
export const getStudyRecommendations = async (user, papers) => {
  try {
    if (!papers || papers.length === 0) {
      return {
        summary: "Not enough papers yet.",
        toughSubjects: ["N/A"],
        strategy: "Keep checking.",
        tips: ["Consistency"],
        priorityPapers: []
      };
    }

    const prompt = `
      Analyze for ${user.name} (${user.branch}, Sem ${user.semester}):
      Papers: ${papers.map(p => `${p.subject_name} (${p.subject_code})`).join(', ')}
      Format as JSON: { summary, toughSubjects:[], strategy, tips:[], priorityPapers:[] }
    `;

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
    const prompt = `DCRUST Exam Sage. Context: ${context}. User: ${message}`;
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
