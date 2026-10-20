import React, { useState, useEffect, useRef } from 'react';
import {
  HeartHandshake, Sparkles, Sliders, ShieldCheck, Key, Code, Activity,
  Volume2, EyeOff, UserCheck, RefreshCw, Info, Waves, Layers
} from 'lucide-react';

import FluidCanvas from './components/FluidCanvas';
import SolfeggioAudioControls from './components/SolfeggioAudioControls';
import BlindControls from './components/BlindControls';
import FluidPassAuth from './components/FluidPassAuth';
import CareStateMicroGrounding from './components/CareStateMicroGrounding';
import KineticShiftHandoff from './components/KineticShiftHandoff';
import VerticalAdapters from './components/VerticalAdapters';
import DeveloperSDKModal from './components/DeveloperSDKModal';
import SettingsModal from './components/SettingsModal';
import SalesKineticMode from './components/adapters/SalesKineticMode';

import AudioResonator from './engine/audioEngine';

export default function App() {
  const [activeAdapter, setActiveAdapter] = useState('careKinetic');
  const [stressLevel, setStressLevel] = useState(0.2);
  const [isSdkOpen, setIsSdkOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const audioResonatorRef = useRef(null);

  useEffect(() => {
    audioResonatorRef.current = new AudioResonator();
  }, []);

  const handlePointerDown = () => {
    if (audioResonatorRef.current) {
      audioResonatorRef.current.playTone(432, 0.2);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* 1. BACKGROUND FLUID CANVAS OVERLAY */}
      {activeAdapter !== 'salesKinetic' && (
        <FluidCanvas
          stressLevel={stressLevel}
          onPointerDown={handlePointerDown}
          className="absolute inset-0 z-0 pointer-events-auto"
        />
      )}

      {/* 2. HEADER BAR */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 pointer-events-auto">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20">
            CK
          </div>
          <div>
            <h1 className="font-bold text-base md:text-lg tracking-wider text-slate-100 flex items-center gap-2">
              ChromaOS: CareKinetic
              <span className="text-[10px] uppercase tracking-widest font-sans px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                DOA Caregivers Challenge
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Bio-Kinetic & Harmonic Operating System • Stress Diffusion & Blind Controls
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSdkOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
          >
            <Code className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">SDK</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>
      </header>

      {/* 3. MAIN INTERACTIVE DASHBOARD CONTAINER */}
      <main className="absolute inset-x-0 bottom-0 top-20 z-10 p-4 md:p-6 flex flex-col justify-between pointer-events-none overflow-y-auto">

        {/* TOP ADAPTERS NAVIGATION */}
        <div className="pointer-events-auto max-w-7xl mx-auto w-full mb-4">
          <VerticalAdapters
            activeAdapter={activeAdapter}
            onSelectAdapter={setActiveAdapter}
          />
        </div>

        {/* PRIMARY CAREGIVER CHALLENGE DASHBOARD (CareKinetic Mode) */}
        {activeAdapter === 'careKinetic' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pointer-events-auto max-w-7xl mx-auto w-full my-auto">

            {/* COLUMN 1: BLIND CONTROLS & STRESS VISCOSITY */}
            <div className="space-y-4 flex flex-col justify-between">
              <BlindControls audioResonator={audioResonatorRef.current} />

              {/* VISCOSITY / STRESS LEVEL SLIDER */}
              <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="font-bold flex items-center gap-1.5 text-amber-400">
                    <Sliders className="w-3.5 h-3.5" /> Adaptive Viscosity & Stress State
                  </span>
                  <span className="font-mono text-amber-300">{(stressLevel * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-950 rounded-lg h-1.5 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">
                  High stress scales fluid resistance and shifts color state to warm iron oxide; routine task state dissipates to chlorophyll green.
                </p>
              </div>
            </div>

            {/* COLUMN 2: FLUIDPASS AUTH & SOLFEGGIO RESONATOR */}
            <div className="space-y-4 flex flex-col justify-between">
              <FluidPassAuth audioResonator={audioResonatorRef.current} />
              <SolfeggioAudioControls audioResonator={audioResonatorRef.current} />
            </div>

            {/* COLUMN 3: MICRO-GROUNDING & SHIFT HANDOFF */}
            <div className="space-y-4 flex flex-col justify-between">
              <CareStateMicroGrounding audioResonator={audioResonatorRef.current} />
              <KineticShiftHandoff audioResonator={audioResonatorRef.current} />
            </div>

          </div>
        )}

        {/* B2B SALESKINETIC ENHANCER SUITE */}
        {activeAdapter === 'salesKinetic' && (
          <div className="pointer-events-auto max-w-7xl mx-auto w-full my-auto">
            <SalesKineticMode />
          </div>
        )}

        {/* OTHER INDUSTRY SHOWCASE MODES */}
        {activeAdapter !== 'careKinetic' && activeAdapter !== 'salesKinetic' && (
          <div className="p-8 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl max-w-2xl mx-auto w-full pointer-events-auto text-center my-auto space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <Waves className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white capitalize">{activeAdapter} Bio-Kinetic Mode Active</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Navier-Stokes fluid solver and Solfeggio acoustic frequency modulation active for {activeAdapter} domain operations.
            </p>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400">
              120 FPS Fluid Solver • Web Audio API Solfeggio Synthesis Operational
            </div>
          </div>
        )}

      </main>

      {/* MODALS */}
      <DeveloperSDKModal isOpen={isSdkOpen} onClose={() => setIsSdkOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

    </div>
  );
}
