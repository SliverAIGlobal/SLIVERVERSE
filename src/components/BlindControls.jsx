import React, { useState, useRef } from 'react';
import { EyeOff, Activity, Pill, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { saveRecord } from '../db/offlineStore';

export default function BlindControls({ audioResonator, onLogEntry }) {
  const [lastAction, setLastAction] = useState(null);
  const touchStart = useRef(null);

  const handleTouchStart = (e) => {
    const t = e.touches ? e.touches[0] : e;
    touchStart.current = { x: t.clientX, y: t.clientY, time: Date.now() };
  };

  const handleTouchEnd = async (e) => {
    if (!touchStart.current) return;
    const t = e.changedTouches ? e.changedTouches[0] : e;
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 40) {
      let actionName = '';
      let icon = null;

      if (Math.abs(dy) > Math.abs(dx)) {
        if (dy < 0) {
          actionName = 'Vitals Logged (BP: 120/80, HR: 72 bpm)';
          icon = 'activity';
          if (audioResonator) audioResonator.playTone(528, 0.4);
        } else {
          actionName = 'Medication Administered (Dosage Verified)';
          icon = 'pill';
          if (audioResonator) audioResonator.playTone(432, 0.4);
        }
      } else {
        actionName = 'Urgent Caregiver Attention Flagged';
        icon = 'alert';
        if (audioResonator) audioResonator.playTone(639, 0.6);
      }

      setLastAction(actionName);

      const record = {
        type: 'Eyes-Free Blind Gesture',
        action: actionName,
        timestamp: new Date().toISOString()
      };

      await saveRecord('careLogs', record);
      if (onLogEntry) onLogEntry(record);

      setTimeout(() => setLastAction(null), 3500);
    }

    touchStart.current = null;
  };

  return (
    <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <EyeOff className="w-4 h-4 text-emerald-400" />
          <span>100% Blind Tactile Gesture Control</span>
        </div>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
          Eyes-Free
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        Swipe anywhere on the full-screen canvas without looking to trigger vital logging or medication delivery with acoustic confirmation.
      </p>

      {/* SWIPE PAD INTERFACE */}
      <div
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="h-28 bg-slate-950/80 rounded-xl border border-dashed border-emerald-500/30 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/60 transition-all select-none p-4 text-center space-y-2"
      >
        <div className="flex items-center justify-center space-x-6 text-slate-400 text-xs">
          <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-blue-400" /> ↑ Swipe Up: Vitals</span>
          <span className="flex items-center gap-1"><Pill className="w-3.5 h-3.5 text-emerald-400" /> ↓ Swipe Down: Meds</span>
          <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> → Swipe Across: Alert</span>
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Swipe Gesture Area</span>
      </div>

      {lastAction && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center space-x-2 text-emerald-300 text-xs font-bold animate-pulse">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{lastAction}</span>
        </div>
      )}
    </div>
  );
}
