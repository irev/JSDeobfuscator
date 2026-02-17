
import { GoogleGenAI, Type } from "@google/genai";
import { DeobfuscationStep } from "../types";
import { AIService, STEP_PROMPTS } from "./aiService";

export class GeminiService implements AIService {
  private ai: GoogleGenAI;
  public name: string;
  public id: string;
  private model: string;

  constructor(id: string, name: string, model: string) {
    this.ai = new GoogleGenAI({ apiKey: (process as any).env.API_KEY });
    this.id = id;
    this.name = name;
    this.model = model;
  }

  async processStep(step: DeobfuscationStep, code: string): Promise<string> {
    const prompt = STEP_PROMPTS[step] ? STEP_PROMPTS[step](code) : code;

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        thinkingConfig: this.model.includes('pro') ? { thinkingBudget: 8192 } : undefined,
        responseMimeType: step === DeobfuscationStep.ANALYZE ? "application/json" : "text/plain",
        responseSchema: step === DeobfuscationStep.ANALYZE ? {
          type: Type.OBJECT,
          properties: {
            attackVector: { type: Type.STRING },
            impacts: { type: Type.ARRAY, items: { type: Type.STRING } },
            ioCs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  value: { type: Type.STRING },
                  context: { type: Type.STRING }
                },
                required: ["type", "value"]
              }
            },
            flowDescription: { type: Type.ARRAY, items: { type: Type.STRING } },
            threatLevel: { type: Type.STRING },
            detectionRules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  content: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["type", "content", "description"]
              }
            },
            remediationSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["attackVector", "impacts", "ioCs", "flowDescription", "threatLevel", "detectionRules", "remediationSteps"]
        } : undefined
      }
    });

    return response.text || '';
  }
}
