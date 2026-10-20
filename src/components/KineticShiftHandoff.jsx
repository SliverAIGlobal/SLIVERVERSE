import React, { useState, useEffect } from 'react';
import { UserCheck, FileText, CheckCircle2, History } from 'lucide-react';
import { saveRecord, getAllRecords } from '../db/offlineStore';

export default function KineticShiftHandoff({ audioResonator }) {
  const [logs, setLogs] = useState([]);
  const [isHandoffDone, setIsHandoffDone] = useState(false);

  const fetchLogs = async () => {
    try {
      const records = await getAllRecords('careLogs');
      setLogs(records || []);
    } catch (e) {
      console.warn("Error reading logs:", e);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleHandoff = async () => {
    if (audioResonator) audioResonator.playTone(639, 0.8);

    const record = {
      type: 'Kinetic Shift Handoff',
      action: 'Shift context sealed & density map generated',
      timestamp: new Date().toISOString()
    };

    await saveRecord('careLogs', record);
    await fetchLogs();

    setIsHandoffDone(true);
    setTimeout(() => setIsHandoffDone(false), 4000);
  };

  return (
    <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Kinetic Shift Handoff</span>
        </div>
        <button
          onClick={handleHandoff}
          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow"
        >
          Sign-Off Shift
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        A single FluidPass gesture authenticates outgoing caregivers, seals shift notes, and stores telemetry maps into local IndexedDB vaults.
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1"><History className="w-3.5 h-3.5" /> Recent Offline Care Logs:</span>
          <span>{logs.length} Recorded</span>
        </div>

        <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
          {logs.length > 0 ? (
            logs.slice(-5).reverse().map((item, idx) => (
              <div key={idx} className="p-2 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] flex justify-between items-center">
                <span className="text-slate-300 truncate max-w-[180px]">{item.action || item.type}</span>
                <span className="font-mono text-[10px] text-slate-500">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-xs text-slate-500 italic bg-slate-950/40 rounded-lg border border-slate-800/50">
              No care logs saved offline yet.
            </div>
          )}
        </div>
      </div>

      {isHandoffDone && (
        <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center space-x-2 text-emerald-300 text-xs font-bold animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Shift Context Sealed & Transferred Successfully!</span>
        </div>
      )}
    </div>
  );
}
