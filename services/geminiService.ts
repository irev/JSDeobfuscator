
import { GoogleGenAI, Type } from "@google/genai";
import { DeobfuscationStep } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async processStep(step: DeobfuscationStep, code: string, context?: string): Promise<string> {
    const modelName = 'gemini-3-pro-preview';
    let prompt = '';

    switch (step) {
      case DeobfuscationStep.VM_LIFTING:
        prompt = `You are a Senior Malware Researcher. The provided JavaScript code is an obfuscated Virtual Machine (VM). 
        1. Identify the 'bytecode' array (usually a large array of base64 strings or numbers).
        2. Identify the 'interpreter' loop and the 'opcode' mapping.
        3. DECOMPILE the bytecode back into human-readable ES6 logic. 
        4. Do NOT return the interpreter code. Return ONLY the decompiled logic.
        
        CODE TO ANALYZE:
        ${code}`;
        break;

      case DeobfuscationStep.STRING_RESOLVE:
        prompt = `Analyze this code and replace all string pool lookups (e.g., ax[0x12], S['30'], or resolver functions) with their literal string values. 
        Calculate any simple arithmetic offsets used for indexing. 
        Return ONLY the updated ES6 code.
        
        CODE:
        ${code}`;
        break;

      case DeobfuscationStep.CLEANUP:
        prompt = `Refactor the following decompiled JavaScript to make it professional and readable:
        1. Rename variables from obfuscated names (a1, _0xabc) to meaningful names based on their usage (e.g., 'sendToTelegram', 'getCookie', 'victimIP').
        2. Ensure all logic blocks are clear and use modern ES6 (async/await, arrow functions).
        3. Remove any remaining 'anti-debug' or 'dead code'.
        4. If you see Telegram Bot API calls or Phishing logic, highlight the flow clearly.
        
        Return ONLY the clean ES6 code.
        
        CODE:
        ${code}`;
        break;

      case DeobfuscationStep.ANALYZE:
        prompt = `Analyze this finalized deobfuscated JavaScript for Digital Forensics (DFIR).
        Produce a JSON report with:
        - attackVector: Summarize how the attack works.
        - impacts: List what the script steals or modifies.
        - ioCs: Extract URLs, IPs, API Tokens, or Domain names.
        - flowDescription: A step-by-step technical reconstruction of the execution.
        - threatLevel: "low", "medium", "high", or "critical".

        CODE:
        ${code}`;
        break;

      default:
        return code;
    }

    const response = await this.ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 8192 }, // High budget for bytecode lifting
        responseMimeType: step === DeobfuscationStep.ANALYZE ? "application/json" : "text/plain"
      }
    });

    return response.text || '';
  }
}

export const gemini = new GeminiService();
