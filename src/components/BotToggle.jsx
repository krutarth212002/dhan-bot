import React, { useState } from 'react';
import { Power, AlertCircle } from 'lucide-react';
import { api } from '../api.js';

export default function BotToggle({ botEnabled, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      await api.toggleBot();
      onUpdate();
    } catch (e) {
      console.error('Toggle failed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-xl p-5 border-2 transition-all ${
      botEnabled
        ? 'bg-green-500/10 border-green-500/40'
        : 'bg-red-500/10 border-red-500/40'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">
            {botEnabled ? '🟢 Bot Running' : '🔴 Bot Stopped'}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {botEnabled
              ? 'Actively monitoring trades — SL/TP will be placed automatically'
              : 'Bot is paused — trades detected but NO SL/TP will be placed'}
          </p>
          {!botEnabled && (
            <div className="flex items-center gap-1.5 mt-2 text-amber-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5" />
              Safe mode: Your boss can trade without bot interference
            </div>
          )}
        </div>
        <button
          onClick={toggle}
          disabled={loading}
          className={`relative w-16 h-8 rounded-full transition-all duration-300 focus:outline-none ${
            botEnabled ? 'bg-green-500' : 'bg-red-500'
          } ${loading ? 'opacity-50' : 'hover:opacity-90'}`}
        >
          <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all duration-300 ${
            botEnabled ? 'left-9' : 'left-1'
          }`} />
        </button>
      </div>
    </div>
  );
}
