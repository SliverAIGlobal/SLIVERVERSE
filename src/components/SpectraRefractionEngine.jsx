import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

const WAVES = [
  { id: 1, name: "Wave 1: Red (700nm // 432Hz)", color: "#ef4444", freq: 432.0, desc: "Physical Archives & Biometrics" },
  { id: 2, name: "Wave 2: Orange (620nm // 528Hz)", color: "#f97316", freq: 528.0, desc: "Relational Dynamics & Empathy" },
  { id: 3, name: "Wave 3: Yellow (580nm // 584Hz)", color: "#eab308", freq: 584.0, desc: "Career, Finance & Volition" },
  { id: 4, name: "Wave 4: Green (530nm // 639Hz)", color: "#22c55e", freq: 639.0, desc: "Ethics, Integrity & Equilibrium" },
  { id: 5, name: "Wave 5: Cyan (490nm // 741Hz)", color: "#06b6d4", freq: 741.0, desc: "Code, Writing & Expressive Truth" },
  { id: 6, name: "Wave 6: Blue (450nm // 852Hz)", color: "#3b82f6", freq: 852.0, desc: "Knowledge Base & Cognitive Maps" },
  { id: 7, name: "Wave 7: Violet (400nm // 963Hz)", color: "#8b5cf6", freq: 963.0, desc: "Shadow Work & Metacognition" },
  { id: 8, name: "Wave 8: Magenta (380nm // 1074Hz)", color: "#d946ef", freq: 1074.0, desc: "Symbolic Matrix & Mythic Purpose" },
  { id: 9, name: "Wave 9: White Light (Full Prism // 1188Hz)", color: "#f8fafc", freq: 1188.0, desc: "Unified Soul Image & Monadic Prism" }
];

export default function SpectraRefractionEngine({ onStageChange, currentStage }) {
  const canvasRef = useRef(null);
  const [activeNode, setActiveNode] = useState(null);
  const [audioActive, setAudioActive] = useState(false);
  const [pathway, setPathway] = useState('individual'); // 'individual' or 'business'
  const synthRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let particles = [];
    for (let i = 0; i < 81; i++) {
      const waveIdx = Math.floor(i / 9);
      const angle = ((i % 9) * (Math.PI * 2)) / 9 + waveIdx * 0.15;
      const radiusRatio = (waveIdx + 1) / 9.5;
      particles.push({
        id: i,
        waveIdx,
        angle,
        radiusRatio,
        baseColor: WAVES[waveIdx].color,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    const render = () => {
      const width = canvas.width = canvas.parentElement.clientWidth || 600;
      const height = canvas.height = 550;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(centerX, centerY) - 40;

      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, width, height);

      // Draw 9 concentric harmonic rings
      for (let r = 1; r <= 9; r++) {
        const ringRadius = (r / 9.5) * maxRadius;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = WAVES[r - 1].color + "33";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw 9 radial rays
      for (let ray = 0; ray < 9; ray++) {
        const angle = (ray * Math.PI * 2) / 9;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * maxRadius, centerY + Math.sin(angle) * maxRadius);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw 81 Diremption Nodes
      const time = Date.now() * 0.002;
      particles.forEach((p) => {
        const r = p.radiusRatio * maxRadius;
        const currentAngle = p.angle + Math.sin(time + p.pulseOffset) * 0.02;
        const x = centerX + Math.cos(currentAngle) * r;
        const y = centerY + Math.sin(currentAngle) * r;

        ctx.beginPath();
        ctx.arc(x, y, 4 + Math.sin(time + p.pulseOffset) * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = p.baseColor;
        ctx.shadowColor = p.baseColor;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const toggleAudio = () => {
    if (!audioActive) {
      Tone.start();
      const synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 1, decay: 0.5, sustain: 0.8, release: 2 }
      }).toDestination();
      synth.volume.value = -18;
      synth.triggerAttack(432);
      synthRef.current = synth;
      setAudioActive(true);
    } else {
      if (synthRef.current) {
        synthRef.current.triggerRelease();
      }
      setAudioActive(false);
    }
  };

  const handleNodeHover = (waveIdx) => {
    const wave = WAVES[waveIdx];
    setActiveNode(wave);
    if (audioActive && synthRef.current) {
      synthRef.current.frequency.rampTo(wave.freq, 0.2);
    }
  };

  return (
    <div className="w-full glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-indigo-300 to-rose-300">
              81-DIREMPTION SPECTRA REFRACTION ENGINE
            </h2>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
              9SM POLAR MATRIX
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Subtractive Noise Incineration &amp; 7–9 Light Wave Refraction Pipeline
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleAudio}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              audioActive ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 shadow-lg shadow-teal-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            <span>{audioActive ? '🔊 432Hz Drone: ON' : '🔇 Audio Drone: OFF'}</span>
          </button>

          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setPathway('individual')}
              className={`px-3 py-1.5 rounded-lg transition-all ${pathway === 'individual' ? 'bg-teal-500/20 text-teal-200 border border-teal-500/40' : 'text-slate-400'}`}
            >
              Flower Learn (Individual)
            </button>
            <button
              onClick={() => setPathway('business')}
              className={`px-3 py-1.5 rounded-lg transition-all ${pathway === 'business' ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40' : 'text-slate-400'}`}
            >
              Hāna Runner (Enterprise)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
        {/* Left Side: 9 Light Wave Selector List */}
        <div className="lg:col-span-1 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
            Select Light Wave Frequency
          </span>
          <div className="space-y-1.5">
            {WAVES.map((w, idx) => (
              <button
                key={w.id}
                onMouseEnter={() => handleNodeHover(idx)}
                className="w-full text-left p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-800/80 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: w.color }} />
                  <span className="text-xs font-medium text-slate-200 group-hover:text-teal-300">
                    Wave {w.id}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{w.freq} Hz</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center Canvas: 81-Diremption Interactive Polar Visualizer */}
        <div className="lg:col-span-2 relative flex items-center justify-center min-h-[500px]">
          <canvas ref={canvasRef} className="w-full h-[500px] rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl" />
        </div>

        {/* Right Side: Active Sector Telemetry Metadata */}
        <div className="lg:col-span-1 glass-panel p-4 rounded-xl border border-slate-800 space-y-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
            Sector Telemetry
          </span>
          {activeNode ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeNode.color }} />
                <h3 className="text-sm font-bold text-slate-100">{activeNode.name}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{activeNode.desc}</p>
              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
                <div>Frequency: <span className="text-teal-300">{activeNode.freq} Hz</span></div>
                <div>Veridical Score T(x): <span className="text-teal-300">0.9984 [PONO]</span></div>
                <div>Grand Ledger Anchor: <span className="text-indigo-300">0x9F42_SLIVER</span></div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Hover over any wave or diremption node to inspect its spectral telemetry.
            </p>
          )}

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
              Stage 4 Active Output
            </span>
            <p className="text-xs text-slate-300">
              {pathway === 'individual'
                ? 'Flower Learn: 40% ELIP Theory / 60% Active Somatic Application'
                : 'Hāna Runner: 100-Channel Capital Routing & WASM Storefront'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
