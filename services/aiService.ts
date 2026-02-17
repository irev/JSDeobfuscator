
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
1. NON-HALUCINATORY NAMING: Use names derived ONLY from observed API interactions (e.g., fetch, XMLHttpRequest, Telegram API).
2. CONTROL FLOW SIMPLIFICATION: Remove unreachable code used for anti-analysis.
3. CODE MODERNIZATION: Convert indirect property access to dot notation.
4. OUTPUT: Strictly valid ES6 JavaScript.

### INPUT SOURCE:
${code}`,

  [DeobfuscationStep.REFINE]: (code: string) => `### ROLE: FORENSIC CODE ANNOTATOR
### OBJECTIVE: FINAL LOGIC POLISH & ANNOTATION

### MANDATORY CONSTRAINTS:
1. COMMENTARY: Add JSDoc-style comments to functions describing their inputs and outputs.
2. IOC HIGHLIGHTING: Add '// [!] IOC' comments next to IP addresses, URLs, and File System operations.
3. OUTPUT: Strictly valid ES6 JavaScript with forensic annotations.

### INPUT SOURCE:
${code}`,

  [DeobfuscationStep.ANALYZE]: (code: string) => `### ROLE: DFIR INTELLIGENCE AGENT
### OBJECTIVE: STRUCTURED MALWARE DISSECTION & KIT CLASSIFICATION

### MANDATORY CONSTRAINTS:
1. KIT CLASSIFICATION: Identify the malware family or kit name based on variable patterns (e.g., r3xdev, Jigsaw, etc.).
2. IOC EXTRACTION: Extract every URL, IP, Domain, and Cryptographic Hash.
3. ATTACK CHAIN: Define the chronological execution flow.
4. DETECTION STRATEGY: 
   - Provide a YARA rule for static detection.
   - Provide a Sigma or IDS rule for behavioral network detection.
5. JSON OUTPUT: Respond ONLY with a valid JSON object matching the schema.

### INPUT SOURCE:
${code}`
};
