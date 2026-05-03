import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get personalized study recommendations based on user's branch and semester
 */
export const getStudyRecommendations = async (user, papers) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

      Keep the tone professional, encouraging, and grayscale-themed (metaphorically). 
      Format the response in structured JSON:
      {
        "summary": "Short overview",
        "toughSubjects": ["Subject 1", "Subject 2"],
        "strategy": "The reasoning strategy",
        "tips": ["Tip 1", "Tip 2", "Tip 3"],
        "priorityPapers": ["Paper Code 1", "Paper Code 2"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the markdown response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response" };
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw new Error("AI Reasoning Engine failed to generate response");
  }
};

/**
 * General chat with the AI about DCRUST exams
 */
export const chatWithAI = async (message, context = "") => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are "DCRUST Exam Sage", a helpful AI specialized in Deenbandhu Chhotu Ram University of Science and Technology (DCRUST) exams.
      
      Context: ${context}
      User Message: ${message}
      
      Instructions:
      - Answer based on your knowledge of Engineering curriculum and DCRUST patterns.
      - If you don't know something specific about DCRUST, give general engineering advice.
      - Be concise, helpful, and premium in your tone.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini AI Chat Error:", error);
    throw new Error("AI Chat failed");
  }
};
