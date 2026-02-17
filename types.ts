
export enum DeobfuscationStep {
  STABILIZE = 'STABILIZE',
  LITERAL_DECODE = 'LITERAL_DECODE',
  DECOMPILE = 'DECOMPILE',
  REFERENCE_RESOLVE = 'REFERENCE_RESOLVE',
  SEMANTIC_CLEANUP = 'SEMANTIC_CLEANUP',
  REFINE = 'REFINE',
  ANALYZE = 'ANALYZE'
}

export interface TransformationResult {
  step: DeobfuscationStep;
  content: string;
  description: string;
  status: 'success' | 'warning' | 'error';
  timestamp: number;
}

export interface DetectionRule {
  type: 'YARA' | 'Sigma' | 'IDS';
  content: string;
  description: string;
}

export interface AnalysisSummary {
  classification: {
    kitName: string;
    confidence: number;
    family: string;
  };
  attackVector: string;
  impacts: string[];
  ioCs: { type: string; value: string; context?: string }[];
  flowDescription: string[];
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  detectionRules: DetectionRule[];
  remediationSteps: string[];
}
