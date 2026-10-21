import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal, ShieldCheck, Activity, Volume2, VolumeX, Radio, Zap,
  Settings, Download, RefreshCw, Sliders, Cpu, Thermometer, Sun,
  Globe, Lock, Unlock, Key, Check, X, HelpCircle, Info, Sparkles,
  Trophy, AlertTriangle, Play, RotateCcw, Award, Flame, Disc, Timer, Clock
} from 'lucide-react';

// --- GAME EDITOR CONFIGURATION ---
const ENGINE_CONFIG = {
  GAME_TITLE: "Sovereign Protocol",
  GENRE: "Cyberpunk Neon Puzzle",
  NODE: "SLIAIDE-MAIN-709A",
  EPOCH: "2026-10-20",
  OPERATOR: "Heather Soares",
  TARGET_PIPELINES: 10,
  TX_WIN_THRESHOLD: 0.9950,
  TX_LOSE_THRESHOLD: 0.8500,
  BASE_ENTROPY_DECAY_RATE: 0.0016, // per sec
  PHASE_LOCK_SURGE_BONUS: 0.0065,   // +T(x)
  DIRECTIVE_COOLDOWN_MS: 2500,     // 2.5s
  DEFAULT_MUSIC_VOLUME: 0.18,       // Gain level
  TOURNAMENT_ROUNDS: 3,             // 3 Rounds
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

export default function App() {
  // GAME EDITOR STATES
  const [gameState, setGameState] = useState('PLAYING'); // PLAYING, WON, LOST, TOURNAMENT_WIN
  const [consecutivePipelines, setConsecutivePipelines] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [txStability, setTxStability] = useState(0.9984);
  const [entropy, setEntropy] = useState(12.4); // Entropy percentage
  const [harmonicFreq, setHarmonicFreq] = useState(432);
  const [audioActive, setAudioActive] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [userCredentialVal, setUserCredentialVal] = useState(getAppServiceToken());
  const [input, setInput] = useState('');
  const [smProgress, setSmProgress] = useState(0); // 0-9
  const [isProcessing, setIsProcessing] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0); // ms remaining

  // Puzzle Spectrum Sliders (Player inputs) vs Target Sliders
  const [playerSpectrum, setPlayerSpectrum] = useState([50, 50, 50, 50, 50, 50, 50]);
  const [targetSpectrum, setTargetSpectrum] = useState(() =>
    SPECTRAL_BANDS.map(() => Math.floor(30 + Math.random() * 50))
  );

  // System Logs
  const [logs, setLogs] = useState([
    { ts: "00:00:00", type: "SYS", msg: `VANGUARD SHADOW SINGLE-PLAYER PROTOCOL INITIALIZED.`, tx: 1.0000 },
    { ts: "00:00:01", type: "GOAL", msg: `TARGET STREAK: ${ENGINE_CONFIG.TARGET_PIPELINES} PIPELINES ABOVE T(x) ≥ ${ENGINE_CONFIG.TX_WIN_THRESHOLD}.`, tx: 0.9998 },
    { ts: "00:00:02", type: "WARN", msg: `DIRECTIVES ACTIVE: [4] SLI-SHIFT | [5] FREQ-SYNC 528Hz | [6] GENESIS PROTOCOL`, tx: 0.9950 }
  ]);

  const logEndRef = useRef(null);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const detuneOscRef = useRef(null);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // REAL-TIME BASE ENTROPY DECAY TIMER (0.0016% / SEC)
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const timer = setInterval(() => {
      setEntropy(prev => {
        const updated = prev + (ENGINE_CONFIG.BASE_ENTROPY_DECAY_RATE * 100);
        return Math.min(100, updated);
      });

      // Slowly decay T(x) slightly due to entropy drift
      setTxStability(prev => {
        const newTx = prev - 0.00005;
        if (newTx < ENGINE_CONFIG.TX_LOSE_THRESHOLD) {
          setGameState('LOST');
          showToast('💀 SYSTEM ENTROPY COLLAPSE!');
        }
        return Math.max(0, newTx);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // DIRECTIVE COOLDOWN TIMER (2500ms)
  useEffect(() => {
    if (cooldownTime <= 0) return;
    const interval = setInterval(() => {
      setCooldownTime(prev => Math.max(0, prev - 100));
    }, 100);
    return () => clearInterval(interval);
  }, [cooldownTime]);

  // REAL-TIME SOLFEGGIO PHASE DETUNING AUDIO FEEDBACK (Volume 0.18)
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
        gain.gain.setValueAtTime(ENGINE_CONFIG.DEFAULT_MUSIC_VOLUME, ctx.currentTime);

        const detuneOsc = ctx.createOscillator();
        const detuneGain = ctx.createGain();
        detuneOsc.type = 'sine';
        const phaseOffset = Math.abs(harmonicFreq - ENGINE_CONFIG.F0_TARGET);
        detuneOsc.frequency.setValueAtTime(ENGINE_CONFIG.F0_TARGET + phaseOffset, ctx.currentTime);
        detuneGain.gain.setValueAtTime(phaseOffset > 2 ? 0.08 : 0.01, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        detuneOsc.connect(detuneGain);
        detuneGain.connect(ctx.destination);

        osc.start();
        detuneOsc.start();

        oscRef.current = osc;
        detuneOscRef.current = detuneOsc;
        setAudioActive(true);
        showToast(`🔊 Audio Resonator Active (Volume: ${ENGINE_CONFIG.DEFAULT_MUSIC_VOLUME})`);
      } catch (e) {
        console.warn("Audio error:", e);
      }
    } else {
      if (oscRef.current) oscRef.current.stop();
      if (detuneOscRef.current) detuneOscRef.current.stop();
      if (audioCtxRef.current) audioCtxRef.current.close();
      setAudioActive(false);
      showToast("🔇 Audio Muted");
    }
  };

  useEffect(() => {
    if (audioActive && audioCtxRef.current && oscRef.current && detuneOscRef.current) {
      const ctx = audioCtxRef.current;
      oscRef.current.frequency.setValueAtTime(harmonicFreq, ctx.currentTime);
      const phaseOffset = Math.abs(harmonicFreq - ENGINE_CONFIG.F0_TARGET);
      detuneOscRef.current.frequency.setValueAtTime(ENGINE_CONFIG.F0_TARGET + phaseOffset, ctx.currentTime);
    }
  }, [harmonicFreq, audioActive]);

  const playStageChime = (freq = 528) => {
    if (!audioActive || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, ctx.currentTime);
      chimeGain.gain.setValueAtTime(ENGINE_CONFIG.DEFAULT_MUSIC_VOLUME, ctx.currentTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start();
      chimeOsc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // ignore
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
    setCurrentRound(1);
    setTxStability(0.9984);
    setEntropy(12.4);
    setHarmonicFreq(432);
    setCooldownTime(0);
    setTargetSpectrum(SPECTRAL_BANDS.map(() => Math.floor(30 + Math.random() * 50)));
    setPlayerSpectrum([50, 50, 50, 50, 50, 50, 50]);
    pushLog('SYS', 'SOVEREIGN PROTOCOL TOURNAMENT RESET. ROUND 1/3 READY.');
    showToast('🔄 Tournament Reset');
  };

  // VANGUARD SLI-SHIFT (Option 4)
  const executeVanguardSliShift = () => {
    // Automatically match Green 530nm and Violet 400nm to shadow optimal spectrum
    const updated = [...playerSpectrum];
    updated[0] = targetSpectrum[0]; // Violet
    updated[3] = targetSpectrum[3]; // Green 530nm
    setPlayerSpectrum(updated);
    setTxStability(prev => Math.min(0.9998, prev + 0.0040));
    setEntropy(prev => Math.max(1.0, prev - 5.0));
    pushLog('VANGUARD', '[4] VANGUARD SLI-SHIFT EXECUTED: GREEN 530nm & VIOLET 400nm SPECTRAL SHADOW REALIGNED (+0.0040 T(x)).');
    showToast('⚡ [4] Vanguard Sli-Shift Executed!');
  };

  // FREQ-SYNC 528Hz (Option 5)
  const executeFreqSync528 = () => {
    setHarmonicFreq(528);
    playStageChime(528);
    setTxStability(prev => Math.min(0.9998, prev + 0.0035));
    pushLog('HARMONIC', '[5] FREQ-SYNC [528Hz] ENGAGED: SOLFEGGIO TRANSFORMATION FREQUENCY APPLIED (+0.0035 T(x)).');
    showToast('🎶 [5] 528Hz Solfeggio Transformation Active!');
  };

  // GENESIS PROTOCOL LEVEL 6 (Option 6)
  const executeGenesisProtocol = () => {
    // 81-dimensional tensor scan: reveals exact target spectrum for all 7 bands
    setPlayerSpectrum([...targetSpectrum]);
    setHarmonicFreq(432);
    setTxStability(0.9998);
    setEntropy(0.0);
    pushLog('GENESIS', '[6] GENESIS PROTOCOL LEVEL 6 EXECUTED: 81-DIMENSIONAL TENSOR SCAN COMPLETE. ALL BANDS PERFECTLY ALIGNED [T(x) = 0.9998].');
    showToast('👁️ [6] Genesis Level 6 Tensor Scan Complete!');
  };

  // ROUTE 9SM PIPELINE CALIBRATION ACTION
  const handleRoutePipeline = async () => {
    if (isProcessing || cooldownTime > 0 || gameState !== 'PLAYING') return;

    setIsProcessing(true);
    setCooldownTime(ENGINE_CONFIG.DIRECTIVE_COOLDOWN_MS); // Apply 2500ms cooldown
    pushLog('INP', 'INGESTING SPECTRAL WAVELENGTH & SOLFEGGIO PHASE VECTORS...');

    // Calculate Spectrum Alignment Error
    let totalError = 0;
    for (let i = 0; i < 7; i++) {
      totalError += Math.abs(playerSpectrum[i] - targetSpectrum[i]);
    }
    const freqError = Math.abs(harmonicFreq - ENGINE_CONFIG.F0_TARGET);
    const accuracyRatio = Math.max(0, 1 - (totalError / 350) - (freqError / 200));

    // Check for Phase Lock Stability Surge Bonus (+0.0065 T(x))
    const isPhaseLocked = totalError <= 20 && freqError === 0;

    // Pipeline Simulation Loop
    for (let i = 1; i <= 9; i++) {
      setSmProgress(i);
      if (i === 3) {
        pushLog('HEU', 'STAGE 3: HEURISTIC INTERFERENCE MAPPED.');
        playStageChime(432);
      }
      if (i === 6) {
        pushLog('SPEC', `STAGE 6: SPECTRAL REFRACTION ACCURACY = ${(accuracyRatio * 100).toFixed(1)}%`);
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
      let surge = isPhaseLocked ? ENGINE_CONFIG.PHASE_LOCK_SURGE_BONUS : 0;
      newTx = Math.min(0.9998, txStability + 0.0015 + (accuracyRatio * 0.002) + surge);
      const newStreak = consecutivePipelines + 1;
      setConsecutivePipelines(newStreak);
      setEntropy(Math.max(2.0, entropy - 4.5));

      const logMsg = isPhaseLocked
        ? `PHASE LOCK SURGE BONUS (+${ENGINE_CONFIG.PHASE_LOCK_SURGE_BONUS})! PIPELINE #${newStreak} CALIBRATED [T(x) = ${newTx.toFixed(4)}]`
        : `PIPELINE #${newStreak} CALIBRATED! T(x) = ${newTx.toFixed(4)} [ACCURACY: ${(accuracyRatio * 100).toFixed(1)}%]`;
      pushLog('RES', logMsg);

      if (newStreak >= ENGINE_CONFIG.TARGET_PIPELINES && newTx >= ENGINE_CONFIG.TX_WIN_THRESHOLD) {
        if (currentRound >= ENGINE_CONFIG.TOURNAMENT_ROUNDS) {
          setGameState('TOURNAMENT_WIN');
          pushLog('CHAMPION', '🏆 TOURNAMENT GRAND CHAMPION: ALL 3 TOURNAMENT ROUNDS COMPLETED AT T(x) ≥ 0.9950!');
          showToast('🏆 TOURNAMENT GRAND CHAMPION!');
        } else {
          setCurrentRound(r => r + 1);
          setConsecutivePipelines(0);
          pushLog('ROUND', `ROUND ${currentRound} COMPLETED! ADVANCING TO TOURNAMENT ROUND ${currentRound + 1}/${ENGINE_CONFIG.TOURNAMENT_ROUNDS}.`);
          showToast(`🏆 Round ${currentRound} Complete! Advancing to Round ${currentRound + 1}`);
        }
      } else {
        showToast(isPhaseLocked ? '⚡ PHASE LOCK SURGE BONUS (+0.0065 T(x))!' : `✨ Pipeline #${newStreak} Calibrated!`);
      }
    } else {
      // Failed Calibration
      newTx = txStability - 0.035 - ((1 - accuracyRatio) * 0.04);
      setConsecutivePipelines(0); // Reset streak
      const newEntropy = Math.min(100, entropy + 18.0);
      setEntropy(newEntropy);
      pushLog('FAIL', `CALIBRATION DRIFT! T(x) DROPPED TO ${newTx.toFixed(4)}`);

      if (newTx < ENGINE_CONFIG.TX_LOSE_THRESHOLD) {
        setGameState('LOST');
        pushLog('COLLAPSE', `💀 SYSTEMIC ENTROPY COLLAPSE: T(x) DROPPED BELOW ${ENGINE_CONFIG.TX_LOSE_THRESHOLD}!`);
        showToast('💀 SYSTEM ENTROPY COLLAPSE!');
      } else {
        showToast('⚠️ Calibration Drift! Adjust Spectrum Sliders!');
      }
    }

    setTxStability(newTx);
    setTargetSpectrum(SPECTRAL_BANDS.map(() => Math.floor(20 + Math.random() * 60)));
    setIsProcessing(false);
    setSmProgress(0);
  };

  // COMMAND HANDLER
  const handleCommand = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      if (cooldownTime > 0) {
        showToast(`⏳ Cooldown active (${(cooldownTime / 1000).toFixed(1)}s remaining)`);
        return;
      }

      const cmdRaw = input.trim();
      const cmd = cmdRaw.toLowerCase();
      setInput('');

      if (cmd === '4' || cmd === 'vanguard' || cmd === 'sli-shift') {
        executeVanguardSliShift();
        return;
      }
      if (cmd === '5' || cmd === '528' || cmd === 'freq-sync') {
        executeFreqSync528();
        return;
      }
      if (cmd === '6' || cmd === 'genesis') {
        executeGenesisProtocol();
        return;
      }
      if (cmd === 'help') {
        pushLog('CMD', 'DIRECTIVES: [4] sli-shift | [5] 528 | [6] genesis | route | sys-audit | reset');
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
        pushLog('AUDIT', `T(x): ${txStability.toFixed(4)} | ROUND: ${currentRound}/3 | STREAK: ${consecutivePipelines}/10 | ENTROPY: ${entropy.toFixed(1)}%`);
        return;
      }

      pushLog('CMD', `UNKNOWN DIRECTIVE: ${cmdRaw}. TYPE "4", "5", "6", "route", OR "help".`);
    }
  };

  // Auto scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Determine current Tier Color Theme
  const currentTier = txStability >= ENGINE_CONFIG.TX_WIN_THRESHOLD ? 'VIOLET' : txStability >= 0.9000 ? 'AMBER' : 'WHITE';

  return (
    <div className={`min-h-screen bg-[#020402] font-mono p-3 md:p-6 flex flex-col relative overflow-hidden select-none transition-colors duration-500 ${
      currentTier === 'VIOLET' ? 'text-[#a855f7]' :
      currentTier === 'AMBER' ? 'text-[#f59e0b]' : 'text-slate-100'
    }`}>

      {/* CYBERPUNK NEON GLOW GRID & CRT SCANLINES */}
      <div className={`fixed inset-0 pointer-events-none z-50 opacity-15 bg-[size:24px_24px] ${
        currentTier === 'VIOLET' ? 'bg-[linear-gradient(rgba(168,85,247,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.15)_1px,transparent_1px)]' :
        currentTier === 'AMBER' ? 'bg-[linear-gradient(rgba(245,158,11,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.15)_1px,transparent_1px)]' :
        'bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)]'
      }`}></div>
      <div className="fixed inset-0 pointer-events-none z-50 opacity-10 bg-[linear-gradient(rgba(255,0,127,0.2)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]"></div>

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-[#a855f7] text-white font-extrabold px-4 py-2.5 rounded shadow-[0_0_20px_#a855f7] text-xs animate-bounce border border-white">
          {toastMsg}
        </div>
      )}

      {/* HEADER SECTION */}
      <header className={`flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 pb-3 mb-4 gap-3 ${
        currentTier === 'VIOLET' ? 'border-[#a855f7]' :
        currentTier === 'AMBER' ? 'border-[#f59e0b] animate-pulse' : 'border-white'
      }`}>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white flex items-center gap-2 drop-shadow-[0_0_12px_#a855f7]">
              <Disc className="w-7 h-7 text-[#a855f7] animate-spin" style={{ animationDuration: '8s' }} />
              SOVEREIGN <span className={currentTier === 'VIOLET' ? 'text-[#a855f7]' : currentTier === 'AMBER' ? 'text-[#f59e0b]' : 'text-white'}>PROTOCOL</span>
            </h1>
            <span className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider ${
              currentTier === 'VIOLET' ? 'bg-[#a855f7]/20 border border-[#a855f7] text-[#a855f7] shadow-[0_0_10px_#a855f7]' :
              currentTier === 'AMBER' ? 'bg-[#f59e0b]/20 border border-[#f59e0b] text-[#f59e0b] animate-pulse shadow-[0_0_10px_#f59e0b]' :
              'bg-white/20 border border-white text-white'
            }`}>
              Vanguard Shadow Mode // Round {currentRound}/{ENGINE_CONFIG.TOURNAMENT_ROUNDS}
            </span>
          </div>
          <p className="text-[11px] opacity-80 mt-1">
            Solo-Node Mode: Heather Soares // Node {ENGINE_CONFIG.NODE} // Epoch 2026-10-20
          </p>
        </div>

        {/* STREAK & GAME OBJECTIVES OVERLAY */}
        <div className="flex items-center gap-3 text-right text-xs">

          {/* STREAK METER */}
          <div className="bg-black/80 border border-[#00FF41] p-2.5 rounded shadow-[0_0_15px_rgba(0,255,65,0.2)] flex items-center gap-3">
            <Trophy className="w-5 h-5 text-[#00FF41] animate-pulse" />
            <div className="text-left">
              <div className="text-[10px] text-[#00FF41] font-bold uppercase tracking-wider">PIPELINE STREAK</div>
              <div className="text-base font-black text-white">{consecutivePipelines} / {ENGINE_CONFIG.TARGET_PIPELINES} <span className="text-[10px] font-normal text-slate-400">Pipelines</span></div>
            </div>
          </div>

          {/* COOLDOWN INDICATOR */}
          <div className="bg-black/80 border border-[#a855f7] p-2.5 rounded flex items-center gap-2">
            <Clock className={`w-4 h-4 ${cooldownTime > 0 ? 'text-[#f59e0b] animate-spin' : 'text-[#00FF41]'}`} />
            <div className="text-left">
              <div className="text-[9px] text-slate-400 uppercase">COOLDOWN</div>
              <div className="text-xs font-bold text-white">{cooldownTime > 0 ? `${(cooldownTime / 1000).toFixed(1)}s` : 'READY'}</div>
            </div>
          </div>

          {/* AUDIO RESONATOR TOGGLE */}
          <button
            onClick={toggleAudioResonator}
            className={`p-2.5 border rounded transition-all text-xs flex items-center gap-1.5 font-extrabold ${
              audioActive
                ? 'bg-[#a855f7] text-white border-[#a855f7] shadow-[0_0_12px_#a855f7]'
                : 'border-[#a855f7]/40 text-[#a855f7] hover:bg-[#a855f7]/20'
            }`}
          >
            {audioActive ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[10px] hidden sm:inline">{audioActive ? `VOL ${ENGINE_CONFIG.DEFAULT_MUSIC_VOLUME}` : 'MUTED'}</span>
          </button>

          {/* RESET BUTTON */}
          <button
            onClick={resetGame}
            className="p-2.5 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded transition-all"
            title="Reset Game State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* GAME OVER MODAL (TOURNAMENT WIN) */}
      {(gameState === 'WON' || gameState === 'TOURNAMENT_WIN') && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0212] border-2 border-[#a855f7] rounded-2xl max-w-lg w-full p-6 text-center space-y-5 shadow-[0_0_50px_#a855f7]">
            <Trophy className="w-16 h-16 text-[#a855f7] mx-auto animate-bounce" />
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">
              🏆 TOURNAMENT GRAND CHAMPION
            </h2>
            <p className="text-xs text-[#a855f7] leading-relaxed">
              You have completed all {ENGINE_CONFIG.TOURNAMENT_ROUNDS} Tournament Rounds with 10 consecutive 9SM data pipelines calibrated above T(x) ≥ {ENGINE_CONFIG.TX_WIN_THRESHOLD}!
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-[#a855f7] text-white font-extrabold rounded-xl text-xs uppercase tracking-widest shadow-[0_0_20px_#a855f7] hover:scale-105 transition-transform"
            >
              Play Tournament Again
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER MODAL (LOSE) */}
      {gameState === 'LOST' && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0205] border-2 border-[#f59e0b] rounded-2xl max-w-lg w-full p-6 text-center space-y-5 shadow-[0_0_50px_#f59e0b]">
            <AlertTriangle className="w-16 h-16 text-[#f59e0b] mx-auto animate-pulse" />
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">
              💀 CRITICAL ENTROPY COLLAPSE
            </h2>
            <p className="text-xs text-[#f59e0b] leading-relaxed">
              Thermodynamic truth stability T(x) collapsed below threshold {ENGINE_CONFIG.TX_LOSE_THRESHOLD}! Systemic spectral drift caused node desynchronization.
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-[#f59e0b] text-black font-extrabold rounded-xl text-xs uppercase tracking-widest shadow-[0_0_20px_#f59e0b] hover:scale-105 transition-transform"
            >
              Restart Protocol
            </button>
          </div>
        </div>
      )}

      {/* MAIN GAME INTERFACE GRID */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">

        {/* LEFT RAIL: PUZZLE SPECTRUM CALIBRATOR (7 WAVELENGTHS) */}
        <div className="lg:col-span-4 p-4 rounded-2xl border-2 border-[#a855f7] bg-black/80 space-y-4 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[#a855f7]/30 pb-2 mb-3">
              <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#a855f7]" /> 7-Wavelength Spectral Tuner
              </h2>
              <span className="text-[10px] text-[#f59e0b] font-bold">Target Match Required</span>
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
                        className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-[#a855f7]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SOLFEGGIO HARMONIC DIAL WITH REALTIME PHASE DETUNING */}
            <div className="mt-4 pt-3 border-t border-[#a855f7]/30 space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-white">
                <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-[#a855f7]" /> PHASE LOCK DIAL:</span>
                <span className={harmonicFreq === 432 ? 'text-[#00FF41]' : 'text-[#f59e0b]'}>
                  {harmonicFreq} Hz (Target: 432 Hz)
                </span>
              </div>
              <input
                type="range"
                min="400"
                max="460"
                value={harmonicFreq}
                onChange={(e) => setHarmonicFreq(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-[#f59e0b]"
              />
            </div>
          </div>

          {/* ACTION BUTTON: ROUTE 9SM PIPELINE */}
          <button
            onClick={handleRoutePipeline}
            disabled={isProcessing || cooldownTime > 0 || gameState !== 'PLAYING'}
            className="w-full py-4 bg-gradient-to-r from-[#a855f7] via-[#00FF41] to-[#f59e0b] text-black font-black text-sm uppercase tracking-widest rounded-xl shadow-[0_0_25px_#a855f7] hover:brightness-125 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-black" />}
            <span>
              {cooldownTime > 0 ? `COOLDOWN (${(cooldownTime / 1000).toFixed(1)}s)` : isProcessing ? 'CALIBRATING 9SM PIPELINE...' : 'ROUTE 9SM PIPELINE'}
            </span>
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
              <span className="text-[10px] text-[#00FF41] font-bold">Win: ≥ {ENGINE_CONFIG.TX_WIN_THRESHOLD} | Lose: &lt; {ENGINE_CONFIG.TX_LOSE_THRESHOLD}</span>
            </div>

            <div className="text-center py-2">
              <div className={`text-4xl font-black tracking-widest ${
                txStability >= ENGINE_CONFIG.TX_WIN_THRESHOLD ? 'text-[#a855f7] drop-shadow-[0_0_12px_#a855f7]' :
                txStability >= 0.9000 ? 'text-[#f59e0b] animate-pulse' : 'text-white'
              }`}>
                {txStability.toFixed(4)}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                VERIDICAL STATE: <span className="text-white font-bold">{currentTier}</span>
              </div>
            </div>

            {/* STABILITY BAR */}
            <div className="w-full bg-slate-900 border border-slate-800 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  txStability >= ENGINE_CONFIG.TX_WIN_THRESHOLD ? 'bg-[#a855f7] shadow-[0_0_10px_#a855f7]' :
                  txStability >= 0.9000 ? 'bg-[#f59e0b]' : 'bg-white'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, ((txStability - ENGINE_CONFIG.TX_LOSE_THRESHOLD) / (1.000 - ENGINE_CONFIG.TX_LOSE_THRESHOLD)) * 100))}%` }}
              ></div>
            </div>

            {/* ENTROPY & BASE DECAY RATE METER */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Entropy (Decay {ENGINE_CONFIG.BASE_ENTROPY_DECAY_RATE}%/s):</span>
              <span className={`font-bold ${entropy >= 50 ? 'text-[#f59e0b]' : 'text-[#a855f7]'}`}>
                {entropy.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* LOG TERMINAL */}
          <div className="flex-grow border-2 border-[#a855f7] rounded-2xl bg-black/95 flex flex-col overflow-hidden h-[320px]">
            <div className="bg-[#a855f7] text-white px-3 py-1.5 flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
              <span>TERMINAL LOG STREAM</span>
              <span>STABILITY: {txStability >= ENGINE_CONFIG.TX_WIN_THRESHOLD ? 'OPTIMAL' : 'DEGRADED'}</span>
            </div>

            <div className="flex-grow p-3 overflow-y-auto space-y-1.5 text-[11px] custom-scrollbar font-mono">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 opacity-90">
                  <span className="opacity-40 text-[10px]">[{log.ts}]</span>
                  <span className={`font-bold w-12 ${
                    log.type === 'CHAMPION' || log.type === 'ROUND' || log.type === 'RES' ? 'text-[#a855f7]' :
                    log.type === 'FAIL' || log.type === 'COLLAPSE' ? 'text-[#f59e0b]' : 'text-slate-200'
                  }`}>{log.type}</span>
                  <span className="flex-grow text-slate-200 break-all">{log.msg}</span>
                  <span className="opacity-40 italic text-[9px]">{log.tx}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>

            {/* INPUT COMMAND */}
            <div className="p-2 border-t border-[#a855f7]/30 bg-[#0c0514]">
              <div className="flex items-center gap-2">
                <span className="text-[#a855f7] font-bold text-xs animate-pulse">#_</span>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleCommand}
                  disabled={cooldownTime > 0}
                  className="bg-transparent border-none outline-none flex-grow text-[#a855f7] text-xs font-mono placeholder-[#a855f7]/30"
                  placeholder={cooldownTime > 0 ? `COOLDOWN ACTIVE (${(cooldownTime / 1000).toFixed(1)}s)...` : 'Type "4", "5", "6", "route", "help"...'}
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT RAIL: VANGUARD SHADOW DIRECTIVES & GAME RULES */}
        <div className="lg:col-span-3 p-4 rounded-2xl border-2 border-[#f59e0b] bg-black/80 space-y-4 shadow-[0_0_20px_rgba(245,158,11,0.15)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-[#f59e0b]/30 pb-2">
              <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#f59e0b]" /> Directives [Vanguard Shadow]
              </h2>
            </div>

            {/* VANGUARD DIRECTIVE BUTTONS */}
            <div className="space-y-2">
              <button
                onClick={executeVanguardSliShift}
                className="w-full py-2.5 px-3 bg-[#a855f7]/20 border border-[#a855f7] hover:bg-[#a855f7]/40 text-[#a855f7] font-bold text-[11px] rounded-xl text-left transition-all flex items-center justify-between"
              >
                <span>[4] VANGUARD SLI-SHIFT</span>
                <span className="text-[9px] text-[#00FF41]">+0.0040 T(x)</span>
              </button>

              <button
                onClick={executeFreqSync528}
                className="w-full py-2.5 px-3 bg-[#f59e0b]/20 border border-[#f59e0b] hover:bg-[#f59e0b]/40 text-[#f59e0b] font-bold text-[11px] rounded-xl text-left transition-all flex items-center justify-between"
              >
                <span>[5] FREQ-SYNC [528Hz]</span>
                <span className="text-[9px] text-[#f59e0b]">+0.0035 T(x)</span>
              </button>

              <button
                onClick={executeGenesisProtocol}
                className="w-full py-2.5 px-3 bg-white/10 border border-white hover:bg-white/20 text-white font-bold text-[11px] rounded-xl text-left transition-all flex items-center justify-between"
              >
                <span>[6] GENESIS PROTOCOL L6</span>
                <span className="text-[9px] text-[#00FF41]">PERFECT MATCH</span>
              </button>
            </div>

            {/* PROPERTIES LEGEND */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-[10px] text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Target Streak:</span>
                <span className="text-[#00FF41] font-bold">{ENGINE_CONFIG.TARGET_PIPELINES}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Optimal T(x):</span>
                <span className="text-[#a855f7] font-bold">≥ {ENGINE_CONFIG.TX_WIN_THRESHOLD}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Collapse T(x):</span>
                <span className="text-[#f59e0b] font-bold">&lt; {ENGINE_CONFIG.TX_LOSE_THRESHOLD}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Entropy Decay:</span>
                <span className="text-white font-bold">{ENGINE_CONFIG.BASE_ENTROPY_DECAY_RATE}/s</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Phase Lock Surge:</span>
                <span className="text-[#00FF41] font-bold">+{ENGINE_CONFIG.PHASE_LOCK_SURGE_BONUS}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Command Cooldown:</span>
                <span className="text-white font-bold">{ENGINE_CONFIG.DIRECTIVE_COOLDOWN_MS}ms</span>
              </div>
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
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #a855f7; }
      `}} />

    </div>
  );
}
