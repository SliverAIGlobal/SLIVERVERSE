import React, { useState, useRef } from 'react';
import { ShieldCheck, Fingerprint, Activity, RefreshCw } from 'lucide-react';
import GestureAnalyzer from '../engine/gestureMath';
import { saveRecord } from '../db/offlineStore';

export default function FluidPassAuth({ audioResonator, onAuthSuccess }) {
  const [authStatus, setAuthStatus] = useState('Idle (Perform FluidPass Gesture)');
  const [fatigueScore, setFatigueScore] = useState(0.12);
  const [isRecording, setIsRecording] = useState(false);
  const [confidence, setConfidence] = useState(100);

  const gestureAnalyzer = useRef(new GestureAnalyzer());

  const handlePointerDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    gestureAnalyzer.current.startGesture(x, y, e.pressure || 0.5);
    setIsRecording(true);
    if (audioResonator) audioResonator.playTone(432, 0.2);
  };

  const handlePointerMove = (e) => {
    if (!isRecording) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    gestureAnalyzer.current.addPoint(x, y, e.pressure || 0.5);
  };

  const handlePointerUp = async () => {
    if (!isRecording) return;
    setIsRecording(false);

    const result = gestureAnalyzer.current.endGesture();
    if (result.valid) {
      setFatigueScore(result.fatigueIndex);
      setConfidence(result.confidence);
      const token = `Authenticated (${result.signatureHash})`;
      setAuthStatus(token);

      if (audioResonator) audioResonator.playTone(528, 0.5);

      const record = {
        type: 'FluidPass 3D Gesture Signature Auth',
        signature: result.signatureHash,
        fatigueIndex: result.fatigueIndex,
        confidence: result.confidence
      };

      await saveRecord('gestureSignatures', record);
      if (onAuthSuccess) onAuthSuccess(record);
    } else {
      setAuthStatus('Gesture incomplete - retry 3D motion');
    }
  };

  return (
    <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Bio-Kinetic "FluidPass" Security</span>
        </div>
        <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">
          3D Signature
        </span>
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="h-28 bg-slate-950/80 rounded-xl border border-blue-500/30 flex flex-col items-center justify-center cursor-crosshair select-none p-4 text-center space-y-1 hover:border-blue-500/60 transition-all"
      >
        <Fingerprint className={`w-8 h-8 ${isRecording ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
        <span className="text-xs font-bold text-slate-300">
          {isRecording ? 'Recording 3D Gesture Dynamics...' : 'Draw Your Motion Signature Here'}
        </span>
        <span className="text-[10px] text-slate-500 font-mono">Evaluating 6-12 Hz Micro-Tremor Telemetry</span>
      </div>

      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Auth Token:</span>
          <span className="font-mono text-emerald-300 text-[11px]">{authStatus}</span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Passive Tremor & Fatigue Index (6-12 Hz):</span>
            <span className="font-mono text-amber-400 font-bold">{(fatigueScore * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-full transition-all duration-500"
              style={{ width: `${fatigueScore * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
