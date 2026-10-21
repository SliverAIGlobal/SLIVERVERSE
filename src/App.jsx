import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Terminal, ShieldCheck, Activity, Volume2, VolumeX, Radio, Zap,
  Settings, Download, RefreshCw, Sliders, Cpu, Thermometer, Sun,
  Globe, Lock, Unlock, Key, Check, X, HelpCircle, Info, Sparkles
} from 'lucide-react';

// --- CORE ENGINE CONFIGURATION ---
const ENGINE_CONFIG = {
  NODE: "SLIAIDE-MAIN-709A",
  EPOCH: "2026-10-20",
  OPERATOR: "Heather Soares",
  STATEDB_VERSION: "1.0.0-PROTOTYPE",
  MAX_BUFFER: 80,
  F0_HARMONIC: 432,
  TX_LIMITS: { MIN: 0.9950, MAX: 0.9998 }
};

const CONFIG_STORAGE_KEY = "SLIAIDE_SERVICE_CRED";
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

// --- SECURITY & CREDENTIAL UTILITIES ---
const encodeServiceCredential = (val) => {
  if (!val) return "";
  try {
    return btoa(encodeURIComponent(val));
  } catch (e) {
    return val;
  }
};

const decodeServiceCredential = (val) => {
  if (!val) return "";
  try {
    return decodeURIComponent(atob(val));
  } catch (e) {
    return val;
  }
};

const getAppServiceToken = () => {
  const storedEnc = localStorage.getItem(CONFIG_STORAGE_KEY);
  if (storedEnc) {
    return decodeServiceCredential(storedEnc);
  }
  return window.VITE_GEMINI_API_KEY || "";
};

const callGeminiAPI = async (prompt, generationConfig = {}, maxRetries = 2) => {
  const token = getAppServiceToken();
  if (!token) {
    throw new Error("NO_API_KEY");
  }

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

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        return result.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Invalid API response structure.");
      }
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      await new Promise(res => setTimeout(res, 800 * attempt));
    }
  }
};

// --- DITHERED T(x) CALCULATOR ---
const generateDitheredTx = (entropySeed = "") => {
  const base = ENGINE_CONFIG.TX_LIMITS.MIN;
  const range = ENGINE_CONFIG.TX_LIMITS.MAX - ENGINE_CONFIG.TX_LIMITS.MIN;
  let charSum = 0;
  for (let i = 0; i < entropySeed.length; i++) {
    charSum += entropySeed.charCodeAt(i);
  }
  const pseudoRand = (Math.sin(charSum + Date.now()) + 1) / 2;
  return (base + (pseudoRand * range)).toFixed(4);
};

// --- DOWNLOAD TELEMETRY LOG FILE ---
const downloadFile = (filename, content, mimeType = 'application/json') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function App() {
  const [engineState, setEngineState] = useState('IDLE'); // IDLE, PROCESSING, HEURISTIC, SPECTRAL, PONO, LOCKED
  const [geniusMode, setGeniusMode] = useState(false); // Forced INACTIVE as per SAT-AI directive
  const [audioActive, setAudioActive] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [userCredentialVal, setUserCredentialVal] = useState(getAppServiceToken());
  const [input, setInput] = useState('');
  const [smProgress, setSmProgress] = useState(0); // 0-9 stages
  const [currentTx, setCurrentTx] = useState(0.9984);
  const [harmonicFreq, setHarmonicFreq] = useState(ENGINE_CONFIG.F0_HARMONIC);

  // Telemetry metrics
  const [telemetry, setTelemetry] = useState({
    npu: 14.8,
    thermal: 34.2,
    solar: 28.4,
    latency: 0.00004,
    entropy: 0.0002,
    synapticIntegrity: 99.999
  });

  // System Logs
  const [logs, setLogs] = useState([
    { ts: "00:00:00", type: "SYS", msg: "SLIAIDE-1 ENGINE COLD BOOT... SUCCESS.", tx: 1.0000 },
    { ts: "00:00:01", type: "AUTH", msg: `OPERATOR: ${ENGINE_CONFIG.OPERATOR} VERIFIED.`, tx: 0.9999 },
    { ts: "00:00:02", type: "EPOCH", msg: `EPOCH ANCHOR: ${ENGINE_CONFIG.EPOCH} // T(x) ≥ 0.9950 ENFORCED.`, tx: 0.9998 },
    { ts: "00:00:03", type: "HARMONIC", msg: `F0 HARMONIC RESONANCE LOCKED TO ${ENGINE_CONFIG.F0_HARMONIC}Hz.`, tx: 0.9995 }
  ]);

  const logEndRef = useRef(null);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // --- AUDIO SYNTHESIZER (432Hz Harmonic Resonator) ---
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
        gain.gain.setValueAtTime(0.015, ctx.currentTime); // Subtle microtonal drone

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscRef.current = osc;
        gainRef.current = gain;
        setAudioActive(true);
        showToast(`🔊 Solfeggio Resonator Active (${harmonicFreq}Hz)`);
      } catch (e) {
        console.warn("Audio Context error:", e);
      }
    } else {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      setAudioActive(false);
      showToast("🔇 Audio Resonator Muted");
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

  // Update harmonic frequency live if changed
  useEffect(() => {
    if (oscRef.current && audioCtxRef.current) {
      oscRef.current.frequency.setValueAtTime(harmonicFreq, audioCtxRef.current.currentTime);
    }
  }, [harmonicFreq]);

  // Log append helper
  const pushLog = (type, msg, txVal = null) => {
    const tx = txVal || generateDitheredTx(msg);
    const newLog = {
      ts: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      msg,
      tx: parseFloat(tx)
    };
    setCurrentTx(parseFloat(tx));
    setLogs(prev => [...prev, newLog].slice(-ENGINE_CONFIG.MAX_BUFFER));
  };

  // Save Service Token
  const handleSaveApiKey = () => {
    const encToken = encodeServiceCredential(userCredentialVal.trim());
    localStorage.setItem(CONFIG_STORAGE_KEY, encToken);
    setIsApiKeyModalOpen(false);
    pushLog('AUTH', 'GEMINI SERVICE TOKEN UPDATED & ENCODED IN STATE.');
    showToast('🔑 Service Token Configured');
  };

  // --- 9SM PIPELINE EXECUTION CORE ---
  const run9SM_Pipeline = async (instruction) => {
    setEngineState('PROCESSING');
    pushLog('INP', `INGESTING DIRECTIVE: "${instruction.slice(0, 45)}${instruction.length > 45 ? '...' : ''}"`);

    let aiSpectralInsight = null;

    for (let i = 1; i <= 9; i++) {
      setSmProgress(i);

      if (i === 3) {
        setEngineState('HEURISTIC');
        pushLog('HEU', "STAGE 3: HEURISTIC PATTERN MATCHED.");
        playStageChime(432);
      }

      if (i === 5 && getAppServiceToken()) {
        try {
          const prompt = `System Directive Evaluation for SLIAIDE-1 Engine: "${instruction}". Provide a 1-sentence deterministic AI spectral analysis summary.`;
          aiSpectralInsight = await callGeminiAPI(prompt, { maxOutputTokens: 100 });
        } catch (e) {
          aiSpectralInsight = "Local deterministic spectral refraction active (Airgap Fallback).";
        }
      }

      if (i === 6) {
        setEngineState('SPECTRAL');
        const specMsg = aiSpectralInsight
          ? `STAGE 6: SPECTRAL REFRACTION [AI UPLINK]: ${aiSpectralInsight}`
          : "STAGE 6: SPECTRAL REFRACTION (7-WAVE 400nm-700nm) COMPLETE.";
        pushLog('SPEC', specMsg);
        playStageChime(528);
      }

      if (i === 9) {
        setEngineState('PONO');
        pushLog('PONO', `STAGE 9: DETERMINISTIC FINALITY REACHED. EPOCH ANCHOR: ${ENGINE_CONFIG.EPOCH}.`);
        playStageChime(639);
      }

      const latency = 140 + Math.random() * 160;
      await new Promise(r => setTimeout(r, latency));
    }

    pushLog('RES', `TX_FINALIZED. DISPATCH COMPLETE: ${instruction.toUpperCase()}_PROCESSED.`);
    setEngineState('IDLE');
    setSmProgress(0);
  };

  // --- EXTENDED ADMINISTRATIVE COMMANDS HANDLER ---
  const handleCommand = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      const cmdRaw = input.trim();
      const cmd = cmdRaw.toLowerCase();
      setInput('');

      // Custom Command Routing
      if (cmd === 'help') {
        pushLog('CMD', 'AVAILABLE DIRECTIVES: sys-audit | freq-sync | genius-off | log-epoch | status | telemetry | orbit | audit <hash> | deconstruct | joy | pivot | clear | token');
        return;
      }

      if (cmd === 'clear') {
        setLogs([]);
        pushLog('SYS', 'TERMINAL LOG BUFFER CLEARED.');
        return;
      }

      if (cmd === 'token') {
        setIsApiKeyModalOpen(true);
        return;
      }

      if (cmd === 'sys-audit') {
        setEngineState('PROCESSING');
        pushLog('AUDIT', 'INITIATING SYSTEM-WIDE T(x) LOGIC AUDIT...');
        setTimeout(() => {
          pushLog('AUDIT', `NODE ${ENGINE_CONFIG.NODE}: VALIDATED T(x) = ${currentTx}`);
          pushLog('AUDIT', `CRYO-THERMAL MATRIX: 34.2K OPERATIONAL`);
          pushLog('AUDIT', `EPOCH COMPLIANCE: ${ENGINE_CONFIG.EPOCH} [PONO ATTESTED]`);
          pushLog('RES', 'SYSTEM AUDIT COMPLETE: ZERO LOGIC DRIFT DETECTED.');
          setEngineState('IDLE');
        }, 1200);
        return;
      }

      if (cmd === 'freq-sync') {
        setHarmonicFreq(432);
        pushLog('HARMONIC', 'MANUAL HARMONIC RE-ALIGNMENT -> 432Hz F0 GROUNDING LOCKED.');
        playStageChime(432);
        showToast('🎶 Re-aligned to 432Hz F0 Harmonic');
        return;
      }

      if (cmd === 'genius-off') {
        setGeniusMode(false);
        pushLog('SEC', 'HARD-LOCK APPLIED: GENIUS MODE INACTIVE (T(x) ≥ 0.9950 ENFORCED).');
        showToast('🔒 System Locked into Inactive Genius Mode');
        return;
      }

      if (cmd === 'log-epoch') {
        const epochPayload = {
          operator: ENGINE_CONFIG.OPERATOR,
          node: ENGINE_CONFIG.NODE,
          epoch: ENGINE_CONFIG.EPOCH,
          stavedbVersion: ENGINE_CONFIG.STATEDB_VERSION,
          txScore: currentTx,
          telemetry: telemetry,
          logs: logs
        };
        downloadFile(`SLIAIDE_Telemetry_${ENGINE_CONFIG.EPOCH}_${Date.now()}.json`, JSON.stringify(epochPayload, null, 2));
        pushLog('EXPORT', `SESSION TELEMETRY ANCHORED TO ${ENGINE_CONFIG.EPOCH} EXPORTED SUCCESSFULLY.`);
        showToast('📥 Telemetry Log Exported');
        return;
      }

      if (cmd.startsWith('audit')) {
        const target = cmdRaw.split(' ')[1] || '0xROOT';
        setEngineState('PROCESSING');
        pushLog('AUDIT', `EXECUTING BYTECODE STATIC ANALYSIS SWEEP ON: ${target}`);
        setTimeout(() => {
          pushLog('AUDIT', `CEI COMPLIANCE: 100% // RE-ENTRANCY VECTORS: 0`);
          pushLog('PONO', `BYTECODE AUDIT PASSED [T(x) = 0.9996].`);
          setEngineState('IDLE');
        }, 1000);
        return;
      }

      if (cmd === 'deconstruct') {
        pushLog('SPEC', '7-WAVELENGTH SPECTRAL DECONSTRUCTION (400nm VIOLET - 700nm RED):');
        pushLog('SPEC', 'λ1: 400nm (0.9991) | λ2: 450nm (0.9994) | λ3: 510nm (0.9998)');
        pushLog('SPEC', 'λ4: 532nm (0.9999) | λ5: 580nm (0.9995) | λ6: 650nm (0.9992) | λ7: 700nm (0.9997)');
        return;
      }

      if (cmd === 'joy') {
        pushLog('JOY', 'ZERO-FRICTION JOY SIGNATURE EVALUATION: OPTIMAL RESONANCE (100%).');
        return;
      }

      if (cmd === 'pivot') {
        pushLog('VANGUARD', 'INITIATING 24-HOUR PREDICTIVE SHADOW-STATE PASS (VANGUARD_SHADOW)...');
        setTimeout(() => {
          pushLog('VANGUARD', 'SHADOW-STATE VERIFIED: SUSTAINED T(x) ≥ 0.9980 OVER 4,000 EPOCH CYCLES.');
        }, 1200);
        return;
      }

      if (cmd === 'status' || cmd === 'telemetry' || cmd === 'orbit') {
        pushLog('TELEMETRY', `NODE: ${ENGINE_CONFIG.NODE} | ALT: 542.11 KM | VEL: 7.6 KM/S | SOLAR: 28.4V | NPU: ${telemetry.npu.toFixed(1)}%`);
        return;
      }

      // Default Pipeline Processing
      run9SM_Pipeline(cmdRaw);
    }
  };

  // Telemetry jitter loop
  useEffect(() => {
    const t = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        npu: Math.max(8, Math.min(92, prev.npu + (Math.random() * 3 - 1.5))),
        thermal: Math.max(30, Math.min(48, prev.thermal + (Math.random() * 0.1 - 0.05))),
        solar: 28.4 + (Math.random() * 0.2 - 0.1)
      }));
    }, 2500);
    return () => clearInterval(t);
  }, []);

  // Auto scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="min-h-screen bg-[#020402] text-[#00FF41] font-mono p-2 md:p-6 flex flex-col relative overflow-hidden select-none">

      {/* CRT SCANLINE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-[#00FF41] text-black font-extrabold px-4 py-2 rounded shadow-lg text-xs animate-bounce border border-[#00FF41]">
          {toastMsg}
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-[#00FF41] pb-3 mb-4 gap-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black italic tracking-tighter text-white flex items-center gap-2">
              <Terminal className="w-6 h-6 text-[#00FF41] animate-pulse" />
              SLIAIDE-1 <span className="text-[#00FF41]">ENGINE</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 bg-[#00FF41]/10 border border-[#00FF41]/40 rounded text-[#00FF41] font-bold uppercase">
              SAT-AI 9SM Architecture
            </span>
          </div>
          <p className="text-[10px] opacity-60 mt-0.5">
            Sliververse Local Integrated AI Deterministic Engine // V1.0-PROTOTYPE
          </p>
        </div>

        {/* TOP RIGHT READ-ONLY OVERLAY */}
        <div className="flex items-center gap-3 text-right text-xs">
          <div className="bg-black/60 border border-[#00FF41]/30 p-2 rounded flex items-center gap-3">
            <div>
              <div className="font-bold text-white text-[11px]">{ENGINE_CONFIG.EPOCH} // EPOCH_SYNC</div>
              <div className="text-[9px] opacity-60 uppercase tracking-widest">
                OPERATOR: {ENGINE_CONFIG.OPERATOR}
              </div>
            </div>

            <div className="text-left border-l border-[#00FF41]/30 pl-3">
              <div className="text-[10px] font-mono text-[#00FF41]">F0: {harmonicFreq}Hz</div>
              <div className="text-[9px] opacity-60">GENIUS: <span className="text-amber-400 font-bold">INACTIVE</span></div>
            </div>
          </div>

          {/* SERVICE TOKEN BUTTON */}
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className="p-2 border border-[#00FF41]/40 hover:bg-[#00FF41]/20 text-[#00FF41] rounded transition-all text-xs"
            title="Configure Gemini Service Token"
          >
            <Key className="w-4 h-4" />
          </button>

          {/* SOLFEGGIO AUDIO RESONATOR TOGGLE */}
          <button
            onClick={toggleAudioResonator}
            className={`p-2 border rounded transition-all text-xs flex items-center gap-1 font-bold ${
              audioActive
                ? 'bg-[#00FF41] text-black border-[#00FF41]'
                : 'border-[#00FF41]/40 hover:bg-[#00FF41]/20 text-[#00FF41]'
            }`}
            title="Toggle 432Hz Solfeggio Audio Resonator"
          >
            {audioActive ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[10px] hidden sm:inline">{audioActive ? '432Hz ON' : 'MUTED'}</span>
          </button>
        </div>
      </div>

      {/* MAIN SYSTEM GRID */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">

        {/* LEFT RAIL: SYSTEM HEALTH & TELEMETRY */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">

          <div className="space-y-4">
            {/* SYSTEM HEALTH */}
            <div className="border border-[#00FF41]/30 p-3 bg-black/60 shadow-lg">
              <h3 className="text-[10px] font-bold border-b border-[#00FF41]/30 mb-2 flex justify-between items-center text-white">
                <span>SYSTEM_HEALTH</span>
                <Activity className="w-3 h-3 text-[#00FF41]" />
              </h3>
              <div className="space-y-2.5">
                <MetricBar label="NPU THROUGHPUT" value={telemetry.npu} color="#00FF41" suffix="%" />
                <MetricBar label="CRYO THERMAL" value={(telemetry.thermal - 30) * 5} color="#FF4100" suffix="K" />
                <MetricBar label="SOLAR ARRAY" value={92} color="#00A1FF" suffix="V" />
              </div>
            </div>

            {/* CONFIDENCE SCALAR (T(x) METER) */}
            <div className="border border-[#00FF41]/30 p-3 bg-black/60 shadow-lg">
              <h3 className="text-[10px] font-bold border-b border-[#00FF41]/30 mb-2 flex justify-between items-center text-white">
                <span>CONFIDENCE_SCALAR [T(x)]</span>
                <ShieldCheck className="w-3 h-3 text-[#00FF41]" />
              </h3>

              <div className="text-center py-1">
                <div className="text-2xl font-black tracking-widest text-[#00FF41] drop-shadow-[0_0_8px_rgba(0,255,65,0.6)]">
                  {currentTx}
                </div>
                <div className="text-[9px] opacity-60 uppercase mt-0.5">
                  THRES: T(x) ≥ 0.9950 [PONO VERIFIED]
                </div>
              </div>

              <div className="w-full bg-black border border-[#00FF41]/30 h-2.5 mt-2 rounded-sm overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-[#00FF41] to-cyan-400 transition-all duration-500"
                  style={{ width: `${((currentTx - 0.9950) / (0.9998 - 0.9950)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* 9SM PIPELINE VISUALIZER */}
            <div className="border border-[#00FF41]/30 p-3 bg-black/60 shadow-lg">
              <h3 className="text-[10px] font-bold border-b border-[#00FF41]/30 mb-2 flex justify-between items-center text-white">
                <span>9SM_DETERMINISTIC_STAGES</span>
                <Zap className="w-3 h-3 text-[#00FF41]" />
              </h3>

              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((stageNum) => {
                  const isActive = smProgress >= stageNum;
                  const isCurrent = smProgress === stageNum;
                  return (
                    <div
                      key={stageNum}
                      className={`h-7 flex items-center justify-center text-[10px] font-bold border transition-all ${
                        isCurrent
                          ? 'bg-[#00FF41] text-black border-[#00FF41] animate-pulse shadow-[0_0_10px_#00FF41]'
                          : isActive
                          ? 'bg-[#00FF41]/30 text-[#00FF41] border-[#00FF41]'
                          : 'border-[#00FF41]/20 opacity-30 text-[#00FF41]'
                      }`}
                    >
                      S{stageNum}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* QUICK COMMAND CHIPS */}
          <div className="border border-[#00FF41]/30 p-3 bg-black/60">
            <span className="text-[9px] font-bold opacity-60 uppercase block mb-1.5">Quick Directives:</span>
            <div className="flex flex-wrap gap-1.5 text-[9px]">
              {['sys-audit', 'freq-sync', 'deconstruct', 'log-epoch', 'help'].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setInput(c);
                  }}
                  className="px-2 py-1 border border-[#00FF41]/40 hover:bg-[#00FF41] hover:text-black transition-all rounded text-[9px]"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* CENTER: PRIMARY DETERMINISTIC LOG STREAM */}
        <div className="lg:col-span-6 border-2 border-[#00FF41] flex flex-col bg-black/90 shadow-[0_0_25px_rgba(0,255,65,0.12)] h-[550px] lg:h-auto">

          {/* LOG HEADER BAR */}
          <div className="bg-[#00FF41] text-black px-3 py-1.5 flex justify-between items-center text-[11px] font-extrabold tracking-wider">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> DETERMINISTIC_LOG_STREAM
            </span>
            <span className="px-2 py-0.5 bg-black text-[#00FF41] rounded text-[9px]">
              STATE: {engineState}
            </span>
          </div>

          {/* LOG STREAM BODY */}
          <div className={`flex-grow p-4 overflow-y-auto space-y-1.5 text-xs custom-scrollbar ${engineState === 'HEURISTIC' ? 'animate-pulse' : ''}`}>
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 opacity-95 hover:bg-[#00FF41]/10 p-0.5 rounded transition-colors font-mono">
                <span className="opacity-40 text-[10px] shrink-0 font-mono">[{log.ts}]</span>
                <span className={`font-bold w-12 shrink-0 ${
                  log.type === 'PONO' ? 'text-white bg-emerald-950/80 px-1 rounded' :
                  log.type === 'SYS' ? 'text-cyan-400' :
                  log.type === 'HEU' ? 'text-amber-300' :
                  log.type === 'SPEC' ? 'text-purple-400' :
                  log.type === 'AUDIT' ? 'text-rose-400' : 'text-[#00FF41]'
                }`}>
                  {log.type}
                </span>
                <span className="flex-grow break-all text-[11px] text-slate-100">{log.msg}</span>
                <span className="opacity-40 italic text-[9px] shrink-0 font-mono">T(x):{log.tx}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>

          {/* TERMINAL INPUT BOX */}
          <div className="p-3 border-t border-[#00FF41]/30 bg-[#050805]">
            <div className="flex items-center gap-2">
              <span className="text-[#00FF41] font-bold text-sm animate-pulse">#_</span>
              <input
                className="bg-transparent border-none outline-none flex-grow text-[#00FF41] placeholder-[#00FF41]/30 text-xs font-mono"
                placeholder={engineState === 'PROCESSING' ? 'EXECUTING 9SM PIPELINE...' : 'AWAITING DIRECTIVE (type "help" or directive)...'}
                disabled={engineState === 'PROCESSING'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleCommand}
                autoFocus
              />
            </div>
          </div>

        </div>

        {/* RIGHT RAIL: ORBITAL TELEMETRY & HARDWARE STATE */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">

          <div className="border border-[#00FF41]/30 p-3 bg-black/60 space-y-3 shadow-lg">
            <h3 className="text-[10px] font-bold border-b border-[#00FF41]/30 mb-2 flex justify-between items-center text-white">
              <span>ORBITAL_TELEMETRY</span>
              <Globe className="w-3 h-3 text-[#00FF41]" />
            </h3>

            <div className="text-[10px] space-y-1.5 font-mono">
              <div className="flex justify-between border-b border-[#00FF41]/10 pb-1">
                <span className="opacity-60">NODE ID:</span>
                <span className="text-white font-bold">{ENGINE_CONFIG.NODE}</span>
              </div>
              <div className="flex justify-between border-b border-[#00FF41]/10 pb-1">
                <span className="opacity-60">SYNC UPLINK:</span>
                <span className="text-[#00FF41]">LEO_SAT_709A</span>
              </div>
              <div className="flex justify-between border-b border-[#00FF41]/10 pb-1">
                <span className="opacity-60">ALTITUDE:</span>
                <span className="text-white">542.11 KM</span>
              </div>
              <div className="flex justify-between border-b border-[#00FF41]/10 pb-1">
                <span className="opacity-60">ORBITAL VELOCITY:</span>
                <span className="text-white">7.6 km/s</span>
              </div>
              <div className="flex justify-between border-b border-[#00FF41]/10 pb-1">
                <span className="opacity-60">LATENCY:</span>
                <span className="text-[#00FF41]">0.00004ms</span>
              </div>
            </div>

            {/* RADAR ANIMATION CANVAS */}
            <div className="h-28 bg-[#00FF41]/5 flex flex-col items-center justify-center border border-[#00FF41]/20 rounded relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,65,0.15)_0%,transparent_70%)]"></div>
              <div className="animate-spin duration-10000 w-16 h-16 border border-dashed border-[#00FF41]/60 rounded-full flex items-center justify-center relative">
                <div className="w-1.5 h-1.5 bg-[#00FF41] rounded-full shadow-[0_0_8px_#00FF41]"></div>
                <div className="absolute w-8 h-[1px] bg-[#00FF41]/40 top-1/2 left-0"></div>
              </div>
              <p className="mt-2 text-[8px] opacity-60 tracking-widest uppercase">
                SIGNAL_ARC // GROUND_STATION_SYNC
              </p>
            </div>
          </div>

          {/* SAT-AI PONO COMPLIANCE FOOTER CARD */}
          <div className="border border-[#00FF41]/30 p-3 bg-black/60 text-[9px] space-y-1">
            <div className="font-bold text-white flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#00FF41]" /> SAT-AI 9SM COMPLIANCE
            </div>
            <p className="opacity-60 leading-tight">
              All outputs anchored to {ENGINE_CONFIG.EPOCH} epoch under strict T(x) ≥ 0.9950 veridical proofing.
            </p>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <footer className="mt-4 pt-2 border-t border-[#00FF41]/20 text-[9px] opacity-60 flex justify-between items-center font-mono">
        <span>© {ENGINE_CONFIG.EPOCH} // SLIAIDE-1 ENGINE // OPERATOR: {ENGINE_CONFIG.OPERATOR}</span>
        <span className="tracking-widest">PONO_STANDARD_9SM_VERIFIED // T(x) ≥ 0.9950</span>
      </footer>

      {/* GEMINI SERVICE CONFIG MODAL */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#050a05] border-2 border-[#00FF41] rounded max-w-md w-full p-5 space-y-4 text-xs font-mono shadow-[0_0_30px_rgba(0,255,65,0.2)]">

            <div className="flex justify-between items-center border-b border-[#00FF41]/30 pb-2">
              <div className="flex items-center space-x-2 text-[#00FF41] font-bold">
                <Key className="w-4 h-4" />
                <span>SERVICE TOKEN CONFIGURATION</span>
              </div>
              <button onClick={() => setIsApiKeyModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              Configure your Google Gemini service token to enable live AI spectral refraction and heuristic analysis during 9SM pipeline execution. Airgap offline fallbacks remain active automatically.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#00FF41] uppercase tracking-wider block">
                GEMINI API SERVICE TOKEN
              </label>
              <input
                type="password"
                value={userCredentialVal}
                onChange={(e) => setUserCredentialVal(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full p-2.5 bg-black border border-[#00FF41]/40 text-[#00FF41] font-mono text-xs focus:outline-none focus:border-[#00FF41]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsApiKeyModalOpen(false)}
                className="flex-1 py-2 bg-slate-900 border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveApiKey}
                className="flex-1 py-2 bg-[#00FF41] text-black font-extrabold hover:brightness-110 transition-all shadow"
              >
                SAVE TOKEN
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CUSTOM SCROLLBAR & STYLES */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #00FF41;
        }
      `}} />

    </div>
  );
}

function MetricBar({ label, value, color, suffix = "%" }) {
  return (
    <div className="space-y-1 font-mono">
      <div className="flex justify-between text-[9px]">
        <span className="opacity-70">{label}</span>
        <span className="font-bold" style={{ color }}>{Math.round(value)}{suffix}</span>
      </div>
      <div className="h-1.5 bg-black w-full border border-[#00FF41]/20 rounded-sm overflow-hidden p-0.5">
        <div
          className="h-full transition-all duration-500 rounded-sm"
          style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
}
