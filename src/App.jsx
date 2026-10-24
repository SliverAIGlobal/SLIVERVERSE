import React, { useState } from 'react';
import SpectraRefractionEngine from './components/SpectraRefractionEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState('SPECTRA');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* HUD Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 via-indigo-500 to-rose-500 p-0.5 animate-spin-slow">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center font-bold text-xs text-teal-300">
              S
            </div>
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-teal-200 via-indigo-200 to-rose-200">
              SLIVERVERSE // ANTI=APP
            </h1>
            <p className="text-[10px] font-mono text-slate-400">T(x) &gt;= 0.9950 Veridical Sanctuary</p>
          </div>
        </div>

        {/* Pillar Tabs */}
        <nav className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
          {[
            { id: 'SPECTRA', label: '1. SPECTRA' },
            { id: 'ATHENA', label: '2. ATHENA DANIELS' },
            { id: 'HANA', label: '3. HĀNA RUNNER' },
            { id: 'FLOWER', label: '4. FLOWER LEARN' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-lg shadow-teal-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        {activeTab === 'SPECTRA' && <SpectraRefractionEngine />}

        {activeTab === 'ATHENA' && (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
            <h2 className="text-xl font-bold text-teal-300">2. ATHENA DANIELS // Relational Voice Companion</h2>
            <p className="text-sm text-slate-300">
              Empathetic voice intelligence &amp; zero-latency memory vaults operating across Wave 2 (Orange: Relational Dynamics) and Wave 7 (Violet: Metacognition).
            </p>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-teal-400">
              STATUS: AUTHENTICATED // Zero-Storage Biohash Memory Stream Active
            </div>
          </div>
        )}

        {activeTab === 'HANA' && (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
            <h2 className="text-xl font-bold text-indigo-300">3. HĀNA RUNNER // Edge WASM Execution Engine</h2>
            <p className="text-sm text-slate-300">
              Low-latency offline-first WASM execution pipeline &amp; 100-channel capital routing matrix operating with $0.00 recurring API costs.
            </p>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-indigo-400">
              MONETIZATION MATRIX: 100 Channels Active // GAAP Fiduciary Ledger Ready
            </div>
          </div>
        )}

        {activeTab === 'FLOWER' && (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
            <h2 className="text-xl font-bold text-rose-300">4. FLOWER LEARN // Somatic Pedagogy &amp; Truth Gate</h2>
            <p className="text-sm text-slate-300">
              Flow-state skill acquisition platform featuring a strict 40% ELIP Guidebook / 60% Somatic Worksheet split and T(x) &gt;= 0.9950 verification gates.
            </p>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-rose-400">
              VERIDICAL INTEGRITY: T(x) = 0.9984 // SLIVER GRAND LEDGER SHA-256 ANCHOR LOCKED
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
