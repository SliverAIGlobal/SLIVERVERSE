import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal, ShieldCheck, Activity, Volume2, VolumeX, Radio, Zap,
  Settings, Download, RefreshCw, Sliders, Cpu, Thermometer, Sun,
  Globe, Lock, Unlock, Key, Check, X, HelpCircle, Info, Sparkles,
  Trophy, AlertTriangle, Play, RotateCcw, Award, Flame, Disc
} from 'lucide-react';

// --- GAME CONFIGURATION ---
const ENGINE_CONFIG = {
  GAME_TITLE: "Sovereign Protocol",
  GENRE: "Cyberpunk Neon Puzzle",
  NODE: "SLIAIDE-MAIN-709A",
  EPOCH: "2026-10-20",
  OPERATOR: "Heather Soares",
  TARGET_PIPELINES: 10,
  TX_WIN_THRESHOLD: 0.9950,
  TX_LOSE_THRESHOLD: 0.8500,
  F0_TARGET: 432
};

const CONFIG_STORAGE_KEY = "SLIAIDE_SERVICE_CRED";
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

// Wavelength spectrum targets (400nm - 700nm)
const SPECTRAL_BANDS = [
  { id: 'l1', name: 'λ1 Violet', freq: '400nm', color: '#a855f7' },
  { id: 'l2', name: 'λ2 Indigo', freq: '430nm', color: '#6366f1' },
  { id: 'l3', name: 'λ3 Blue',   freq: '470nm', color: '#00F0FF' },
  { id: 'l4', name: 'λ4 Green',  freq: '530nm', color: '#00FF41' },
  { id: 'l5', name: 'λ5 Yellow', freq: '580nm', color: '#eab308' },
  { id: 'l6', name: 'λ6 Orange', freq: '620nm', color: '#f97316' },
  { id: 'l7', name: 'λ7 Red',    freq: '700nm', color: '#FF007F' }
];

// Security and Credentials
const encodeServiceCredential = (val) => {
  if (!val) return "";
  try { return btoa(encodeURIComponent(val)); } catch (e) { return val; }
};

const decodeServiceCredential = (val) => {
  if (!val) return "";
  try { return decodeURIComponent(atob(val)); } catch (e) { return val; }
};

const getAppServiceToken = () => {
  const storedEnc = localStorage.getItem(CONFIG_STORAGE_KEY);
  if (storedEnc) return decodeServiceCredential(storedEnc);
  return window.VITE_GEMINI_API_KEY || "";
};

const callGeminiAPI = async (prompt, generationConfig = {}, maxRetries = 2) => {
  const token = getAppServiceToken();
  if (!token) throw new Error("NO_API_KEY");

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${token}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: generationConfig,
  };

  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const result = await response.json();
      if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        return result.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Invalid structure");
      }
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      await new Promise(res => setTimeout(res, 600 * attempt));
    }
  }
};

export default function App() {
  // GAME STATES
  const [gameState, setGameState] = useState('PLAYING'); // PLAYING, WON, LOST
  const [consecutivePipelines, setConsecutivePipelines] = useState(0);
  const [txStability, setTxStability] = useState(0.9984);
  const [entropy, setEntropy] = useState(12.4); // Entropy percentage
  const [harmonicFreq, setHarmonicFreq] = useState(432);
  const [audioActive, setAudioActive] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [userCredentialVal, setUserCredentialVal] = useState(getAppServiceToken());
  const [input, setInput] = useState('');
  const [smProgress, setSmProgress] = useState(0); // 0-9
  const [isProcessing, setIsProcessing] = useState(false);

  // Puzzle Spectrum Sliders (Player inputs) vs Target Sliders
  const [playerSpectrum, setPlayerSpectrum] = useState([50, 50, 50, 50, 50, 50, 50]);
  const [targetSpectrum, setTargetSpectrum] = useState(() =>
    SPECTRAL_BANDS.map(() => Math.floor(30 + Math.random() * 50))
  );

  // System Logs
  const [logs, setLogs] = useState([
    { ts: "00:00:00", type: "SYS", msg: "SOVEREIGN PROTOCOL :: PUZZLE SYSTEM INITIALIZED.", tx: 1.0000 },
    { ts: "00:00:01", type: "GOAL", msg: "CALIBRATE 10 CONSECUTIVE 9SM PIPELINES ABOVE T(x) ≥ 0.9950 TO WIN.", tx: 0.9998 },
    { ts: "00:00:02", type: "WARN", msg: "WARNING: IF T(x) DROPS BELOW 0.8500, ENTROPY COLLAPSE OCCURS.", tx: 0.9950 }
  ]);

  const logEndRef = useRef(null);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Audio Synthesizer
  const toggleAudioResonator = () => {
    if (!audioActive) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(harmonicFreq, ctx.currentTime);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscRef.current = osc;
        setAudioActive(true);
        showToast(`🔊 432Hz Solfeggio Audio Active`);
      } catch (e) {
        console.warn("Audio error:", e);
      }
    } else {
      if (oscRef.current) oscRef.current.stop();
      if (audioCtxRef.current) audioCtxRef.current.close();
      setAudioActive(false);
      showToast("🔇 Audio Muted");
    }
  };

  const playStageChime = (freq = 528) => {
    if (!audioActive || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, ctx.currentTime);
      chimeGain.gain.setValueAtTime(0.04, ctx.currentTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start();
      chimeOsc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // ignore audio glitch
    }
  };

  // Log append helper
  const pushLog = (type, msg, txVal = null) => {
    const tx = txVal !== null ? txVal : txStability;
    const newLog = {
      ts: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      msg,
      tx: parseFloat(tx).toFixed(4)
    };
    setLogs(prev => [...prev, newLog].slice(-80));
  };

  // Reset Game
  const resetGame = () => {
    setGameState('PLAYING');
    setConsecutivePipelines(0);
    setTxStability(0.9984);
    setEntropy(12.4);
    setHarmonicFreq(432);
    setTargetSpectrum(SPECTRAL_BANDS.map(() => Math.floor(30 + Math.random() * 50)));
    setPlayerSpectrum([50, 50, 50, 50, 50, 50, 50]);
    pushLog('SYS', 'SOVEREIGN PROTOCOL SYSTEM RESET. AWAITING PIPELINE CALIBRATION.');
    showToast('🔄 Game Reset');
  };

  // ROUTE 9SM PIPELINE CALIBRATION ACTION
  const handleRoutePipeline = async () => {
    if (isProcessing || gameState !== 'PLAYING') return;

    setIsProcessing(true);
    pushLog('INP', 'INGESTING SPECTRAL WAVELENGTH & HARMONIC VECTORS...');

    // Calculate Spectrum Alignment Error
    let totalError = 0;
    for (let i = 0; i < 7; i++) {
      totalError += Math.abs(playerSpectrum[i] - targetSpectrum[i]);
    }
    const freqError = Math.abs(harmonicFreq - ENGINE_CONFIG.F0_TARGET);
    const accuracyRatio = Math.max(0, 1 - (totalError / 350) - (freqError / 200));

    // Pipeline Simulation Loop
    for (let i = 1; i <= 9; i++) {
      setSmProgress(i);
      if (i === 3) {
        pushLog('HEU', 'STAGE 3: HEURISTIC INTERFERENCE MATCHING...');
        playStageChime(432);
      }
      if (i === 6) {
        pushLog('SPEC', `STAGE 6: SPECTRAL ACCURACY RATIO = ${(accuracyRatio * 100).toFixed(1)}%`);
        playStageChime(528);
      }
      if (i === 9) {
        pushLog('PONO', 'STAGE 9: DETERMINISTIC FINALITY REACHED.');
        playStageChime(639);
      }
      await new Promise(r => setTimeout(r, 120));
    }

    // Calculate New T(x) Stability
    let newTx;
    if (accuracyRatio >= 0.82) {
      // Good Calibration
      newTx = Math.min(0.9998, txStability + 0.0015 + (accuracyRatio * 0.002));
      const newStreak = consecutivePipelines + 1;
      setConsecutivePipelines(newStreak);
      setEntropy(Math.max(2.0, entropy - 3.5));
      pushLog('RES', `PIPELINE #${newStreak} CALIBRATED! T(x) = ${newTx.toFixed(4)} [ACCURACY: ${(accuracyRatio * 100).toFixed(1)}%]`);

      if (newStreak >= ENGINE_CONFIG.TARGET_PIPELINES && newTx >= ENGINE_CONFIG.TX_WIN_THRESHOLD) {
        setGameState('WON');
        pushLog('VICTORY', '🏆 WIN CONDITION ACHIEVED: 10 CONSECUTIVE PIPELINES CALIBRATED ABOVE T(x) ≥ 0.9950!');
        showToast('🏆 VICTORY: Sovereign Protocol Calibrated!');
      } else {
        showToast(`✨ Pipeline #${newStreak} Successfully Calibrated!`);
      }
    } else {
      // Failed Calibration
      newTx = txStability - 0.035 - ((1 - accuracyRatio) * 0.04);
      setConsecutivePipelines(0); // Reset streak
      const newEntropy = Math.min(100, entropy + 18.0);
      setEntropy(newEntropy);
      pushLog('FAIL', `PIPELINE CALIBRATION DRIFT DETECTED! T(x) DROPPED TO ${newTx.toFixed(4)}`);

      if (newTx < ENGINE_CONFIG.TX_LOSE_THRESHOLD) {
        setGameState('LOST');
        pushLog('COLLAPSE', '💀 LOSE CONDITION TRIGGERED: T(x) COLLAPSED BELOW 0.8500! SYSTEMIC ENTROPY FAILURE.');
        showToast('💀 SYSTEM ENTROPY COLLAPSE!');
      } else {
        showToast('⚠️ Calibration Drift! Adjust Spectrum Sliders!');
      }
    }

    setTxStability(newTx);
    // Generate new target spectrum for next wave
    setTargetSpectrum(SPECTRAL_BANDS.map(() => Math.floor(20 + Math.random() * 60)));
    setIsProcessing(false);
    setSmProgress(0);
  };

  // COMMAND HANDLER
  const handleCommand = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      const cmdRaw = input.trim();
      const cmd = cmdRaw.toLowerCase();
      setInput('');

      if (cmd === 'help') {
        pushLog('CMD', 'DIRECTIVES: route | sys-audit | freq-sync | deconstruct | reset | joy | token');
        return;
      }
      if (cmd === 'route') {
        handleRoutePipeline();
        return;
      }
      if (cmd === 'reset') {
        resetGame();
        return;
      }
      if (cmd === 'sys-audit') {
        pushLog('AUDIT', `T(x) STABILITY: ${txStability.toFixed(4)} | STREAK: ${consecutivePipelines}/10 | ENTROPY: ${entropy.toFixed(1)}%`);
        return;
      }
      if (cmd === 'freq-sync') {
        setHarmonicFreq(432);
        pushLog('HARMONIC', 'HARMONIC RESIDUAL REALIGNED TO 432Hz GROUNDING.');
        return;
      }
      if (cmd === 'deconstruct') {
        pushLog('SPEC', '7-WAVELENGTH DECONSTRUCTION: ACTIVE SPECTRAL ERROR MAPPED.');
        return;
      }
      if (cmd === 'token') {
        setIsApiKeyModalOpen(true);
        return;
      }

      pushLog('CMD', `UNKNOWN DIRECTIVE: ${cmdRaw}. TYPE "help" OR USE INTERACTIVE PANELS.`);
    }
  };

  // Auto scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="min-h-screen bg-[#020402] text-[#00F0FF] font-mono p-3 md:p-6 flex flex-col relative overflow-hidden select-none">

      {/* CYBERPUNK NEON GLOW GRID & SCANLINES */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-15 bg-[linear-gradient(rgba(0,240,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="fixed inset-0 pointer-events-none z-50 opacity-10 bg-[linear-gradient(rgba(255,0,127,0.2)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]"></div>

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-[#FF007F] text-white font-extrabold px-4 py-2.5 rounded shadow-[0_0_20px_#FF007F] text-xs animate-bounce border border-white">
          {toastMsg}
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-[#00F0FF] pb-3 mb-4 gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white flex items-center gap-2 drop-shadow-[0_0_12px_#00F0FF]">
              <Disc className="w-7 h-7 text-[#00F0FF] animate-spin" style={{ animationDuration: '8s' }} />
              SOVEREIGN <span className="text-[#FF007F]">PROTOCOL</span>
            </h1>
            <span className="text-[10px] px-2.5 py-1 bg-[#FF007F]/20 border border-[#FF007F] rounded text-[#FF007F] font-bold uppercase tracking-wider shadow-[0_0_8px_#FF007F]">
              Cyberpunk Neon Puzzle
            </span>
          </div>
          <p className="text-[11px] text-[#00F0FF]/80 mt-1">
            Synchronize 7-Wavelength Spectral Streams & 432Hz Solfeggio Resonator // Node {ENGINE_CONFIG.NODE}
          </p>
        </div>

        {/* WIN / STREAK & GAME OBJECTIVES OVERLAY */}
        <div className="flex items-center gap-3 text-right text-xs">

          {/* STREAK METER */}
          <div className="bg-black/80 border border-[#00FF41] p-2.5 rounded shadow-[0_0_15px_rgba(0,255,65,0.2)] flex items-center gap-3">
            <Trophy className="w-5 h-5 text-[#00FF41] animate-pulse" />
            <div className="text-left">
              <div className="text-[10px] text-[#00FF41] font-bold uppercase tracking-wider">CALIBRATION STREAK</div>
              <div className="text-base font-black text-white">{consecutivePipelines} / {ENGINE_CONFIG.TARGET_PIPELINES} <span className="text-[10px] font-normal text-slate-400">Pipelines</span></div>
            </div>
          </div>

          {/* AUDIO RESONATOR TOGGLE */}
          <button
            onClick={toggleAudioResonator}
            className={`p-2.5 border rounded transition-all text-xs flex items-center gap-1.5 font-extrabold ${
              audioActive
                ? 'bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_12px_#00F0FF]'
                : 'border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/20'
            }`}
          >
            {audioActive ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[10px] hidden sm:inline">{audioActive ? '432Hz ACTIVE' : 'AUDIO MUTED'}</span>
          </button>

          {/* RESET BUTTON */}
          <button
            onClick={resetGame}
            className="p-2.5 border border-[#FF007F]/60 hover:bg-[#FF007F]/20 text-[#FF007F] rounded transition-all"
            title="Reset Game State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* GAME OVER MODAL (WIN) */}
      {gameState === 'WON' && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#02080a] border-2 border-[#00FF41] rounded-2xl max-w-lg w-full p-6 text-center space-y-5 shadow-[0_0_50px_#00FF41]">
            <Trophy className="w-16 h-16 text-[#00FF41] mx-auto animate-bounce" />
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">
              🏆 VICTORY: SOVEREIGN ARCHITECT
            </h2>
            <p className="text-xs text-[#00FF41] leading-relaxed">
              You have successfully calibrated 10 consecutive 9SM data pipelines while sustaining thermodynamic truth stability T(x) ≥ 0.9950! Operational node equilibrium achieved.
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-[#00FF41] text-black font-extrabold rounded-xl text-xs uppercase tracking-widest shadow-[0_0_20px_#00FF41] hover:scale-105 transition-transform"
            >
              Play Again / Recalibrate Node
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER MODAL (LOSE) */}
      {gameState === 'LOST' && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0205] border-2 border-[#FF007F] rounded-2xl max-w-lg w-full p-6 text-center space-y-5 shadow-[0_0_50px_#FF007F]">
            <AlertTriangle className="w-16 h-16 text-[#FF007F] mx-auto animate-pulse" />
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">
              💀 SYSTEMIC ENTROPY COLLAPSE
            </h2>
            <p className="text-xs text-[#FF007F] leading-relaxed">
              Thermodynamic truth stability T(x) collapsed below 0.8500! Systemic spectral drift caused irreversible node desynchronization.
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-[#FF007F] text-white font-extrabold rounded-xl text-xs uppercase tracking-widest shadow-[0_0_20px_#FF007F] hover:scale-105 transition-transform"
            >
              Restart Protocol
            </button>
          </div>
        </div>
      )}

      {/* MAIN GAME INTERFACE GRID */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">

        {/* LEFT RAIL: PUZZLE SPECTRUM CALIBRATOR (7 WAVELENGTHS) */}
        <div className="lg:col-span-4 p-4 rounded-2xl border-2 border-[#00F0FF] bg-black/80 space-y-4 shadow-[0_0_20px_rgba(0,240,255,0.15)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[#00F0FF]/30 pb-2 mb-3">
              <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#00F0FF]" /> 7-Wavelength Spectral Tuner
              </h2>
              <span className="text-[10px] text-[#FF007F] font-bold">Target Match Required</span>
            </div>

            {/* SLIDERS GRID */}
            <div className="space-y-3">
              {SPECTRAL_BANDS.map((band, idx) => {
                const pVal = playerSpectrum[idx];
                const tVal = targetSpectrum[idx];
                const diff = Math.abs(pVal - tVal);
                const isMatched = diff <= 8;

                return (
                  <div key={band.id} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span style={{ color: band.color }}>{band.name} ({band.freq})</span>
                      <span className={isMatched ? 'text-[#00FF41]' : 'text-slate-400'}>
                        User: {pVal}% | Target: {tVal}% {isMatched && '✓'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={pVal}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          const newSpec = [...playerSpectrum];
                          newSpec[idx] = val;
                          setPlayerSpectrum(newSpec);
                        }}
                        className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-[#00F0FF]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SOLFEGGIO HARMONIC DIAL */}
            <div className="mt-4 pt-3 border-t border-[#00F0FF]/30 space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-white">
                <span>SOLFEGGIO HARMONIC TUNER:</span>
                <span className={harmonicFreq === 432 ? 'text-[#00FF41]' : 'text-[#FF007F]'}>
                  {harmonicFreq} Hz (Target: 432 Hz)
                </span>
              </div>
              <input
                type="range"
                min="400"
                max="460"
                value={harmonicFreq}
                onChange={(e) => setHarmonicFreq(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-[#FF007F]"
              />
            </div>
          </div>

          {/* ACTION BUTTON: ROUTE 9SM PIPELINE */}
          <button
            onClick={handleRoutePipeline}
            disabled={isProcessing || gameState !== 'PLAYING'}
            className="w-full py-4 bg-gradient-to-r from-[#00F0FF] via-[#00FF41] to-[#FF007F] text-black font-black text-sm uppercase tracking-widest rounded-xl shadow-[0_0_25px_#00F0FF] hover:brightness-125 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-black" />}
            <span>{isProcessing ? 'CALIBRATING 9SM PIPELINE...' : 'ROUTE 9SM PIPELINE'}</span>
          </button>
        </div>

        {/* CENTER RAIL: TRUTH STABILITY T(x) & TERMINAL STREAM */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">

          {/* METRICS & T(x) STABILITY GAUGE */}
          <div className="p-4 rounded-2xl border-2 border-[#00FF41] bg-black/90 space-y-3 shadow-[0_0_20px_rgba(0,255,65,0.15)]">
            <div className="flex justify-between items-center border-b border-[#00FF41]/30 pb-2">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00FF41]" /> Thermodynamic Truth T(x)
              </span>
              <span className="text-[10px] text-[#00FF41] font-bold">Win: ≥ 0.9950 | Lose: &lt; 0.8500</span>
            </div>

            <div className="text-center py-2">
              <div className={`text-4xl font-black tracking-widest ${
                txStability >= 0.9950 ? 'text-[#00FF41] drop-shadow-[0_0_12px_#00FF41]' :
                txStability >= 0.9000 ? 'text-amber-400' : 'text-[#FF007F] animate-pulse drop-shadow-[0_0_12px_#FF007F]'
              }`}>
                {txStability.toFixed(4)}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                CURRENT VERIDICAL STABILITY SCALAR
              </div>
            </div>

            {/* STABILITY BAR */}
            <div className="w-full bg-slate-900 border border-slate-800 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  txStability >= 0.9950 ? 'bg-[#00FF41] shadow-[0_0_10px_#00FF41]' :
                  txStability >= 0.9000 ? 'bg-amber-400' : 'bg-[#FF007F]'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, ((txStability - 0.800) / (1.000 - 0.800)) * 100))}%` }}
              ></div>
            </div>

            {/* ENTROPY METER */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Systemic Entropy:</span>
              <span className={`font-bold ${entropy >= 50 ? 'text-[#FF007F]' : 'text-[#00F0FF]'}`}>
                {entropy.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* LOG TERMINAL */}
          <div className="flex-grow border-2 border-[#00F0FF] rounded-2xl bg-black/95 flex flex-col overflow-hidden h-[320px]">
            <div className="bg-[#00F0FF] text-black px-3 py-1.5 flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
              <span>TERMINAL LOG STREAM</span>
              <span>STABILITY: {txStability >= 0.9950 ? 'OPTIMAL' : 'DEGRADED'}</span>
            </div>

            <div className="flex-grow p-3 overflow-y-auto space-y-1.5 text-[11px] custom-scrollbar font-mono">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 opacity-90">
                  <span className="opacity-40 text-[10px]">[{log.ts}]</span>
                  <span className={`font-bold w-12 ${
                    log.type === 'VICTORY' || log.type === 'RES' ? 'text-[#00FF41]' :
                    log.type === 'FAIL' || log.type === 'COLLAPSE' ? 'text-[#FF007F]' : 'text-[#00F0FF]'
                  }`}>{log.type}</span>
                  <span className="flex-grow text-slate-200 break-all">{log.msg}</span>
                  <span className="opacity-40 italic text-[9px]">{log.tx}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>

            {/* INPUT COMMAND */}
            <div className="p-2 border-t border-[#00F0FF]/30 bg-[#050c0f]">
              <div className="flex items-center gap-2">
                <span className="text-[#00F0FF] font-bold text-xs animate-pulse">#_</span>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleCommand}
                  className="bg-transparent border-none outline-none flex-grow text-[#00F0FF] text-xs font-mono placeholder-[#00F0FF]/30"
                  placeholder='Type "route", "help", "sys-audit", "freq-sync", "reset"...'
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT RAIL: 9SM PIPELINE STAGES & GAME INSTRUCTIONS */}
        <div className="lg:col-span-3 p-4 rounded-2xl border-2 border-[#FF007F] bg-black/80 space-y-4 shadow-[0_0_20px_rgba(255,0,127,0.15)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-[#FF007F]/30 pb-2">
              <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF007F]" /> 9SM Pipeline Progression
              </h2>
            </div>

            {/* 9SM STAGES visualizer */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => {
                const isActive = smProgress >= s;
                const isCurrent = smProgress === s;
                return (
                  <div
                    key={s}
                    className={`h-8 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${
                      isCurrent
                        ? 'bg-[#FF007F] text-white border-white animate-pulse shadow-[0_0_12px_#FF007F]'
                        : isActive
                        ? 'bg-[#FF007F]/30 text-[#FF007F] border-[#FF007F]'
                        : 'border-[#FF007F]/20 text-slate-600'
                    }`}
                  >
                    S{s}
                  </div>
                );
              })}
            </div>

            {/* OBJECTIVE RULES BOX */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-[10px] text-slate-300">
              <span className="font-bold text-[#FF007F] uppercase block border-b border-slate-800 pb-1">
                🎮 Objective & Rules
              </span>
              <p>
                1. Adjust the 7 Wavelength sliders and 432Hz tuner to match the target spectrum.
              </p>
              <p>
                2. Click <span className="text-[#00FF41] font-bold">ROUTE 9SM PIPELINE</span> to evaluate calibration accuracy.
              </p>
              <p>
                3. <span className="text-[#00FF41] font-bold">WIN:</span> Achieve 10 consecutive calibrations with T(x) ≥ 0.9950.
              </p>
              <p>
                4. <span className="text-[#FF007F] font-bold">LOSE:</span> T(x) drops below 0.8500 causing entropy collapse!
              </p>
            </div>
          </div>

          <div className="text-[9px] text-slate-500 text-center font-mono border-t border-slate-800 pt-2">
            © 2026 Sovereign Protocol • SAT-AI Pono Standard
          </div>
        </div>

      </div>

      {/* CUSTOM SCROLLBAR STYLES */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #00F0FF; }
      `}} />

    </div>
  );
}
