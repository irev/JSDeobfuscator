
import { DeobfuscationStep } from "../types";

export interface AIService {
  name: string;
  id: string;
  processStep(step: DeobfuscationStep, code: string): Promise<string>;
}

export const STEP_PROMPTS = {
  [DeobfuscationStep.DECOMPILE]: (code: string) => `You are a World-Class Reverse Engineer. 
        TASK: DE-VIRTUALIZE AND DECOMPILE.
        The provided JavaScript is likely a Virtual Machine (VM) or complex interpreter-based obfuscation.
        1. Identify the bytecode array, the dispatcher, and the instruction set.
        2. Translate the operations back into human-readable high-level JavaScript logic.
        3. Remove the entire VM infrastructure.
        4. Focus on recovering the core intent.
        
        CODE:
        ${code}`,
  
  [DeobfuscationStep.REFERENCE_RESOLVE]: (code: string) => `Analyze the JavaScript code for proxy functions, string pools, and property masking.
        1. Inline all calculated string references.
        2. Resolve constant folding.
        3. Replace indirect function calls with their direct counterparts.
        Return ONLY the resolved ES6 code.
        
        CODE:
        ${code}`,

  [DeobfuscationStep.SEMANTIC_CLEANUP]: (code: string) => `Perform a semantic refactor of this deobfuscated JavaScript:
        1. Identify the purpose of every function and variable.
        2. Rename them to descriptive names (e.g., 'sendCredentialsToTelegram', 'targetURL').
        3. Standardize the code structure using clean ES6+.
        Return ONLY the clean refactored code.
        
        CODE:
        ${code}`,

  [DeobfuscationStep.REFINE]: (code: string) => `Final Polish for Forensic Review.
        1. Simplify control flows.
        2. Refine variable names based on technical flow.
        3. Ensure specific malicious endpoints are clearly visible and commented.
        
        CODE:
        ${code}`,

  [DeobfuscationStep.ANALYZE]: (code: string) => `Perform a deep Digital Forensics (DFIR) analysis on this deobfuscated script.
        Identify all Indicators of Compromise (IoC), Attack Vectors, and Execution Flows.
        Produce a JSON response with: attackVector, impacts, ioCs, flowDescription, threatLevel, detectionRules, remediationSteps.
        
        CODE:
        ${code}`
};
