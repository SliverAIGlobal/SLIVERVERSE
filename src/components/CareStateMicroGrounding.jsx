import React, { useState, useEffect } from 'react';
import { Sparkles, HeartHandshake, RefreshCw, CheckCircle } from 'lucide-react';

export default function CareStateMicroGrounding({ audioResonator, onComplete }) {
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(10);

  useEffect(() => {
    let interval = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (timer === 0 && isActive) {
      setIsActive(false);
      setTimer(10);
      if (audioResonator) audioResonator.stopSubBassWash();
      if (onComplete) onComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timer, audioResonator, onComplete]);

  const handleStart = () => {
    setIsActive(true);
    setTimer(10);
    if (audioResonator) {
      audioResonator.playTone(528, 10);
      audioResonator.startSubBassWash(0.3);
    }
  };

  return (
    <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
          <HeartHandshake className="w-4 h-4 text-blue-400" />
          <span>CareState Micro-Grounding Reset</span>
        </div>
        <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">
          528 Hz Reset
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        A 10-second sensory grounding break combining slow expanding fluid swirls with 528 Hz Solfeggio sound fields to lower cortisol and reset cognitive load between tasks.
      </p>

      {isActive ? (
        <div className="p-6 bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/40 rounded-xl flex flex-col items-center justify-center space-y-2 text-center animate-pulse">
          <span className="text-4xl font-extrabold text-blue-300 font-mono">{timer}s</span>
          <span className="text-xs text-blue-200">Breathe gently... Solfeggio 528 Hz Sensory Reset Active</span>
        </div>
      ) : (
        <button
          onClick={handleStart}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Activate 10-Second Micro-Grounding</span>
        </button>
      )}
    </div>
  );
}
