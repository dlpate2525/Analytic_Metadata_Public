import { GoogleGenAI } from "@google/genai";
import { Asset } from "../types";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const askGeminiAboutAsset = async (
  asset: Asset,
  userQuestion: string,
  history: { role: string; text: string }[]
): Promise<string> => {
  if (!apiKey) {
    return "Configuration Error: API Key is missing. Please check your environment variables.";
  }

  try {
    const model = 'gemini-2.5-flash';
    
    // Prepare context
    const context = `
      You are LENS AI, a specialized data steward assistant for an enterprise data catalog.
      
      CURRENT DATA SOURCE CONTEXT:
      ${JSON.stringify(asset, null, 2)}
      
      INSTRUCTIONS:
      1. Answer the user's question based strictly on the metadata provided above.
      2. If the user asks about downstream impact, refer to the lineage.
      3. If the user asks about trust/quality, refer to the governance and quality history.
      4. Be concise, professional, and helpful. 
      5. If the answer isn't in the metadata, state that clearly.
      
      USER QUESTION:
      ${userQuestion}
    `;

    const response = await ai.models.generateContent({
      model,
      contents: context, // Simplified for this interaction, usually we'd pass history as distinct messages
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered an error while processing your request. Please try again later.";
  }
};