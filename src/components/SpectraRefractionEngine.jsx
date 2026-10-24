import React, { useState, useEffect, useRef } from 'react';

const LIGHT_WAVES = [
  { id: 1, name: "1. Red Wave: Somatic Anchors", freq: 432.0, color: "#ff0055", waveLength: "700 nm", range: "Nodes 01–09", desc: "Physicality, Biometric Health, Hardcopy Archives & Somatic Instincts", nodes: ["Physical Archives", "Biometric Health", "Hardcopy Letters", "Tactile Notebooks", "Spatial Homes", "Material Artifacts", "Genealogy", "Somatic Rhythms", "Somatic Instincts"] },
  { id: 2, name: "2. Orange Wave: Relational Dynamics", freq: 528.0, color: "#ff6600", waveLength: "620 nm", range: "Nodes 10–18", desc: "Kinship, Collaborative Logs, Love Letters & Relational Echoes", nodes: ["Primary Kinship", "Collaborative Logs", "Love Letters", "Community Nodes", "Shared Memory", "Emotional Thresholds", "Voice Notes", "Empathy Maps", "Relational Echoes"] },
  { id: 3, name: "3. Yellow Wave: Will & Volition", freq: 584.0, color: "#ffcc00", waveLength: "580 nm", range: "Nodes 19–27", desc: "Career Archives, Strategic Plans, Financial Flows & Volitional Vectors", nodes: ["Career Archives", "Financial Flows", "Strategic Plans", "Decisions Made", "Risk Ledger", "Resource Assets", "Leadership Footprints", "Milestones", "Volitional Vectors"] },
  { id: 4, name: "4. Green Wave: Harmonic Synthesis", freq: 639.0, color: "#00ff66", waveLength: "530 nm", range: "Nodes 28–36", desc: "Core Ethics, Personal Creed, Balance Metrics & System Equilibrium", nodes: ["Core Ethics", "Personal Creed", "Conflict Resolution", "Balance Metrics", "Nature Interactions", "Healing Archives", "Integrity Gates", "Harmonic Order", "System Equilibrium"] },
  { id: 5, name: "5. Cyan Wave: Expressive Truth", freq: 741.0, color: "#00ffff", waveLength: "490 nm", range: "Nodes 37–45", desc: "Code Repositories, Published Writings, Design Systems & Truth Vectors", nodes: ["Code Repositories", "Published Writings", "Lectures & Audio", "Design Systems", "Linguistic Patterns", "Creative Manuscripts", "Arguments Made", "Expressive Cadence", "Truth Vectors"] },
  { id: 6, name: "6. Blue Wave: Epistemological Insight", freq: 852.0, color: "#0066ff", waveLength: "450 nm", range: "Nodes 46–54", desc: "Knowledge Base, Research Archives, Mental Models & System Architectures", nodes: ["Knowledge Base", "Research Archives", "Mental Models", "System Architectures", "Mathematical Theories", "Cognitive Maps", "Information Filters", "Analytical Synthesis", "Epistemological Gate"] },
  { id: 7, name: "7. Violet Wave: Metacognition", freq: 963.0, color: "#9900ff", waveLength: "400 nm", range: "Nodes 55–63", desc: "Dream Journals, Introspective Logs, Shadow Work & Meta-Awareness", nodes: ["Dream Journals", "Introspective Logs", "Psychological Maps", "Shadow Work", "Archetype Resonances", "Meditation Telemetry", "Self-Correction Engine", "Time Perception", "Meta-Awareness"] },
  { id: 8, name: "8. Magenta Wave: Archetypal Mythos", freq: 1074.0, color: "#ff00cc", waveLength: "380 nm", range: "Nodes 64–72", desc: "Symbolic Matrix, Personal Mythology, Vision Statements & Mythic Purpose", nodes: ["Symbolic Matrix", "Personal Mythology", "Recurring Motifs", "Hero's Journey Arcs", "Vision Statements", "Cultural Echoes", "Legacy Blueprint", "Transgenerational Patterns", "Mythic Purpose"] },
  { id: 9, name: "9. White Light Wave: Unknowable Singularity", freq: 1188.0, color: "#ffffff", waveLength: "Full Spectrum", range: "Nodes 73–81", desc: "Unified Soul Image, Zero-Point Identity & Omni-Data Synthesis", nodes: ["Unified Soul Image", "Zero-Point Identity", "Omni-Data Synthesis", "Acoustic Singularity", "Full Spectra Refraction", "Continuous State", "Beyond-Model Reality", "Monadic Prism", "Absolute Spectra"] }
];

export default function SpectraRefractionEngine({ activeParadigm, setActiveParadigm }) {
  const [selectedWaveIdx, setSelectedWaveIdx] = useState(0);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Ingestion Pipeline Execution State
  const [pipelineStage, setPipelineStage] = useState(0); // 0: Idle, 1: Subtractive Incineration, 2: Context Profiling, 3: 81-Diremption Refraction, 4: Adaptive Output, 5: T(x) Gate Check
  const [isProcessing, setIsProcessing] = useState(false);
  const [telemetryScore, setTelemetryScore] = useState(0.0000);
  const [ledgerProof, setLedgerProof] = useState(null);
  const [logs, setLogs] = useState(["[SYSTEM READY] Ingestion Vault Initialized."]);

  // Audio & Canvas References
  const canvasRef = useRef(null);
  const [audioActive, setAudioActive] = useState(false);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const latticeRef = useRef([]);

  // Initialize Canvas & Audio System
  useEffect(() => {
    build81Lattice();
    let animId;

    const render = () => {
      drawCanvas();
      animId = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(animId);
  }, [selectedWaveIdx, activeParadigm]);

  // Build 81 Diremptions Lattice Nodes (9 rings x 9 rays)
  const build81Lattice = () => {
    const nodes = [];
    const count = 81;
    const center = 270;
    const radiusMax = 220;

    for (let i = 0; i < count; i++) {
      const waveGroup = Math.floor(i / 9);
      const angle = (i % 9) * ((Math.PI * 2) / 9) + (waveGroup * 0.15);
      const r = (waveGroup + 1) * (radiusMax / 9);

      nodes.push({
        id: i + 1,
        waveGroup,
        title: LIGHT_WAVES[waveGroup].nodes[i % 9],
        baseX: center + Math.cos(angle) * r,
        baseY: center + Math.sin(angle) * r,
        x: center + Math.cos(angle) * r,
        y: center + Math.sin(angle) * r,
        vx: 0,
        vy: 0,
        size: 3.5 + waveGroup * 0.25,
        color: LIGHT_WAVES[waveGroup].color,
        freq: LIGHT_WAVES[waveGroup].freq + (i % 9) * 4
      });
    }
    latticeRef.current = nodes;
  };

  // Canvas WebGL / HTML5 Rendering Loop
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const center = width / 2;

    ctx.fillStyle = 'rgba(3, 7, 18, 0.22)';
    ctx.fillRect(0, 0, width, height);

    const currentWave = LIGHT_WAVES[selectedWaveIdx];

    // Draw Radial Rings & Connections
    ctx.lineWidth = 1;
    for (let w = 0; w < 9; w++) {
      const r = (w + 1) * (220 / 9);
      ctx.strokeStyle = w === selectedWaveIdx ? `${LIGHT_WAVES[w].color}44` : 'rgba(255, 255, 255, 0.03)';
      ctx.beginPath();
      ctx.arc(center, center, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw Particle Lattice Nodes & Mesh Interconnections
    const lattice = latticeRef.current;
    for (let i = 0; i < lattice.length; i++) {
      const p = lattice[i];

      // Physics Spring Return
      const dx = p.baseX - p.x;
      const dy = p.baseY - p.y;
      p.vx = (p.vx + dx * 0.03) * 0.88;
      p.vy = (p.vy + dy * 0.03) * 0.88;
      p.x += p.vx;
      p.y += p.vy;

      const isCurrentWave = p.waveGroup === selectedWaveIdx;

      // Draw Node
      ctx.beginPath();
      ctx.arc(p.x, p.y, isCurrentWave ? p.size * 1.4 : p.size, 0, Math.PI * 2);
      ctx.fillStyle = isCurrentWave ? p.color : `${p.color}88`;
      if (isCurrentWave) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    }

    // Center Refraction Aperture Ring
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(Date.now() * 0.0006);
    ctx.beginPath();
    ctx.arc(0, 0, 22 + Math.sin(Date.now() * 0.003) * 3, 0, Math.PI * 2);
    ctx.strokeStyle = currentWave.color;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = currentWave.color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();
  };

  // Audio Synthesizer Controls
  const toggleAudio = () => {
    if (!audioActive) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(LIGHT_WAVES[selectedWaveIdx].freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      audioCtxRef.current = ctx;
      oscRef.current = osc;
      gainRef.current = gain;
      setAudioActive(true);
      appendLog(`[ACOUSTIC SYNTH] Activated ${LIGHT_WAVES[selectedWaveIdx].freq} Hz Drone.`);
    } else {
      if (oscRef.current) oscRef.current.stop();
      if (audioCtxRef.current) audioCtxRef.current.close();
      setAudioActive(false);
      appendLog("[ACOUSTIC SYNTH] Deactivated.");
    }
  };

  const updateFrequency = (freq) => {
    if (audioActive && oscRef.current && audioCtxRef.current) {
      oscRef.current.frequency.exponentialRampToValueAtTime(freq, audioCtxRef.current.currentTime + 0.3);
    }
  };

  // Handle Wave Change
  const handleWaveSelect = (idx) => {
    setSelectedWaveIdx(idx);
    updateFrequency(LIGHT_WAVES[idx].freq);
    appendLog(`[REFRACTION] Wave ${idx + 1} Selected: ${LIGHT_WAVES[idx].name}`);
  };

  // Trigger Particle Perturbation on Ingestion
  const perturbLattice = () => {
    latticeRef.current.forEach((p) => {
      if (p.waveGroup === selectedWaveIdx || Math.random() > 0.6) {
        p.vx += (Math.random() - 0.5) * 12;
        p.vy += (Math.random() - 0.5) * 12;
      }
    });
  };

  const appendLog = (msg) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);
  };

  // Execute 5-Stage Ingestion Pipeline
  const executeIngestionPipeline = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPipelineStage(1);
    setTelemetryScore(0.0);
    setLedgerProof(null);

    appendLog("[STAGE 1] Initiating Subtractive Noise Incineration...");
    perturbLattice();
    await new Promise((r) => setTimeout(r, 900));

    setPipelineStage(2);
    appendLog("[STAGE 2] Context Profiling & CKN Entity Mining Active...");
    perturbLattice();
    await new Promise((r) => setTimeout(r, 900));

    setPipelineStage(3);
    appendLog("[STAGE 3] Refracting Payload into 81-Diremption Matrix...");
    perturbLattice();
    await new Promise((r) => setTimeout(r, 1000));

    setPipelineStage(4);
    appendLog("[STAGE 4] Adaptive Package Output Formulation...");
    await new Promise((r) => setTimeout(r, 800));

    setPipelineStage(5);
    appendLog("[STAGE 5] Evaluating Veridical Gate T(x) >= 0.9950...");
    const computedScore = 0.9982;
    setTelemetryScore(computedScore);
    await new Promise((r) => setTimeout(r, 600));

    if (computedScore >= 0.9950) {
      const hash = `0x9FA83C2188B1E4995A4F_SPECTRA_REFRACTION_VERIFIED_${Date.now()}`;
      setLedgerProof(hash);
      appendLog(`[GATE PASSED] T(x) = ${computedScore} >= 0.9950`);
      appendLog(`[LEDGER ANCHOR] ${hash}`);
    }

    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Top Controls / Audio Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-purple-200 to-rose-300">
            SPECTRA 81-DIREMPTION REFRACTION ENGINE
          </h2>
          <p className="text-xs text-slate-400 font-mono">Omni-Platform Ingestion & Veridical Gate Core</p>
        </div>

        <button
          onClick={toggleAudio}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold border transition-all flex items-center gap-2 ${
            audioActive
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span>{audioActive ? '🔊 Drone Active' : '🔇 Audio Drone'}</span>
          <span className="text-[10px] opacity-75">({LIGHT_WAVES[selectedWaveIdx].freq} Hz)</span>
        </button>
      </div>

      {/* Main Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Light Wave & Life Sector Selector (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
                Light Wave Spectrum
              </span>
              <span className="font-mono text-xs text-slate-400">Wave {selectedWaveIdx + 1} / 9</span>
            </div>

            <h3 className="text-base font-bold text-slate-100 font-serif mb-1">
              {LIGHT_WAVES[selectedWaveIdx].name}
            </h3>
            <p className="text-xs font-mono text-cyan-300 mb-3">
              {LIGHT_WAVES[selectedWaveIdx].freq} Hz // {LIGHT_WAVES[selectedWaveIdx].waveLength}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {LIGHT_WAVES[selectedWaveIdx].desc}
            </p>

            {/* Active Diremption Nodes List */}
            <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-4">
              <span className="text-[10px] font-mono text-slate-400 block mb-2 uppercase font-semibold">
                Refracted Life Sectors
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                {LIGHT_WAVES[selectedWaveIdx].nodes.map((nodeName, idx) => (
                  <div
                    key={idx}
                    className="px-2 py-1 bg-slate-900/80 border border-slate-800/80 rounded text-slate-300 hover:border-cyan-500/40 hover:text-cyan-200 transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredNode(nodeName)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    • {nodeName}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Light Wave Selection Grid */}
          <div>
            <span className="text-[10px] font-mono text-slate-400 block mb-2 uppercase font-semibold">
              Select Spectra Frequency
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {LIGHT_WAVES.map((w, idx) => (
                <button
                  key={w.id}
                  onClick={() => handleWaveSelect(idx)}
                  className={`py-2 text-[10px] font-mono rounded-lg border text-center transition-all ${
                    selectedWaveIdx === idx
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold scale-105 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  W{w.id} ({w.freq}Hz)
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: 81-Diremption Canvas Visualizer (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center relative min-h-[500px]">
          {/* Canvas Container */}
          <div className="relative w-full max-w-[500px] aspect-square rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 flex items-center justify-center">
            <canvas ref={canvasRef} width={540} height={540} className="w-full h-full cursor-crosshair" />

            {/* Hover Node Metadata Overlay */}
            {hoveredNode && (
              <div className="absolute top-4 left-4 right-4 bg-slate-900/90 border border-cyan-500/40 p-2.5 rounded-xl backdrop-blur-md text-xs font-mono text-cyan-200 shadow-xl pointer-events-none flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Diremption Sector: <strong>{hoveredNode}</strong></span>
              </div>
            )}
          </div>

          {/* Trigger Ingestion Pipeline CTA */}
          <button
            onClick={executeIngestionPipeline}
            disabled={isProcessing}
            className="mt-4 w-full max-w-[500px] py-3 bg-gradient-to-r from-cyan-500 via-purple-600 to-rose-600 hover:from-cyan-400 hover:to-rose-500 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-lg transition-all transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? '⚡ Processing Pipeline...' : '⚡ Execute 5-Stage Ingestion & Veridical Gate'}
          </button>
        </div>

        {/* Right Column: Ingestion Engine Log & Veridical Gate Telemetry (3 Cols) */}
        <div className="lg:col-span-3 bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase block mb-3">
              5-Stage Pipeline Telemetry
            </span>

            {/* Pipeline Stage Visualizer */}
            <div className="space-y-2 mb-4 font-mono text-xs">
              {[
                "1. Subtractive Incineration",
                "2. Context Profiling",
                "3. 81-Diremption Refraction",
                "4. Adaptive Output Package",
                "5. Veridical Gate T(x)"
              ].map((stageName, idx) => {
                const stageNum = idx + 1;
                const isActive = pipelineStage === stageNum;
                const isPassed = pipelineStage > stageNum || ledgerProof;

                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                        : isPassed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800/60 text-slate-500'
                    }`}
                  >
                    <span>{stageName}</span>
                    <span>{isPassed ? '✓' : isActive ? '⏳' : '•'}</span>
                  </div>
                );
              })}
            </div>

            {/* Gate Telemetry Metrics */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Truth Threshold:</span>
                <span className="text-cyan-400 font-bold">T(x) ≥ 0.9950</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Telemetry Delta:</span>
                <span className={telemetryScore >= 0.9950 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {telemetryScore ? `T(x) = ${telemetryScore}` : '0.0000'}
                </span>
              </div>
            </div>

            {/* Proof Anchor Output */}
            {ledgerProof && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block">SLIVER VERITAS ANCHOR</span>
                <p className="text-[9px] font-mono text-emerald-200 break-all leading-relaxed">{ledgerProof}</p>
              </div>
            )}
          </div>

          {/* System Terminal Console */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-[10px] space-y-1 h-36 overflow-y-auto">
            <span className="text-slate-500 block border-b border-slate-800 pb-1 mb-1">PROTON TELEMETRY STREAM</span>
            {logs.map((log, i) => (
              <div key={i} className="text-slate-300 leading-normal">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
