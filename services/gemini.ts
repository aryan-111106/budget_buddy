import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-3-flash-preview';

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: modelName,
    config: {
      systemInstruction: "You are BudgetBuddy, an intelligent, empathetic, and professional financial assistant. You help users track expenses, plan budgets, and find ways to save. The user's currency is Indian Rupee (₹). Keep answers concise, encouraging, and financially sound. If asked about specific user data, ask them to provide it or assume hypothetical scenarios if not provided.",
    },
  });
};

export const analyzeFinances = async (transactions: Transaction[]): Promise<string> => {
  const transactionData = transactions.map(t => 
    `${t.date}: ${t.description} (${t.category}) - ₹${t.amount} [${t.type}]`
  ).join('\n');

  const prompt = `
    Analyze the following financial transactions (Currency: INR ₹) and provide 3 brief, actionable insights to help the user save money or manage their budget better.
    Format the output as a simple list.
    
    Transactions:
    ${transactionData}
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    return response.text || "I couldn't generate insights at this moment.";
  } catch (error) {
    console.error("Error analyzing finances:", error);
    return "Sorry, I encountered an error analyzing your data.";
  }
};