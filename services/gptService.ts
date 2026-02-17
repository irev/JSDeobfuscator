
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
          { role: "system", content: "You are an automated forensic deobfuscator. Your output must be deterministic and strictly follow instructions." },
          { role: "user", content: STEP_PROMPTS[step](code) }
        ],
        response_format: step === DeobfuscationStep.ANALYZE ? { type: "json_object" } : { type: "text" },
        // Set temperature to 0 for maximum determinism
        temperature: 0,
        top_p: 1
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    let text = data.choices[0].message.content || '';
    
    // Cleanup markdown wrapping for non-JSON steps
    if (step !== DeobfuscationStep.ANALYZE) {
      text = text.replace(/```javascript/g, '').replace(/```js/g, '').replace(/```/g, '').trim();
    }
    
    return text;
  }
}
