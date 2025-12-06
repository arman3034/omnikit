import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// Use Vite's environment variable system
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is not set. Check your .env.production file.");
}

const ai = new GoogleGenAI({ apiKey });

export const summarizeText = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the following text concisely in one paragraph:\n\n${text}`,
      config: {
        temperature: 0.3,
      }
    });

    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating summary. Please try again later.";
  }
};