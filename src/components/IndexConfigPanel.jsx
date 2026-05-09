import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../api.js';

const TP_TYPES = ['BB_MIDDLE', 'BB_UPPER', 'POINTS', 'PERCENT'];
const SL_TYPES = ['POINTS', 'PERCENT', 'BB_LOWER'];

export default function IndexConfigPanel() {
  const [configs, setConfigs] = useState([]);
  const [saving, setSaving] = useState({});
  const [msgs, setMsgs] = useState({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await api.getIndexConfigs();
      setConfigs(data);
    } catch (e) { console.error(e); }
  };

  const update = (idx, field, value) => {
    setConfigs(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const save = async (idx) => {
    const cfg = configs[idx];
    setSaving(s => ({ ...s, [idx]: true }));
    setMsgs(m => ({ ...m, [idx]: null }));
    try {
      await api.updateIndexConfig(cfg);
      setMsgs(m => ({ ...m, [idx]: { ok: true, text: 'Saved!' } }));
      setTimeout(() => setMsgs(m => ({ ...m, [idx]: null })), 3000);
    } catch (e) {
      setMsgs(m => ({ ...m, [idx]: { ok: false, text: 'Failed: ' + e.message } }));
    } finally {
      setSaving(s => ({ ...s, [idx]: false }));
    }
  };

  const indexColors = { NIFTY: 'blue', BANKNIFTY: 'purple', SENSEX: 'amber' };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h2 className="font-semibold text-slate-200 mb-1">Index Configuration</h2>
        <p className="text-xs text-slate-400">Configure per-index SL/TP settings and partial booking</p>
      </div>

      {configs.map((cfg, idx) => {
        const color = indexColors[cfg.indexName] || 'blue';
        return (
          <div key={cfg.id} className={`bg-slate-800 rounded-lg p-5 border border-${color}-500/20`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`text-${color}-400 font-bold text-lg`}>{cfg.indexName}</span>
                <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded">
                  {cfg.segment} • Lot: {cfg.lotSize}
                </span>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Partial Booking</span>
                <div
                  onClick={() => update(idx, 'partialBookingEnabled', !cfg.partialBookingEnabled)}
                  className={`w-10 h-5 rounded-full cursor-pointer relative transition-colors ${
                    cfg.partialBookingEnabled ? 'bg-green-500' : 'bg-slate-600'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    cfg.partialBookingEnabled ? 'left-5' : 'left-0.5'
                  }`} />
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* SL */}
              <div className="bg-slate-900 rounded-lg p-3 border border-red-500/20">
                <p className="text-xs font-semibold text-red-400 mb-2">🔻 Stop Loss</p>
                <select value={cfg.slType} onChange={e => update(idx, 'slType', e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs mb-2 focus:outline-none focus:border-red-500">
                  {SL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {cfg.slType !== 'BB_LOWER' && (
                  <input type="number" step="0.5" value={cfg.slValue}
                    onChange={e => update(idx, 'slValue', parseFloat(e.target.value))}
                    placeholder="Value"
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs focus:outline-none focus:border-red-500" />
                )}
                {cfg.slType === 'BB_LOWER' && (
                  <p className="text-xs text-slate-500">Uses BB lower band</p>
                )}
              </div>

              {/* TP1 */}
              <div className="bg-slate-900 rounded-lg p-3 border border-yellow-500/20">
                <p className="text-xs font-semibold text-yellow-400 mb-2">🎯 TP1 (Partial)</p>
                <select value={cfg.tp1Type} onChange={e => update(idx, 'tp1Type', e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs mb-2 focus:outline-none focus:border-yellow-500">
                  {TP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {!cfg.tp1Type.startsWith('BB') && (
                  <input type="number" step="0.5" value={cfg.tp1Value}
                    onChange={e => update(idx, 'tp1Value', parseFloat(e.target.value))}
                    placeholder="Value"
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs mb-2 focus:outline-none focus:border-yellow-500" />
                )}
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Exit Qty (0=50%)</label>
                  <input type="number" step="1" min="0" value={cfg.tp1ExitQty}
                    onChange={e => update(idx, 'tp1ExitQty', parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs focus:outline-none focus:border-yellow-500" />
                </div>
                <label className="flex items-center gap-1.5 mt-2 cursor-pointer">
                  <input type="checkbox" checked={cfg.moveSlBreakeven}
                    onChange={e => update(idx, 'moveSlBreakeven', e.target.checked)}
                    className="rounded" />
                  <span className="text-xs text-slate-400">Move SL to breakeven</span>
                </label>
              </div>

              {/* TP2 */}
              <div className="bg-slate-900 rounded-lg p-3 border border-green-500/20">
                <p className="text-xs font-semibold text-green-400 mb-2">🏆 TP2 (Final)</p>
                <select value={cfg.tp2Type} onChange={e => update(idx, 'tp2Type', e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs mb-2 focus:outline-none focus:border-green-500">
                  {TP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {!cfg.tp2Type.startsWith('BB') && (
                  <input type="number" step="0.5" value={cfg.tp2Value}
                    onChange={e => update(idx, 'tp2Value', parseFloat(e.target.value))}
                    placeholder="Value"
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs mb-2 focus:outline-none focus:border-green-500" />
                )}
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Exit Qty (0=ALL remaining)</label>
                  <input type="number" step="1" min="0" value={cfg.tp2ExitQty}
                    onChange={e => update(idx, 'tp2ExitQty', parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs focus:outline-none focus:border-green-500" />
                </div>
              </div>
            </div>

            {/* Lot size + BB settings */}
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Lot Size</label>
                <input type="number" value={cfg.lotSize}
                  onChange={e => update(idx, 'lotSize', parseInt(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">BB Period</label>
                <input type="number" value={cfg.bbPeriod}
                  onChange={e => update(idx, 'bbPeriod', parseInt(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">BB Std Dev</label>
                <input type="number" step="0.1" value={cfg.bbStdDev}
                  onChange={e => update(idx, 'bbStdDev', parseFloat(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button onClick={() => save(idx)} disabled={saving[idx]}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-lg flex items-center gap-1.5 text-xs font-medium">
                <Save className="w-3.5 h-3.5" />
                {saving[idx] ? 'Saving...' : `Save ${cfg.indexName}`}
              </button>
              {msgs[idx] && (
                <span className={`flex items-center gap-1 text-xs ${msgs[idx].ok ? 'text-green-400' : 'text-red-400'}`}>
                  {msgs[idx].ok ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {msgs[idx].text}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
