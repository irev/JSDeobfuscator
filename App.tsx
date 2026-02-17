
import React, { useState, useEffect } from 'react';
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
  LayoutGrid
} from 'lucide-react';

const App: React.FC = () => {
  const [inputCode, setInputCode] = useState<string>('');
  const [history, setHistory] = useState<TransformationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'report'>('editor');

  const steps = [
    { type: DeobfuscationStep.STABILIZE, label: 'Stabilize & Beautify' },
    { type: DeobfuscationStep.HEX_DECODE, label: 'Decode Hex Escapes' },
    { type: DeobfuscationStep.VM_LIFTING, label: 'Decompile Bytecode (VM Lift)' },
    { type: DeobfuscationStep.STRING_RESOLVE, label: 'Inline String Pool' },
    { type: DeobfuscationStep.CLEANUP, label: 'ES6 Refactoring & Naming' },
    { type: DeobfuscationStep.ANALYZE, label: 'Forensic Analysis' }
  ];

  const getCurrentCode = () => {
    if (history.length === 0) return inputCode;
    // Get the latest code from history that isn't the Analysis step
    const codeSteps = history.filter(h => h.step !== DeobfuscationStep.ANALYZE);
    return codeSteps.length > 0 ? codeSteps[codeSteps.length - 1].content : '';
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
          description = 'Structural normalization complete.';
        } else if (step.type === DeobfuscationStep.HEX_DECODE) {
          result = decodeHexEscapes(workingCode);
          description = 'Static hex characters converted.';
        } else {
          result = await gemini.processStep(step.type, workingCode);
          description = `AI process completed for ${step.label}.`;
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
          description: 'Step failed or timed out.',
          status: 'error',
          timestamp: Date.now()
        }]);
        break; // Stop pipeline on error
      }
    }
    setIsProcessing(false);
    setActiveStepIndex(-1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c] text-slate-300">
      {/* Top Bar */}
      <nav className="h-14 border-b border-white/5 bg-[#0d0d0f] flex items-center px-6 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="font-bold tracking-tighter text-white text-lg">DFIR<span className="text-blue-500">LAB</span></span>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Bytecode Decompiler v4.0</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1 text-xs rounded-md transition-all flex items-center gap-2 ${viewMode === 'editor' ? 'bg-blue-600 text-white shadow-lg' : 'hover:text-white'}`}
            >
              <Code2 className="w-3 h-3" /> Workbench
            </button>
            <button 
              disabled={!analysis}
              onClick={() => setViewMode('report')}
              className={`px-3 py-1 text-xs rounded-md transition-all flex items-center gap-2 ${!analysis ? 'opacity-30' : viewMode === 'report' ? 'bg-blue-600 text-white shadow-lg' : 'hover:text-white'}`}
            >
              <FileSearch className="w-3 h-3" /> Intelligence
            </button>
          </div>
          
          <button
            onClick={runPipeline}
            disabled={isProcessing || !inputCode}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 border ${
              isProcessing ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-blue-600 border-blue-400/50 text-white hover:bg-blue-500 shadow-lg'
            }`}
          >
            {isProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
            {isProcessing ? 'DECOMPILING...' : 'START ANALYSIS'}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Progress */}
        <aside className="w-80 border-r border-white/5 bg-[#0d0d0f] flex flex-col">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <Workflow className="w-3 h-3 text-blue-500" /> Pipeline Status
            </h2>
            {history.length > 0 && (
              <button onClick={() => { setHistory([]); setInputCode(''); setAnalysis(null); }} className="text-[10px] text-red-400 hover:underline">Reset</button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {steps.map((step, idx) => {
              const res = history.find(h => h.step === step.type);
              const isActive = activeStepIndex === idx;
              return (
                <div key={idx} className={`relative pl-8 pb-4 border-l-2 transition-all ${
                  res ? 'border-blue-500/50' : isActive ? 'border-blue-500 animate-pulse' : 'border-white/5'
                }`}>
                  <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-[#0a0a0c] ${
                    res ? 'border-blue-500 text-blue-500' : isActive ? 'border-blue-400 text-blue-400 scale-110 shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'border-white/10 text-slate-600'
                  }`}>
                    {res ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-[9px] font-bold">{idx + 1}</span>}
                  </div>
                  <h3 className={`text-xs font-bold mb-1 ${isActive ? 'text-blue-400' : res ? 'text-slate-200' : 'text-slate-600'}`}>
                    {step.label}
                  </h3>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {isActive ? 'Processing Bytecode...' : res ? res.description : 'Pending upstream...'}
                  </p>
                </div>
              );
            })}
          </div>

          {analysis && (
            <div className="p-4 bg-red-500/5 border-t border-red-500/20">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Threat Detected</span>
              </div>
              <p className="text-[11px] text-slate-400 italic">"Logic patterns suggest credential harvesting via Telegram API."</p>
            </div>
          )}
        </aside>

        {/* Editor / Content Area */}
        <main className="flex-1 bg-[#0a0a0c] relative">
          {viewMode === 'editor' ? (
            <div className="h-full grid grid-cols-2 gap-px bg-white/5">
              <CodeEditor 
                label="Source Payload" 
                value={inputCode} 
                onChange={setInputCode} 
              />
              <CodeEditor 
                label="Decompiled ES6 (Recovered)" 
                value={getCurrentCode()} 
                readOnly 
              />
            </div>
          ) : analysis ? (
            <div className="h-full overflow-y-auto p-12 bg-[#0a0a0c]">
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="flex justify-between items-start border-b border-white/10 pb-8">
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">Technical Intelligence Report</h1>
                    <p className="text-slate-500 font-mono text-sm">Incident Ref: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                  </div>
                  <div className={`px-4 py-2 rounded border font-bold text-xs uppercase tracking-widest ${
                    analysis.threatLevel === 'critical' ? 'bg-red-500/20 border-red-500 text-red-500' : 
                    analysis.threatLevel === 'high' ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'bg-blue-500/20 border-blue-500 text-blue-500'
                  }`}>
                    {analysis.threatLevel} Severity
                  </div>
                </div>

                <section className="grid grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2">
                      <LayoutGrid className="w-3 h-3" /> Attack Vector
                    </h2>
                    <p className="text-slate-300 text-sm leading-relaxed bg-white/5 p-6 rounded-xl border border-white/5 shadow-inner">
                      {analysis.attackVector}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                      <ShieldAlert className="w-3 h-3" /> Identified Impacts
                    </h2>
                    <div className="space-y-2">
                      {analysis.impacts.map((imp, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg text-sm text-slate-400 border border-white/5">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {imp}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-xs font-bold text-green-500 uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-3 h-3" /> Forensic Indicators (IoC)
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    {analysis.ioCs.map((ioc, i) => (
                      <div key={i} className="p-4 bg-[#0d0d0f] rounded-lg border border-white/5 flex flex-col gap-2 group hover:border-blue-500/50 transition-colors">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{ioc.type}</span>
                        <code className="text-xs text-blue-400 truncate">{ioc.value}</code>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-xs font-bold text-purple-500 uppercase tracking-widest flex items-center gap-2">
                    <History className="w-3 h-3" /> Reconstructed Execution Flow
                  </h2>
                  <div className="bg-[#0d0d0f] p-8 rounded-2xl border border-white/5 font-mono text-xs leading-loose space-y-4 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/20" />
                    {analysis.flowDescription.split('\n').map((line, i) => (
                      <div key={i} className="flex gap-4 group">
                        <span className="text-slate-700 select-none">[{i + 1}]</span>
                        <p className="text-slate-400 group-hover:text-slate-200 transition-colors">{line}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          ) : (
             <div className="h-full flex items-center justify-center text-slate-700 flex-col gap-4">
                <LayoutGrid className="w-12 h-12 opacity-10" />
                <p className="text-xs font-mono uppercase tracking-widest animate-pulse">Awaiting Payload for forensic ingestion...</p>
             </div>
          )}
        </main>
      </div>

      {/* Footer / Logs */}
      <footer className="h-8 border-t border-white/5 bg-[#0d0d0f] px-6 flex items-center justify-between text-[9px] font-mono text-slate-500">
        <div className="flex gap-6">
          <span>SANDBOX_ID: {Math.random().toString(16).substring(2, 10).toUpperCase()}</span>
          <span>KERNEL: v1.0.0-DECOMPILER</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          SYSTEMS_ONLINE_SSL_ENCRYPTED
        </div>
      </footer>
    </div>
  );
};

export default App;
