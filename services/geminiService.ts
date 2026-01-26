
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const getGeminiSuggestion = async (prompt: string): Promise<string> => {
  if (!API_KEY) return "API-nyckel saknas. Kontrollera miljövariabler.";
  
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Du är en expertpedagog och lärarassistent. Svara kortfattat, kreativt och inspirerande på svenska. Fokusera på praktiska aktiviteter för klassrummet.",
        temperature: 0.7,
      },
    });

    return response.text || "Jag kunde inte generera ett svar just nu.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ett fel uppstod vid kontakt med AI-tjänsten.";
  }
};
