
import { GoogleGenAI } from "@google/genai";

export const getGeminiSuggestion = async (prompt: string): Promise<string> => {
  try {
    // Initializing the GenAI client with named parameter and direct environment variable access
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Calling generateContent directly with the model and prompt
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
