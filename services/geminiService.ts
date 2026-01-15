
import { GoogleGenAI } from "@google/genai";

// Fix: Always use process.env.API_KEY directly for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async generateSermonOutline(theme: string) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a detailed sermon outline for a church in Liberia. Theme: ${theme}. 
      Include: Scripture references, 3 main points, and a closing prayer. 
      Tailor the tone to Living Faith Champions' Assembly (LFCA).`,
    });
    return response.text;
  },

  async generateAnnouncement(eventDetails: string) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Draft a professional church announcement based on these details: ${eventDetails}. 
      Make it suitable for social media and Sunday service announcements.`,
    });
    return response.text;
  },

  async summarizeFinances(data: any) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this church financial data and provide a summary of trends and recommendations for the leadership: ${JSON.stringify(data)}`,
    });
    return response.text;
  },

  async chatAssistant(query: string, context: string) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful Church Administrator Assistant for LFCA in Liberia. 
      Current Context: ${context}
      User Query: ${query}`,
    });
    return response.text;
  }
};
