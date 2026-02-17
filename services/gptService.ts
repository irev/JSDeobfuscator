
import { DeobfuscationStep } from "../types";
import { AIService, STEP_PROMPTS } from "./aiService";

export class GptService implements AIService {
  public name = "GPT-4o";
  public id = "gpt-4o";
  private apiKey = (process as any).env.OPENAI_API_KEY;

  async processStep(step: DeobfuscationStep, code: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenAI API Key not configured in environment.");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert Malware Analyst and Reverse Engineer." },
          { role: "user", content: STEP_PROMPTS[step](code) }
        ],
        response_format: step === DeobfuscationStep.ANALYZE ? { type: "json_object" } : { type: "text" },
        temperature: 0.1
      })
    });

    const data = await response.json();
    return data.choices[0].message.content || '';
  }
}
