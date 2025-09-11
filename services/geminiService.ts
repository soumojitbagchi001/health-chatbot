import { GoogleGenAI, Chat } from '@google/genai';

// IMPORTANT: Do NOT expose your API key in client-side code.
// This is a placeholder and should be handled via a secure backend proxy in a real application.
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("API key not found. Please set the GEMINI_API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: 'You are a friendly and helpful chatbot designed to assist students with their questions. Provide clear, concise, and accurate answers. Be encouraging and supportive.',
    },
  });
};