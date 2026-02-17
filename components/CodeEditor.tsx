
import React from 'react';

interface CodeEditorProps {
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  label: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, readOnly = false, label }) => {
  return (
    <div className="flex flex-col h-full bg-[#111114] border border-[#2a2a2e] rounded-lg overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1e] border-b border-[#2a2a2e]">
        <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">{label}</span>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
        </div>
      </div>
      <textarea
        className="flex-1 w-full bg-transparent text-[#94a3b8] p-4 mono text-sm resize-none focus:outline-none scrollbar-thin scrollbar-thumb-gray-800"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        spellCheck={false}
        placeholder={readOnly ? "Deobfuscation results will appear here..." : "Paste your obfuscated JavaScript here (r3xdev pattern)..."}
      />
    </div>
  );
};
