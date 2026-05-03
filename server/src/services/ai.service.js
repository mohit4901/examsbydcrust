import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import axios from "axios";
import pdf from "pdf-parse";
import { SYLLABUS_MAP, getSubjectInfo } from "../utils/syllabus.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use 1.5 Flash for large context processing
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Utility to fetch and extract text from a PDF URL
 */
const extractTextFromPDF = async (url) => {
  try {
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      timeout: 15000 // Increased timeout for slow PDF hosting
    });
    const data = await pdf(response.data);
    return data.text;
  } catch (error) {
    console.error(`Failed to parse PDF at ${url}:`, error.message);
    return ""; // Return empty if failed
  }
};

/**
 * Deep Analysis: Reads actual PDF content and finds repeated questions
 * This is the "Strongest Reasoning Layer" for Unit-wise Deep Analysis
 */
export const getDeepAnalysis = async (subjectCode, papers) => {
  try {
    // Limit to latest 3-4 papers for a comprehensive trend analysis
    const relevantPapers = papers
      .filter(p => p.subject_code === subjectCode)
      .sort((a, b) => b.year - a.year)
      .slice(0, 4);

    if (relevantPapers.length === 0) {
      throw new Error("No papers found for this subject to analyze.");
    }

    console.log(`[AI] Starting Deep Analysis for ${subjectCode} using ${relevantPapers.length} papers`);

    // Fetch and parse all PDFs in parallel
    const paperTexts = await Promise.all(
      relevantPapers.map(async (p) => {
        const text = await extractTextFromPDF(p.pdf_url);
        return `YEAR: ${p.year}, SESSION: ${p.session}\nCONTENT:\n${text}\n---`;
      })
    );

    const combinedText = paperTexts.join("\n\n");
    const subjectInfo = getSubjectInfo(subjectCode);
    
    // Dynamically inject unit names if available
    const unit1Name = subjectInfo?.units[0] || "Unit I";
    const unit2Name = subjectInfo?.units[1] || "Unit II";
    const unit3Name = subjectInfo?.units[2] || "Unit III";
    const unit4Name = subjectInfo?.units[3] || "Unit IV";

    const prompt = `
      You are the "DCRUST Academic Oracle", a multi-agent system designed to help students score 90%+ in exams.
      
      SUBJECT CONTEXT:
      - Subject: ${subjectInfo ? subjectInfo.name : subjectCode}
      - Code: ${subjectCode}
      - Units: ${subjectInfo ? subjectInfo.units.join(", ") : "Standard 4-unit curriculum"}
      
      DATA SOURCE:
      I am providing the OCR text extracted from ${relevantPapers.length} previous year question papers of DCRUST Murthal.
      
      RAW PAPER DATA:
      ${combinedText}

      YOUR ANALYSIS PROTOCOL:
      1. UNIT-WISE MAPPING: Categorize every major question into one of the 4 Units.
      2. REPETITION DETECTION: Identify EXACT questions that have appeared more than once. This is CRITICAL.
      3. PATTERN RECOGNITION: Find topics that are "Compulsory" (e.g., Short notes in Q1) or "High-Frequency".
      4. SUCCESS ROADMAP: Create a day-by-day or step-by-step strategy for THIS SPECIFIC subject.
      5. VISUAL AIDS: List all diagrams or tables that the student MUST practice.

      OUTPUT FORMAT (Strict JSON):
      {
        "subject": "${subjectCode}",
        "subjectName": "${subjectInfo ? subjectInfo.name : ''}",
        "analysis": [
          {
            "unit": "Unit I",
            "officialName": "${unit1Name}",
            "repeatedQuestions": [
              { "question": "Exact Question String", "years": [2022, 2023], "frequency": "High/Medium" }
            ],
            "importantTopics": ["Specific Topic A", "Specific Topic B"]
          },
          {
            "unit": "Unit II",
            "officialName": "${unit2Name}",
            "repeatedQuestions": [],
            "importantTopics": []
          },
          {
            "unit": "Unit III",
            "officialName": "${unit3Name}",
            "repeatedQuestions": [],
            "importantTopics": []
          },
          {
            "unit": "Unit IV",
            "officialName": "${unit4Name}",
            "repeatedQuestions": [],
            "importantTopics": []
          }
        ],
        "compulsorySection": ["Topics that usually appear in the short-note/Q1 section"],
        "roadmap": "A premium, detailed, actionable success roadmap",
        "diagrams": ["List of frequent diagrams to draw"],
        "expertTip": "One secret 'hack' to score more in this specific subject"
      }

      Note: If you don't find repeated questions for a unit, leave the array empty but provide important topics based on the syllabus context provided.
    `;

    // Use Gemini for the large context window
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON response (strip markdown blocks if any)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI failed to return structured JSON");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[AI Deep Analysis Error]:", error);
    throw error;
  }
};

/**
 * Get personalized study recommendations based on user's branch and semester
 */
export const getStudyRecommendations = async (user, papers) => {
  try {
    if (!papers || papers.length === 0) {
      return {
        summary: "We don't have enough past papers for your semester yet to generate a deep analysis.",
        toughSubjects: ["N/A"],
        strategy: "Keep checking back as we add more papers for your branch.",
        tips: ["Stay consistent", "Focus on basics", "Look for common topics"],
        priorityPapers: []
      };
    }

    const prompt = `
      You are an expert academic advisor for DCRUST University. 
      User Profile:
      - Name: ${user.name}
      - Branch: ${user.branch}
      - Semester: ${user.semester}

      Available Previous Year Papers for this user:
      ${papers.map(p => `- ${p.subject_name} (${p.subject_code}) - Year: ${p.year}`).join('\n')}

      Task:
      1. Analyze the subjects and suggest a "Reasoning-based Study Strategy".
      2. Identify which subjects might be tough and need more focus.
      3. Give 3 actionable tips for the upcoming exams.
      4. Suggest which year's papers are most relevant to practice first.

      Format ONLY as structured JSON:
      {
        "summary": "Short overview",
        "toughSubjects": ["Subject 1", "Subject 2"],
        "strategy": "The reasoning strategy",
        "tips": ["Tip 1", "Tip 2", "Tip 3"],
        "priorityPapers": ["Paper Code 1", "Paper Code 2"]
      }
    `;

    console.log("[AI] Generating Personalized Insights for:", user.email);
    
    // Use Groq for faster and more reliable responses for smaller prompts
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const text = chatCompletion.choices[0]?.message?.content;
    return JSON.parse(text);
  } catch (error) {
    console.error("[AI Groq Error]:", error);
    throw error;
  }
};

/**
 * General chat with the AI about DCRUST exams
 */
export const chatWithAI = async (message, context = "") => {
  try {
    const prompt = `
      You are "DCRUST Exam Sage", a helpful AI specialized in Deenbandhu Chhotu Ram University of Science and Technology (DCRUST) exams.
      
      Context: ${context}
      User Message: ${message}
      
      Instructions:
      - Answer based on your knowledge of Engineering curriculum and DCRUST patterns.
      - If you don't know something specific about DCRUST, give general engineering advice.
      - Be concise, helpful, and premium in your tone.
    `;

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
