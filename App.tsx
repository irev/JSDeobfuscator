
import React, { useState } from 'react';
import { DeobfuscationStep, TransformationResult, AnalysisSummary } from './types';
import { gemini } from './services/geminiService';
import { stabilizeCode, decodeHexEscapes } from './utils/deobfuscationLogic';
import { CodeEditor } from './components/CodeEditor';
import { 
  ShieldAlert, 
  Terminal, 
  Workflow, 
  Play, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  History,
  FileSearch,
  Code2,
  RefreshCw,
  LayoutGrid,
  Sparkles,
  Download,
  Trash2,
  FileText,
  ShieldCheck,
  SearchCode,
  Printer,
  Bug
} from 'lucide-react';

const App: React.FC = () => {
  const [inputCode, setInputCode] = useState<string>('');
  const [history, setHistory] = useState<TransformationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'report'>('editor');

  const steps = [
    { type: DeobfuscationStep.STABILIZE, label: 'Normalize Structure' },
    { type: DeobfuscationStep.LITERAL_DECODE, label: 'Static Literal Decoding' },
    { type: DeobfuscationStep.DECOMPILE, label: 'VM / Bytecode Decompilation' },
    { type: DeobfuscationStep.REFERENCE_RESOLVE, label: 'Reference Pool Inlining' },
    { type: DeobfuscationStep.SEMANTIC_CLEANUP, label: 'Semantic Reconstruction' },
    { type: DeobfuscationStep.ANALYZE, label: 'Forensic Intelligence' }
  ];

  const getCurrentCode = () => {
    if (history.length === 0) return '';
    const codeSteps = history.filter(h => h.step !== DeobfuscationStep.ANALYZE);
    return codeSteps.length > 0 ? codeSteps[codeSteps.length - 1].content : '';
  };

  const handleRefine = async () => {
    const code = getCurrentCode();
    if (!code || isProcessing) return;
    setIsProcessing(true);
    try {
      const refined = await gemini.processStep(DeobfuscationStep.REFINE, code);
      setHistory(prev => [...prev, {
        step: DeobfuscationStep.REFINE,
        content: refined,
        description: 'Iterative logic refinement complete.',
        status: 'success',
        timestamp: Date.now()
      }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    const code = getCurrentCode();
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recovered_payload_${Date.now()}.js`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  const runPipeline = async () => {
    if (!inputCode) return;
    setIsProcessing(true);
    setHistory([]);
    setAnalysis(null);
    setViewMode('editor');
    
    let workingCode = inputCode;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setActiveStepIndex(i);
      
      try {
        let result: string = '';
        let description = '';

        if (step.type === DeobfuscationStep.STABILIZE) {
          result = stabilizeCode(workingCode);
          description = 'Normalized indentation and braces.';
        } else if (step.type === DeobfuscationStep.LITERAL_DECODE) {
          result = decodeHexEscapes(workingCode);
          description = 'Static literals recovered.';
        } else {
          result = await gemini.processStep(step.type, workingCode);
          description = `Process successful for ${step.label}.`;
        }

        if (step.type === DeobfuscationStep.ANALYZE) {
          try {
            setAnalysis(JSON.parse(result));
            setViewMode('report');
          } catch (e) {
            console.error("Analysis JSON parse failed", result);
          }
        } else {
          workingCode = result || workingCode;
          setHistory(prev => [...prev, {
            step: step.type,
            content: workingCode,
            description,
            status: 'success',
            timestamp: Date.now()
          }]);
        }
      } catch (error) {
        setHistory(prev => [...prev, {
          step: step.type,
          content: workingCode,
          description: 'Step interrupted by execution error.',
          status: 'error',
          timestamp: Date.now()
        }]);
        break;
      }
    }
    setIsProcessing(false);
    setActiveStepIndex(-1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c] text-slate-300 select-none print:bg-white print:text-black">
      {/* Universal Header */}
      <nav className="h-14 border-b border-white/5 bg-[#0d0d0f] flex items-center px-6 justify-between sticky top-0 z-50 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tighter text-white text-lg leading-none italic">DFIR <span className="text-blue-500">ENGINE</span></span>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">Behavioral Decompiler & Rule Gen</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded border border-white/10">
            <button 
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1 text-xs rounded transition-all flex items-center gap-2 ${viewMode === 'editor' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Code2 className="w-3.5 h-3.5" /> Workbench
            </button>
            <button 
              disabled={!analysis}
              onClick={() => setViewMode('report')}
              className={`px-3 py-1 text-xs rounded transition-all flex items-center gap-2 ${!analysis ? 'opacity-20 cursor-not-allowed' : viewMode === 'report' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <FileSearch className="w-3.5 h-3.5" /> Intelligence
            </button>
          </div>
          
          <button
            onClick={runPipeline}
            disabled={isProcessing || !inputCode}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2 border tracking-wider ${
              isProcessing ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-blue-600 border-blue-400/50 text-white hover:bg-blue-500 shadow-lg'
            }`}
          >
            {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isProcessing ? 'EXTRACTING...' : 'RUN PIPELINE'}
          </button>
        </div>
      </nav>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Progress Sidebar */}
        <aside className="w-72 border-r border-white/5 bg-[#0d0d0f] flex flex-col shrink-0 print:hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <Workflow className="w-3.5 h-3.5 text-blue-500" /> Pipeline Status
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => { setHistory([]); setInputCode(''); setAnalysis(null); }} 
                className="p-1 hover:text-red-400 transition-colors"
                title="Clear Workspace"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {steps.map((step, idx) => {
              const res = history.find(h => h.step === step.type);
              const isActive = activeStepIndex === idx;
              return (
                <div key={idx} className={`relative pl-7 pb-4 border-l transition-all ${
                  res ? 'border-blue-500/50' : isActive ? 'border-blue-500' : 'border-white/5'
                }`}>
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    res ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : isActive ? 'bg-blue-500 border-blue-400 animate-pulse scale-110' : 'bg-[#0a0a0c] border-white/10 text-slate-700'
                  }`}>
                    {res ? <CheckCircle2 className="w-2.5 h-2.5" /> : <span className="text-[9px] font-bold">{idx + 1}</span>}
                  </div>
                  <h3 className={`text-[11px] font-bold uppercase tracking-wide ${isActive ? 'text-blue-400' : res ? 'text-slate-200' : 'text-slate-600'}`}>
                    {step.label}
                  </h3>
                  <p className="text-[9px] text-slate-500 mt-1 leading-tight">
                    {isActive ? 'AI reasoning active...' : res ? res.description : 'Awaiting initialization'}
                  </p>
                </div>
              );
            })}
          </div>

          {getCurrentCode() && (
            <div className="p-4 border-t border-white/5 space-y-2 bg-white/[0.01]">
               <button 
                onClick={handleRefine}
                disabled={isProcessing}
                className="w-full py-2 bg-purple-600/20 border border-purple-500/30 rounded text-[10px] font-bold text-purple-400 hover:bg-purple-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3 h-3" /> Deep Polish
              </button>
              <button 
                onClick={downloadResult}
                className="w-full py-2 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-400 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-3 h-3" /> Download JS
              </button>
            </div>
          )}
        </aside>

        {/* Dynamic Display */}
        <main className="flex-1 bg-[#050507] relative overflow-hidden print:bg-white print:overflow-visible">
          {viewMode === 'editor' ? (
            <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/5 print:hidden">
              <CodeEditor 
                label="Forensic Ingestion" 
                value={inputCode} 
                onChange={setInputCode} 
              />
              <CodeEditor 
                label="De-Virtualized Workspace" 
                value={getCurrentCode()} 
                readOnly 
              />
            </div>
          ) : analysis ? (
            <div className="h-full overflow-y-auto p-12 lg:p-16 scrollbar-thin scrollbar-thumb-slate-800 print:p-0 print:overflow-visible">
              <div className="max-w-4xl mx-auto space-y-12 pb-20 print:space-y-8">
                <header className="flex justify-between items-end border-b border-white/10 pb-8 print:border-black">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-[0.3em] print:text-blue-700">
                      <ShieldCheck className="w-4 h-4" /> Cyber Intelligence Brief
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase print:text-black">Forensic Dissection</h1>
                    <p className="text-[10px] font-mono text-slate-500">INCIDENT_HASH: {Math.random().toString(36).substring(2).toUpperCase()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3 print:hidden">
                    <div className={`px-5 py-1.5 rounded-full border font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl ${
                      analysis.threatLevel === 'critical' ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 
                      analysis.threatLevel === 'high' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-blue-500/10 border-blue-500 text-blue-500'
                    }`}>
                      {analysis.threatLevel} SEVERITY
                    </div>
                    <button 
                      onClick={printReport}
                      className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-white bg-white/5 px-3 py-1.5 rounded border border-white/10"
                    >
                      <Printer className="w-3 h-3" /> Save as PDF
                    </button>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <section className="space-y-4">
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 print:text-black">
                      <LayoutGrid className="w-3.5 h-3.5 text-blue-500" /> Attack Mechanics
                    </h2>
                    <p className="text-slate-300 text-sm leading-relaxed bg-white/[0.02] p-6 rounded-xl border border-white/5 print:bg-slate-50 print:text-black print:border-slate-200">
                      {analysis.attackVector}
                    </p>
                  </section>
                  <section className="space-y-4">
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 print:text-black">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Key Impacts
                    </h2>
                    <div className="grid grid-cols-1 gap-2">
                      {analysis.impacts.map((impact, i) => (
                        <div key={i} className="p-3 bg-red-500/5 rounded-lg border border-red-500/10 text-xs font-medium text-slate-400 flex items-center gap-3 print:bg-white print:border-slate-200 print:text-black">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                          {impact}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <section className="space-y-4">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 print:text-black">
                    <History className="w-3.5 h-3.5 text-purple-500" /> Reconstructed Attack Flow
                  </h2>
                  <div className="space-y-3 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-white/5 print:before:bg-slate-200">
                    {analysis.flowDescription.map((step, i) => (
                      <div key={i} className="flex gap-4 items-start relative group">
                        <div className="w-10 h-10 rounded-lg bg-[#0d0d0f] border border-white/5 flex items-center justify-center text-[10px] font-mono text-slate-500 font-bold shrink-0 z-10 group-hover:border-blue-500/50 transition-colors print:bg-slate-100 print:border-slate-300">
                          {i + 1}
                        </div>
                        <div className="flex-1 pt-2 text-sm text-slate-400 leading-relaxed print:text-black">
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 print:text-black">
                    <SearchCode className="w-3.5 h-3.5 text-green-500" /> Extracted Indicators (IOC)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysis.ioCs.map((ioc, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-1.5 print:bg-white print:border-slate-300">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-black text-green-500/70 uppercase tracking-widest">{ioc.type}</span>
                          {ioc.context && <span className="text-[8px] text-slate-600 uppercase">{ioc.context}</span>}
                        </div>
                        <code className="text-xs text-blue-400 truncate print:text-blue-800">{ioc.value}</code>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 print:text-black">
                    <Bug className="w-3.5 h-3.5 text-orange-500" /> Detection Rules (YARA/Sigma)
                  </h2>
                  <div className="space-y-6">
                    {analysis.detectionRules.map((rule, i) => (
                      <div key={i} className="bg-[#08080a] rounded-2xl border border-white/5 overflow-hidden print:border-slate-300">
                        <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                          <span className="text-[9px] font-black text-orange-500 tracking-[0.2em]">{rule.type} SPECIFICATION</span>
                        </div>
                        <div className="p-6">
                           <p className="text-[10px] text-slate-500 mb-4 italic">"{rule.description}"</p>
                           <pre className="text-xs text-slate-400 font-mono leading-relaxed overflow-x-auto p-4 bg-black/40 rounded-lg print:bg-slate-50 print:text-black whitespace-pre-wrap">
                            {rule.content}
                           </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                
                <section className="space-y-4">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 print:text-black">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Response & Remediation
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {analysis.remediationSteps.map((step, i) => (
                      <div key={i} className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 text-xs text-slate-400 flex gap-3 print:bg-white print:border-slate-300 print:text-black">
                        <span className="font-bold text-blue-500">{i+1}.</span>
                        {step}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-800 gap-6 opacity-30">
               <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse rounded-full" />
                  <SearchCode className="w-20 h-20 relative animate-pulse" />
               </div>
               <div className="text-center">
                 <p className="text-[10px] font-bold uppercase tracking-[0.5em]">Forensic Kernel v4.2</p>
                 <p className="text-xs">Awaiting binary ingestion for behavioral profiling</p>
               </div>
            </div>
          )}
        </main>
      </div>

      {/* Terminal UI Styles for Print */}
      <style>{`
        @media print {
          @page { margin: 2cm; }
          body { background: white !important; }
          .print-hidden { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
          pre { white-space: pre-wrap !important; word-break: break-all !important; border: 1px solid #ccc !important; }
          .rounded-xl, .rounded-2xl, .rounded-3xl { border-radius: 0 !important; border: 1px solid #eee !important; }
        }
      `}</style>
    </div>
  );
};

export default App;
