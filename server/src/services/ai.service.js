import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

    console.log("Generating AI Insights with Groq for:", user.email);
    
    // Use Groq for faster and more reliable responses
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const text = chatCompletion.choices[0]?.message?.content;
    console.log("Groq Raw Response:", text);

    return JSON.parse(text);
  } catch (error) {
    console.error("Groq AI Error:", error);
    
    // Fallback to Gemini if Groq fails
    if (process.env.GEMINI_API_KEY) {
      console.log("Falling back to Gemini...");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      // ... (re-implement Gemini logic here if needed, but for now we throw)
    }
    
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
    console.error("Groq AI Chat Error:", error);
    throw new Error("AI Chat failed");
  }
};
