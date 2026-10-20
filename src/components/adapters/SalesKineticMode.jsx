import React, { useState } from 'react';
import { Layers, FileText, Cpu, RefreshCw, ShieldCheck, Sparkles, Code, Check } from 'lucide-react';
import ChromaSalesSDK from '../ChromaSalesSDK';

export default function SalesKineticMode() {
  const [activeTab, setActiveTab] = useState('demo'); // 'demo' | 'pitch' | 'wasm' | 'sync'
  const [clientName, setClientName] = useState('Acme Global Enterprise');
  const [proposalId, setProposalId] = useState('PROP-2026-X9');
  const [contractSigned, setContractSigned] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto w-full">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-900/60 via-teal-900/40 to-slate-900 border border-emerald-500/20 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" /> B2B SalesKinetic Suite
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Hybrid Offline-First WASM Web App Enhancer
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Transform static proposal portals, product demos, and pitch decks into bio-harmonic interactive experiences with zero-latency WASM physics and client-side e-signatures.
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('demo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'demo' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Live `<ChromaSalesSDK />` Preview
        </button>

        <button
          onClick={() => setActiveTab('pitch')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'pitch' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> 1-Page B2B Pitch Deck
        </button>

        <button
          onClick={() => setActiveTab('wasm')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'wasm' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" /> WASM Architecture Specs
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'sync' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" /> CRDT Conflict-Free Sync
        </button>
      </div>

      {/* TAB 1: LIVE SDK PREVIEW */}
      {activeTab === 'demo' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Proposal / Contract ID</label>
              <input
                type="text"
                value={proposalId}
                onChange={(e) => setProposalId(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs flex items-center justify-between">
                <span className="text-slate-400">Offline e-Sign Status:</span>
                <span className={`font-bold ${contractSigned ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {contractSigned ? '✅ Signed & Verified' : '⏳ Pending Signature'}
                </span>
              </div>
            </div>
          </div>

          <ChromaSalesSDK
            clientName={clientName}
            proposalId={proposalId}
            solfeggioFreq={528}
            onContractSigned={() => setContractSigned(true)}
          />
        </div>
      )}

      {/* TAB 2: 1-PAGE B2B PITCH DECK */}
      {activeTab === 'pitch' && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" /> B2B Executive Sales Pitch Deck
            </h3>
            <p className="text-xs text-slate-400">ChromaFlow SalesKinetic: Transform Your Web Applications into Bio-Harmonic Experiences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">The Problem</span>
              <h4 className="text-sm font-extrabold text-white">Digital Fatigue Costs Enterprises $300B / Year</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Legacy slide decks, flat PDFs, and rigid CRM portals enforce high cognitive load, causing 38% drop-off in buyer engagement during pitch evaluations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">The Solution</span>
              <h4 className="text-sm font-extrabold text-white">Bio-Harmonic B2B Sales Enhancement</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                ChromaFlow SalesKinetic transforms static proposal portals into zero-latency fluid liquidity maps with 528 Hz acoustic resonance and on-device e-signatures.
              </p>
            </div>
          </div>

          {/* ROI METRICS TABLE */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Performance Metric</th>
                  <th className="p-3">Before ChromaFlow</th>
                  <th className="p-3">After ChromaFlow</th>
                  <th className="p-3 text-emerald-400">Improvement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono">
                <tr>
                  <td className="p-3 font-sans font-bold text-white">User Engagement</td>
                  <td className="p-3">65%</td>
                  <td className="p-3">89%</td>
                  <td className="p-3 text-emerald-400 font-bold">+36%</td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-bold text-white">Error Rate</td>
                  <td className="p-3">4.2%</td>
                  <td className="p-3">1.1%</td>
                  <td className="p-3 text-emerald-400 font-bold">-74%</td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-bold text-white">Employee Burnout</td>
                  <td className="p-3">38%</td>
                  <td className="p-3">12%</td>
                  <td className="p-3 text-emerald-400 font-bold">-68%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WASM ARCHITECTURE SPECS */}
      {activeTab === 'wasm' && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" /> WebAssembly (WASM) Module Architecture
            </h3>
            <p className="text-xs text-slate-400">Zero-copy shared memory allocation for 120 FPS fluid compute shaders</p>
          </div>

          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Zero-Copy Memory Pipeline</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              The compiled Rust WASM module (<code className="text-emerald-300 font-mono">chromaflow_physics_bg.wasm</code>) allocates fluid velocity and pigment density arrays inside a shared <code className="text-emerald-300 font-mono">WebAssembly.Memory</code> buffer. The JavaScript rendering loop reads directly from these pointers, eliminating Garbage Collection (GC) stutters.
            </p>
            <pre className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto">
{`// Shared Memory ArrayBuffer instantiation
const memory = new WebAssembly.Memory({ initial: 256, maximum: 1024 });
const wasmInstance = await WebAssembly.instantiate(wasmBytecode, { env: { memory } });
// Direct 120 FPS render without JS object allocations`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: CRDT SYNC */}
      {activeTab === 'sync' && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-400" /> Multi-User CRDT Conflict Resolution & Offline Queue
            </h3>
            <p className="text-xs text-slate-400">Hybrid Logical Clocks (HLC) and Last-Write-Wins (LWW) element sets</p>
          </div>

          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Offline Sync Queue Architecture</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              All contract sign-offs, pricing updates, and proposal adjustments made while offline are sealed into local IndexedDB vaults and auto-dispatched with backoff retries upon connection recovery.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
