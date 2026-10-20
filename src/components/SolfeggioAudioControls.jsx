import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Activity } from 'lucide-react';

export default function SolfeggioAudioControls({ audioResonator }) {
  const [activeFreq, setActiveFreq] = useState(432);
  const [isSubBassActive, setIsSubBassActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handleFreqSelect = (freq, name) => {
    setActiveFreq(freq);
    if (audioResonator) {
      audioResonator.playTone(freq, 0.8);
    }
  };

  const toggleSubBass = () => {
    if (!audioResonator) return;
    if (isSubBassActive) {
      audioResonator.stopSubBassWash();
      setIsSubBassActive(false);
    } else {
      audioResonator.startSubBassWash(0.4);
      setIsSubBassActive(true);
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <Activity className="w-4 h-4" /> Solfeggio Harmonic Resonator
        </span>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleFreqSelect(432, 'Grounding')}
          className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all border ${
            activeFreq === 432
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="font-mono text-sm text-emerald-400">432 Hz</div>
          <div className="text-[9px] text-slate-400 mt-0.5">Alpha Grounding</div>
        </button>

        <button
          onClick={() => handleFreqSelect(528, 'Transformation')}
          className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all border ${
            activeFreq === 528
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-lg shadow-blue-500/10'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="font-mono text-sm text-blue-400">528 Hz</div>
          <div className="text-[9px] text-slate-400 mt-0.5">Transformation</div>
        </button>

        <button
          onClick={() => handleFreqSelect(639, 'Harmonic Balance')}
          className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all border ${
            activeFreq === 639
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="font-mono text-sm text-purple-400">639 Hz</div>
          <div className="text-[9px] text-slate-400 mt-0.5">Interpersonal</div>
        </button>
      </div>

      <button
        onClick={toggleSubBass}
        className={`w-full py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
          isSubBassActive
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg'
            : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>{isSubBassActive ? 'Sub-Bass Theta Wash Active' : 'Enable Sub-Bass Theta Wash'}</span>
      </button>
    </div>
  );
}
