
import { AIService } from "./aiService";
import { GeminiService } from "./geminiService";
import { GptService } from "./gptService";

const services: Record<string, AIService> = {
  'gemini-pro': new GeminiService('gemini-pro', 'Gemini 3 Pro', 'gemini-3-pro-preview'),
  'gemini-flash': new GeminiService('gemini-flash', 'Gemini 3 Flash', 'gemini-3-flash-preview'),
  'gpt-4o': new GptService()
};

let activeId = 'gemini-pro';

export const aiFactory = {
  getAvailableServices: () => Object.values(services),
  getActiveService: () => services[activeId],
  setActiveService: (id: string) => {
    if (services[id]) activeId = id;
  },
  getActiveId: () => activeId
};
