
import React, { ReactNode } from 'react';

interface CodeEditorProps {
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  label: string;
  actions?: ReactNode;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, readOnly = false, label, actions }) => {
  return (
    <div className="flex flex-col h-full bg-[#0d0d0f] border-x border-white/5 overflow-hidden group">
      <div className="flex items-center justify-between px-4 h-9 bg-white/[0.02] border-b border-white/5 shrink-0">
        <span className="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase">{label}</span>
        <div className="flex items-center gap-4">
          {actions && <div className="flex items-center gap-2">{actions}</div>}
          <div className="flex gap-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
          </div>
        </div>
      </div>
      <textarea
        className="flex-1 w-full bg-transparent text-slate-400 p-6 mono text-[13px] leading-relaxed resize-none focus:outline-none scrollbar-thin scrollbar-thumb-slate-800 selection:bg-blue-500/30 font-mono"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        spellCheck={false}
        placeholder={readOnly ? "Processing pipeline output will manifest here..." : "Input obfuscated payload here..."}
      />
    </div>
  );
};
