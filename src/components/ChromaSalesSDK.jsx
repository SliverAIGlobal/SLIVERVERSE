import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Layers, ShieldCheck, Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';

import FluidSolver from '../engine/fluidSolver';
import AudioResonator from '../engine/audioEngine';
import GestureAnalyzer from '../engine/gestureMath';
import { saveRecord } from '../db/offlineStore';
import offlineQueue from '../sync/offlineQueue';

export function ChromaSalesSDK({
  proposalId = 'prop-2026-x9',
  clientName = 'Enterprise Partner',
  theme = 'chlorophyll',
  solfeggioFreq = 528,
  onContractSigned
}) {
  const canvasRef = useRef(null);
  const fluidRef = useRef(null);
  const audioRef = useRef(null);
  const gestureRef = useRef(new GestureAnalyzer());

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [activeViscosity, setActiveViscosity] = useState(1.0);
  const [fatigueScore, setFatigueScore] = useState(0.12);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureMatch, setSignatureMatch] = useState(null);
  const [pendingQueueCount, setPendingQueueCount] = useState(0);

  useEffect(() => {
    audioRef.current = new AudioResonator();
    offlineQueue.getPendingCount().then(setPendingQueueCount);
    const unsubscribe = offlineQueue.subscribe(() => {
      offlineQueue.getPendingCount().then(setPendingQueueCount);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 800;
    canvas.height = 360;

    const solver = new FluidSolver(canvas);
    solver.startAnimation();
    fluidRef.current = solver;

    const handleResize = () => {
      if (solver) solver.resize(canvas.parentElement ? canvas.parentElement.clientWidth : 800, 360);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      solver.stopAnimation();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handlePointerDown = (e) => {
    if (!canvasRef.current || !fluidRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    fluidRef.current.addDensity(x, y, 3.0);
    fluidRef.current.addVelocity(x, y, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15);

    if (isSigning) {
      gestureRef.current.startGesture(x, y, e.pressure || 0.5);
    }

    if (audioRef.current && !isAudioMuted) {
      audioRef.current.playTone(solfeggioFreq, 0.2);
    }
  };

  const handlePointerMove = (e) => {
    if (!canvasRef.current || !fluidRef.current) return;
    if (e.buttons === 0 && e.pointerType === 'mouse') return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    fluidRef.current.addDensity(x, y, 1.5);
    fluidRef.current.addVelocity(x, y, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);

    if (isSigning) {
      gestureRef.current.addPoint(x, y, e.pressure || 0.5);
    }
  };

  const handlePointerUp = async () => {
    if (isSigning) {
      const result = gestureRef.current.endGesture();
      if (result.valid) {
        setFatigueScore(result.fatigueIndex);
        setSignatureMatch(result.confidence);

        const record = {
          proposalId,
          clientName,
          type: 'FluidPass B2B Contract e-Signature',
          signatureHash: result.signatureHash,
          confidence: result.confidence,
          timestamp: new Date().toISOString()
        };

        await saveRecord('gestureSignatures', record);
        await offlineQueue.enqueueAction('CONTRACT_SIGNED', record);

        if (audioRef.current && !isAudioMuted) {
          audioRef.current.playTone(639, 0.6);
        }

        if (onContractSigned) onContractSigned(record);
        setIsSigning(false);
      }
    }
  };

  return (
    <div className="w-full rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col font-sans select-none">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-bold text-slate-100">{clientName} — B2B SalesKinetic Canvas</h3>
            <p className="text-[10px] text-slate-400 font-mono">Proposal ID: {proposalId} • Offline Vault Queue: {pendingQueueCount} Pending</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSigning(!isSigning)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isSigning
                ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>{isSigning ? 'Capturing FluidPass e-Sign...' : 'FluidPass e-Sign'}</span>
          </button>

          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Fluid Canvas Surface */}
      <div className="relative w-full h-[360px] bg-slate-950 cursor-crosshair touch-none">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full block"
        />

        {/* Telemetry Badge */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-xs flex items-center space-x-3 text-slate-300">
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-mono">Viscosity Drag</span>
            <span className="font-bold text-emerald-400">1.0x</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-mono">Somatic Tremor Score</span>
            <span className="font-bold text-amber-400">{(fatigueScore * 100).toFixed(1)}%</span>
          </div>
          {signatureMatch !== null && (
            <>
              <div className="h-6 w-px bg-slate-800" />
              <div className="flex items-center gap-1 text-emerald-300 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{signatureMatch}% e-Signed</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChromaSalesSDK;
