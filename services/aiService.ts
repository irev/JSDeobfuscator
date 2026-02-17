
import { DeobfuscationStep } from "../types";

export interface AIService {
  name: string;
  id: string;
  processStep(step: DeobfuscationStep, code: string): Promise<string>;
}

export const STEP_PROMPTS = {
  [DeobfuscationStep.DECOMPILE]: (code: string) => `### ROLE: AUTOMATED REVERSE ENGINEERING KERNEL
### OBJECTIVE: VIRTUAL MACHINE DE-VIRTUALIZATION & INSTRUCTION RECOVERY

### MANDATORY CONSTRAINTS:
1. ZERO SPECULATION: Do not describe intent. Only reconstruct observable logic.
2. VM COMPONENT IDENTIFICATION: Explicitly locate the Bytecode Array, the Instruction Pointer (IP), the Dispatcher Loop, and the Opcode mapping logic.
3. TRANSFORMATION: 
   - Extract the mapping between Opcodes and their corresponding JavaScript handlers.
   - Re-emit the logic as linear JavaScript code, removing the interpreter overhead.
   - Preserve all data flow and state transitions exactly as they appear in the original handlers.
4. OUTPUT: Strictly valid ES6 JavaScript. No natural language explanation. No markdown blocks.

### INPUT SOURCE:
${code}`,
  
  [DeobfuscationStep.REFERENCE_RESOLVE]: (code: string) => `### ROLE: STATIC REFERENCE RESOLUTION MODULE
### OBJECTIVE: LITERAL EXPANSION & CONSTANT FOLDING

### MANDATORY CONSTRAINTS:
1. LITERAL REPLACEMENT: Resolve all 'obj[key]' or 'arr[idx]' expressions where key/idx is a constant literal or a resolvable string pool reference.
2. PROXY REMOVAL: Inline 'proxy functions' (functions that only return a result from another function or a string pool).
3. ARITHMETIC FOLDING: Simplify static arithmetic expressions (e.g., 0x1a + 0x2b).
4. STRING CONCATENATION: Merge split strings where they are joined by '+' operators into single string literals.
5. OUTPUT: Strictly valid ES6 JavaScript. No comments, no headers.

### INPUT SOURCE:
${code}`,

  [DeobfuscationStep.SEMANTIC_CLEANUP]: (code: string) => `### ROLE: FORENSIC SEMANTIC RECONSTRUCTION
### OBJECTIVE: EVIDENCE-BASED IDENTIFIER RECONSTRUCTION

### MANDATORY CONSTRAINTS:
1. NON-HALUCINATORY NAMING: Use names derived ONLY from observed API interactions. 
   - If a function calls 'fetch' to a specific URL, rename it to reflect that specific destination.
   - If a variable stores 'document.cookie', name it accordingly.
   - Do NOT use generic names like 'maliciousFunction' unless specific evidence confirms it.
2. CONTROL FLOW SIMPLIFICATION: Remove unreachable 'if(false)' blocks and empty 'try/catch' wrappers used for anti-analysis.
3. CODE MODERNIZATION: Convert indirect property access to dot notation where possible (e.g., window['location'] -> window.location).
4. OUTPUT: Strictly valid ES6 JavaScript.

### INPUT SOURCE:
${code}`,

  [DeobfuscationStep.REFINE]: (code: string) => `### ROLE: FORENSIC CODE ANNOTATOR
### OBJECTIVE: FINAL LOGIC POLISH & ANNOTATION

### MANDATORY CONSTRAINTS:
1. COMMENTARY: Add JSDoc-style comments to functions describing their inputs and outputs based on observed data flow.
2. IOC HIGHLIGHTING: Add '// [!] IOC' comments next to IP addresses, URLs, and File System operations.
3. DATA FLOW TRACING: Ensure variables that carry sensitive data (credentials, cookies, environment variables) are clearly traceable.
4. OUTPUT: Strictly valid ES6 JavaScript with forensic annotations.

### INPUT SOURCE:
${code}`,

  [DeobfuscationStep.ANALYZE]: (code: string) => `### ROLE: DFIR INTELLIGENCE AGENT
### OBJECTIVE: STRUCTURED MALWARE DISSECTION

### MANDATORY CONSTRAINTS:
1. IOC EXTRACTION: Extract every URL, IP, Domain, and Cryptographic Hash.
2. ATTACK CHAIN: Define the chronological execution flow from entry point to exfiltration.
3. DETECTION STRATEGY: 
   - Provide a YARA rule focusing on unique string constants or byte sequences.
   - Provide a Sigma rule for behavioral detection (e.g., suspicious fetch patterns).
4. JSON OUTPUT: You must respond ONLY with a valid JSON object matching the requested schema.

### INPUT SOURCE:
${code}`
};
