import React, { useState, useEffect } from 'react';
import { Key, Wifi, WifiOff, X, Save } from 'lucide-react';
import { saveSetting, getSetting } from '../db/offlineStore';

export default function SettingsModal({ isOpen, onClose }) {
  const [hfToken, setHfToken] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    getSetting('hf_token').then(val => {
      if (val) setHfToken(val);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSave = async () => {
    await saveSetting('hf_token', hfToken.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
            <Key className="w-4 h-4" />
            <span>ChromaOS & AI Integration Settings</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Offline PWA Status:</span>
          {isOnline ? (
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Wifi className="w-3.5 h-3.5" /> Online (PWA Cache Ready)
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <WifiOff className="w-3.5 h-3.5" /> Offline Cache Active
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Provide an optional Hugging Face API key to enable serverless <strong>FLUX.1 [schnell]</strong> background canvas generation. Token is stored strictly in your local encrypted IndexedDB cache.
        </p>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Hugging Face API Key
          </label>
          <input
            type="password"
            value={hfToken}
            onChange={(e) => setHfToken(e.target.value)}
            placeholder="hf_..."
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
