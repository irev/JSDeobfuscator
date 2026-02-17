
import { GoogleGenAI, Type } from "@google/genai";
import { DeobfuscationStep } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Fix: Use process.env.API_KEY directly without fallback as per @google/genai guidelines
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async processStep(step: DeobfuscationStep, code: string): Promise<string> {
    const modelName = 'gemini-3-pro-preview';
    let prompt = '';

    switch (step) {
      case DeobfuscationStep.DECOMPILE:
        prompt = `You are a World-Class Reverse Engineer. 
        TASK: DE-VIRTUALIZE AND DECOMPILE.
        The provided JavaScript is likely a Virtual Machine (VM) or complex interpreter-based obfuscation.
        1. Identify the bytecode array, the dispatcher, and the instruction set.
        2. Translate the operations back into human-readable high-level JavaScript logic.
        3. Remove the entire VM infrastructure.
        4. Focus on recovering the core intent (exfiltration, harvesting, etc.).
        
        CODE:
        ${code}`;
        break;

      case DeobfuscationStep.REFERENCE_RESOLVE:
        prompt = `Analyze the JavaScript code for proxy functions, string pools, and property masking.
        1. Inline all calculated string references.
        2. Resolve constant folding.
        3. Replace indirect function calls with their direct counterparts.
        Return ONLY the resolved ES6 code.
        
        CODE:
        ${code}`;
        break;

      case DeobfuscationStep.SEMANTIC_CLEANUP:
        prompt = `Perform a semantic refactor of this deobfuscated JavaScript:
        1. Identify the purpose of every function and variable.
        2. Rename them to descriptive names (e.g., 'sendCredentialsToTelegram', 'targetURL').
        3. Standardize the code structure using clean ES6+.
        Return ONLY the clean refactored code.
        
        CODE:
        ${code}`;
        break;

      case DeobfuscationStep.REFINE:
        prompt = `Final Polish for Forensic Review.
        1. Simplify control flows.
        2. Refine variable names based on technical flow.
        3. Ensure specific malicious endpoints (e.g., Telegram Bot API) are clearly visible and commented.
        
        CODE:
        ${code}`;
        break;

      case DeobfuscationStep.ANALYZE:
        prompt = `Perform a Digital Forensics (DFIR) analysis on this deobfuscated script.
        Produce a JSON response with these exact keys:
        - attackVector (string): Technical summary.
        - impacts (string array): List of harmful activities.
        - ioCs (array of {type, value, context}): Indicators with context.
        - flowDescription (string array): Ordered steps of execution.
        - threatLevel (string): "low", "medium", "high", or "critical".
        - detectionRules (array of {type: "YARA"|"Sigma", content: string, description: string}): Generate specific YARA/Sigma rules to detect THIS specific variant.
        - remediationSteps (string array): Steps for incident responders.

        CODE:
        ${code}`;
        break;

      default:
        return code;
    }

    // Fix: Use responseSchema for the ANALYZE step to ensure high-quality JSON output
    const response = await this.ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 8192 },
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

export const gemini = new GeminiService();
