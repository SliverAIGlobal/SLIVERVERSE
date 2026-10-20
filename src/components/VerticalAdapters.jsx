import React from 'react';
import { HeartHandshake, Layers, Compass, LineChart, Car, Stethoscope } from 'lucide-react';

export default function VerticalAdapters({ activeAdapter, onSelectAdapter }) {
  const adapters = [
    {
      id: 'careKinetic',
      name: 'CareKinetic',
      tagline: 'DOA Caregiver Challenge',
      icon: HeartHandshake,
      desc: 'Stress diffusion, blind gesture controls, and Solfeggio microtonal grounding.'
    },
    {
      id: 'salesKinetic',
      name: 'B2B SalesKinetic',
      tagline: 'Sales Enhancer SDK',
      icon: Layers,
      desc: 'Hybrid offline-first WASM sales enhancer & client-side e-signature.'
    },
    {
      id: 'mindState',
      name: 'MindState',
      tagline: 'Consumer Grounding',
      icon: Compass,
      desc: 'Ambient 10-second sensory reset & cortisol lowering UI.'
    },
    {
      id: 'fintech',
      name: 'Fintech Depth',
      tagline: 'Risk & Order-Book',
      icon: LineChart,
      desc: 'Market liquidity & volatility visualized as viscous liquid drag.'
    },
    {
      id: 'autoCockpit',
      name: 'AutoCockpit',
      tagline: 'EV Blind HUD',
      icon: Car,
      desc: '100% blind tactile gesture console for vehicle cockpits.'
    },
    {
      id: 'surgical',
      name: 'Tele-Robotics',
      tagline: 'Medical Force-Feedback',
      icon: Stethoscope,
      desc: 'Tissue resistance & micro-tremor mapping for remote surgery.'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
      {adapters.map((item) => {
        const Icon = item.icon;
        const isSelected = activeAdapter === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelectAdapter(item.id)}
            className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
              isSelected
                ? 'bg-slate-900 border-emerald-500 shadow-xl ring-2 ring-emerald-500/20'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
              {isSelected && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold text-white">{item.name}</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.tagline}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
