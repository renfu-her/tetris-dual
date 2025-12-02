import { GoogleGenAI } from "@google/genai";

// Initialize AI only if key exists to avoid crash, but handle safely in calls
const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
}

export const getGameSummary = async (score: number, lines: number, mode: string): Promise<string> => {
  if (!ai) return "Great game! (AI functionality unavailable without API Key)";

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a high-energy esports commentator for a Tetris game.
      The player just finished a game in ${mode} mode.
      Score: ${score}.
      Lines Cleared: ${lines}.
      
      Give a very short (max 15 words), witty, or encouraging comment about their performance.
      If the score is low (<1000), be gently roasting but encouraging.
      If high (>5000), be amazed.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Game Over!";
  } catch (error) {
    console.error("Error fetching AI summary:", error);
    return "Game Over!";
  }
};