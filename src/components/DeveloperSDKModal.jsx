import React, { useState } from 'react';
import { Code, Copy, Check, X, Sparkles } from 'lucide-react';

export default function DeveloperSDKModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const codeSnippet = `import { ChromaCanvasSDK } from '@chromaos/core';

// Plug-and-Play Offline Hybrid WASM & Solfeggio SDK
const ChromaApp = () => (
  <ChromaCanvasSDK
    mode="careKinetic"
    solfeggioFreq={432}
    enableBlindGestures={true}
    offlineVault={true}
    onSessionComplete={(metrics) => console.log('Care session metrics:', metrics)}
  />
);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
            <Code className="w-4 h-4" />
            <span>ChromaOS Developer SDK (`@chromaos/core`)</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Embed zero-dependency bio-kinetic fluid mechanics, Solfeggio audio resonators, and eyes-free blind gesture controls directly into standard web or mobile applications.
        </p>

        <div className="relative">
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] font-mono text-emerald-300 overflow-x-auto">
            {codeSnippet}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1 border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
          <span>Offline-First Hybrid Architecture: WASM + Web Audio API runs 100% client-side without cloud latency.</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all"
        >
          Close SDK Inspector
        </button>
      </div>
    </div>
  );
}
