import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { api } from '../api.js';

const PRESETS = [
  { label: '🛡️ Safe',       slType: 'PERCENT', slValue: 2, tpType: 'PERCENT',       tpValue: 3,  bbPeriod: 20, bbStdDev: 2 },
  { label: '⚖️ Balanced',   slType: 'PERCENT', slValue: 5, tpType: 'PERCENT',       tpValue: 10, bbPeriod: 20, bbStdDev: 2 },
  { label: '🚀 Aggressive', slType: 'PERCENT', slValue: 8, tpType: 'PERCENT',       tpValue: 20, bbPeriod: 20, bbStdDev: 2 },
  { label: '📊 BB Full',    slType: 'BB_LOWER', slValue: 0, tpType: 'BOLLINGER_BAND', tpValue: 8, bbPeriod: 20, bbStdDev: 2 },
  { label: '🎯 Points',     slType: 'POINTS',  slValue: 50, tpType: 'POINTS',       tpValue: 100, bbPeriod: 20, bbStdDev: 2 },
];

export default function ConfigPanel({ config, onUpdate }) {
  const [form, setForm] = useState({
    slType: 'PERCENT', slValue: 5, tpType: 'PERCENT', tpValue: 10, bbPeriod: 20, bbStdDev: 2
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (config) setForm({
      slType: config.slType || 'PERCENT',
      slValue: parseFloat(config.slValue) || 5,
      tpType: config.tpType || 'PERCENT',
      tpValue: parseFloat(config.tpValue) || 10,
      bbPeriod: parseInt(config.bbPeriod) || 20,
      bbStdDev: parseFloat(config.bbStdDev) || 2,
    });
  }, [config]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      await api.updateConfig(form);
      setMsg({ ok: true, text: 'Saved! Takes effect within 30s.' });
      onUpdate();
    } catch (e) {
      setMsg({ ok: false, text: 'Failed: ' + e.message });
    } finally { setSaving(false); }
  };

  const showSlValue = form.slType !== 'BB_LOWER';
  const showTpValue = form.tpType !== 'BOLLINGER_BAND';
  const showBbSettings = form.slType === 'BB_LOWER' || form.tpType === 'BOLLINGER_BAND';

  const slEx = form.slType === 'PERCENT'
    ? (100 * (1 - form.slValue / 100)).toFixed(2)
    : form.slType === 'POINTS' ? (100 - form.slValue).toFixed(2) : 'BB lower band';

  const tpEx = form.tpType === 'PERCENT'
    ? (100 * (1 + form.tpValue / 100)).toFixed(2)
    : form.tpType === 'POINTS' ? (100 + form.tpValue).toFixed(2) : 'BB band';

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Zap className="w-3 h-3" /> Quick Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => setForm(p)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SL */}
        <div className="bg-slate-800 rounded-lg p-5 border border-red-500/20">
          <h3 className="text-sm font-semibold text-red-400 mb-4">🔻 Stop Loss</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Type</label>
              <select value={form.slType} onChange={e => set('slType', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-red-500">
                <option value="PERCENT">Percentage (%)</option>
                <option value="POINTS">Points</option>
                <option value="BB_LOWER">Bollinger Band Lower</option>
              </select>
            </div>
            {showSlValue && (
              <div>
                <label className="text-xs text-slate-400 block mb-1">Value</label>
                <input type="number" step="0.1" min="0" value={form.slValue}
                  onChange={e => set('slValue', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-red-500" />
              </div>
            )}
            {form.slType === 'BB_LOWER' && (
              <p className="text-xs text-slate-500">SL placed at Bollinger Band lower band</p>
            )}
            <p className="text-xs text-slate-500">Example: Entry ₹100 → SL ₹{slEx}</p>
          </div>
        </div>

        {/* TP */}
        <div className="bg-slate-800 rounded-lg p-5 border border-green-500/20">
          <h3 className="text-sm font-semibold text-green-400 mb-4">🎯 Take Profit</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Type</label>
              <select value={form.tpType} onChange={e => set('tpType', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-green-500">
                <option value="PERCENT">Percentage (%)</option>
                <option value="POINTS">Points</option>
                <option value="BOLLINGER_BAND">Bollinger Band Upper</option>
              </select>
            </div>
            {showTpValue && (
              <div>
                <label className="text-xs text-slate-400 block mb-1">Value</label>
                <input type="number" step="0.1" min="0" value={form.tpValue}
                  onChange={e => set('tpValue', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-green-500" />
              </div>
            )}
            {form.tpType === 'BOLLINGER_BAND' && (
              <p className="text-xs text-slate-500">TP placed at BB middle band (fallback: %)</p>
            )}
            <p className="text-xs text-slate-500">Example: Entry ₹100 → TP ₹{tpEx}</p>
          </div>
        </div>
      </div>

      {/* BB Settings */}
      {showBbSettings && (
        <div className="bg-slate-800 rounded-lg p-5 border border-purple-500/20">
          <h3 className="text-sm font-semibold text-purple-400 mb-4">📊 Bollinger Band Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Period (5–200)</label>
              <input type="number" min="5" max="200" value={form.bbPeriod}
                onChange={e => set('bbPeriod', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Std Dev (0.5–5)</label>
              <input type="number" step="0.1" min="0.5" max="5" value={form.bbStdDev}
                onChange={e => set('bbStdDev', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-purple-500" />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
        {msg && (
          <span className={`flex items-center gap-1.5 text-sm ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>
            {msg.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
