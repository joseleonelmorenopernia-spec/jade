
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const generateAnniversaryMessage = async () => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Escribe un mensaje corto, romántico y muy especial para un aniversario mensual. Que sea tierno, original y en español. Máximo 20 palabras.",
      config: {
        temperature: 0.9,
      }
    });
    return response.text || "¡Feliz aniversario, mi amor! ❤️ Cada mes a tu lado es un regalo.";
  } catch (error) {
    return "¡Feliz aniversario! ❤️ Un mes más de felicidad juntos.";
  }
};
