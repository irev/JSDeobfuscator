
export enum DeobfuscationStep {
  STABILIZE = 'STABILIZE',
  HEX_DECODE = 'HEX_DECODE',
  VM_LIFTING = 'VM_LIFTING',
  STRING_RESOLVE = 'STRING_RESOLVE',
  CLEANUP = 'CLEANUP',
  ANALYZE = 'ANALYZE'
}

export interface TransformationResult {
  step: DeobfuscationStep;
  content: string;
  description: string;
  status: 'success' | 'warning' | 'error';
  timestamp: number;
}

export interface AnalysisSummary {
  attackVector: string;
  impacts: string[];
  ioCs: { type: string; value: string }[];
  flowDescription: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}
