import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import axios from "axios";
import { SYLLABUS_MAP, getSubjectInfo } from "../utils/syllabus.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Gemini 1.5 Flash is perfect for direct PDF processing
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
 * Deep Analysis: Using Gemini 1.5 Flash's Native PDF Support
 * This is the ultimate fix for PDF parsing issues.
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

    console.log(`[AI] Deep Analysis for ${subjectCode} using Gemini Native PDF Support`);

    // Fetch all PDFs as base64
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
    if (validParts.length === 0) {
      throw new Error("Failed to download any PDF papers for analysis.");
    }

    const subjectInfo = getSubjectInfo(subjectCode);
    const unit1Name = subjectInfo?.units[0] || "Unit I";
    const unit2Name = subjectInfo?.units[1] || "Unit II";
    const unit3Name = subjectInfo?.units[2] || "Unit III";
    const unit4Name = subjectInfo?.units[3] || "Unit IV";

    const prompt = `
      You are the "DCRUST Academic Oracle". I have attached ${validParts.length} previous year question papers for the subject ${subjectCode}.
      
      Subject: ${subjectInfo ? subjectInfo.name : subjectCode}
      Official Units: ${subjectInfo ? subjectInfo.units.join(", ") : "Standard 4-unit curriculum"}

      TASK:
      1. Analyze the attached PDFs and map all questions to their respective Units.
      2. Identify EXACT repeated questions across these years.
      3. List high-frequency topics that appear almost every year.
      4. Create a comprehensive "Success Roadmap" for this subject.
      5. List must-draw diagrams.

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
        "compulsorySection": ["Topics for short notes / Q1"],
        "roadmap": "A premium, detailed roadmap for this subject",
        "diagrams": ["List of diagrams"],
        "expertTip": "Expert tip to score 90+"
      }
    `;

    // Send to Gemini with native PDF parts
    const result = await model.generateContent([prompt, ...validParts]);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI response was not in JSON format.");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[AI Deep Analysis Error]:", error);
    // Fallback to Groq if Gemini fails (but without PDF text since pdf-parse is broken)
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
