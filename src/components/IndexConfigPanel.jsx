import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../api.js';

const TP_TYPES = ['BB_MIDDLE', 'BB_UPPER', 'POINTS', 'PERCENT'];
const SL_TYPES = ['POINTS', 'PERCENT', 'BB_LOWER'];

export default function IndexConfigPanel() {
  const [configs, setConfigs] = useState([]);
  const [saving, setSaving] = useState({});
  const [msgs, setMsgs] = useState({});
  const [tp1Mode, setTp1Mode] = useState({});
  const [tp2Mode, setTp2Mode] = useState({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await api.getIndexConfigs();
      setConfigs(data);
      const t1 = {}, t2 = {};
      data.forEach((c, i) => {
        t1[i] = c.tp1ExitQty > 0 ? 'custom' : 'default';
        t2[i] = c.tp2ExitQty > 0 ? 'custom' : 'all';
      });
      setTp1Mode(t1);
      setTp2Mode(t2);
    } catch (e) { console.error(e); }
  };

  const update = (idx, field, value) =>
    setConfigs(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));

  const save = async (idx) => {
    setSaving(s => ({ ...s, [idx]: true }));
    setMsgs(m => ({ ...m, [idx]: null }));
    try {
      await api.updateIndexConfig(configs[idx]);
      setMsgs(m => ({ ...m, [idx]: { ok: true, text: 'Saved!' } }));
      setTimeout(() => setMsgs(m => ({ ...m, [idx]: null })), 3000);
    } catch (e) {
      setMsgs(m => ({ ...m, [idx]: { ok: false, text: 'Failed: ' + e.message } }));
    } finally { setSaving(s => ({ ...s, [idx]: false })); }
  };

  const colors = { NIFTY: 'blue', BANKNIFTY: 'purple', SENSEX: 'amber' };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h2 className="font-semibold mb-1">Index Configuration</h2>
        <p className="text-xs text-slate-400">
          Overrides global Config for NIFTY / BANKNIFTY / SENSEX trades only.
        </p>
      </div>

      {configs.map((cfg, idx) => {
        const color = colors[cfg.indexName] || 'blue';
        const isPartial = cfg.partialBookingEnabled;
        const t1m = tp1Mode[idx] || 'default';
        const t2m = tp2Mode[idx] || 'all';

        return (
          <div key={cfg.id} className="bg-slate-800 rounded-lg p-5 border border-slate-700">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg text-white">{cfg.indexName}</span>
                <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded">
                  {cfg.segment} • Lot size: {cfg.lotSize}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Partial Booking</span>
                <button
                  onClick={() => update(idx, 'partialBookingEnabled', !isPartial)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isPartial ? 'bg-green-500' : 'bg-slate-600'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isPartial ? 'left-5' : 'left-0.5'}`} />
                </button>
                <span className={`text-xs font-medium ${isPartial ? 'text-green-400' : 'text-slate-500'}`}>
                  {isPartial ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            {/* Cards grid */}
            <div className={`grid gap-4 ${isPartial ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>

              {/* SL */}
              <div className="bg-slate-900 rounded-lg p-4 border border-red-500/20">
                <p className="text-xs font-semibold text-red-400 mb-3">🔻 Stop Loss</p>
                <select value={cfg.slType} onChange={e => update(idx, 'slType', e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs mb-2 focus:outline-none focus:border-red-500">
                  {SL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {cfg.slType !== 'BB_LOWER' ? (
                  <input type="number" step="0.5" min="0" value={cfg.slValue}
                    onChange={e => update(idx, 'slValue', parseFloat(e.target.value))}
                    placeholder="Value"
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs focus:outline-none focus:border-red-500" />
                ) : (
                  <p className="text-xs text-slate-500">Uses BB lower band automatically</p>
                )}
              </div>

              {/* TP1 */}
              <div className="bg-slate-900 rounded-lg p-4 border border-yellow-500/20">
                <p className="text-xs font-semibold text-yellow-400 mb-3">
                  {isPartial ? '🎯 TP1 — Partial Exit' : '🎯 Take Profit'}
                </p>
                <select value={cfg.tp1Type} onChange={e => update(idx, 'tp1Type', e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs mb-2 focus:outline-none focus:border-yellow-500">
                  {TP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {!cfg.tp1Type.startsWith('BB') && (
                  <input type="number" step="0.5" min="0" value={cfg.tp1Value}
                    onChange={e => update(idx, 'tp1Value', parseFloat(e.target.value))}
                    placeholder="Value"
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs mb-2 focus:outline-none focus:border-yellow-500" />
                )}

                <div className="pt-2 border-t border-slate-700">
                  <p className="text-xs text-slate-500 mb-2">Exit Quantity</p>

                  {!isPartial ? (
                    /* Partial OFF → single full exit button */
                    <button
                      onClick={() => update(idx, 'tp1ExitQty', 0)}
                      className="w-full py-1.5 rounded text-xs font-medium bg-yellow-500/20 border border-yellow-500/40 text-yellow-400">
                      ✅ Exit Full Quantity at TP
                    </button>
                  ) : (
                    /* Partial ON → 50% default or Custom */
                    <div className="space-y-2">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => { setTp1Mode(s => ({ ...s, [idx]: 'default' })); update(idx, 'tp1ExitQty', 0); }}
                          className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                            t1m === 'default'
                              ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400'
                              : 'bg-slate-700 border border-slate-600 text-slate-400 hover:bg-slate-600'
                          }`}>
                          50% default
                        </button>
                        <button
                          onClick={() => setTp1Mode(s => ({ ...s, [idx]: 'custom' }))}
                          className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                            t1m === 'custom'
                              ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400'
                              : 'bg-slate-700 border border-slate-600 text-slate-400 hover:bg-slate-600'
                          }`}>
                          Custom qty
                        </button>
                      </div>
                      {t1m === 'custom' && (
                        <input type="number" step="1" min="1"
                          value={cfg.tp1ExitQty || ''}
                          onChange={e => update(idx, 'tp1ExitQty', parseInt(e.target.value) || 0)}
                          placeholder={`e.g. ${cfg.lotSize} = 1 lot`}
                          className="w-full px-2 py-1.5 bg-slate-800 border border-yellow-500/40 rounded text-xs focus:outline-none focus:border-yellow-500" />
                      )}
                      {t1m === 'default' && (
                        <p className="text-xs text-slate-500">Bot exits 50% rounded to nearest lot</p>
                      )}
                    </div>
                  )}

                  {isPartial && (
                    <label className="flex items-center gap-2 mt-3 cursor-pointer">
                      <input type="checkbox" checked={cfg.moveSlBreakeven}
                        onChange={e => update(idx, 'moveSlBreakeven', e.target.checked)}
                        className="rounded accent-yellow-500" />
                      <span className="text-xs text-slate-400">Move SL to breakeven after TP1</span>
                    </label>
                  )}
                </div>
              </div>

              {/* TP2 — only when partial ON */}
              {isPartial && (
                <div className="bg-slate-900 rounded-lg p-4 border border-green-500/20">
                  <p className="text-xs font-semibold text-green-400 mb-3">🏆 TP2 — Final Exit</p>
                  <select value={cfg.tp2Type} onChange={e => update(idx, 'tp2Type', e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs mb-2 focus:outline-none focus:border-green-500">
                    {TP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {!cfg.tp2Type.startsWith('BB') && (
                    <input type="number" step="0.5" min="0" value={cfg.tp2Value}
                      onChange={e => update(idx, 'tp2Value', parseFloat(e.target.value))}
                      placeholder="Value"
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs mb-2 focus:outline-none focus:border-green-500" />
                  )}

                  <div className="pt-2 border-t border-slate-700">
                    <p className="text-xs text-slate-500 mb-2">Exit Quantity</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => { setTp2Mode(s => ({ ...s, [idx]: 'all' })); update(idx, 'tp2ExitQty', 0); }}
                        className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                          t2m === 'all'
                            ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                            : 'bg-slate-700 border border-slate-600 text-slate-400 hover:bg-slate-600'
                        }`}>
                        All remaining
                      </button>
                      <button
                        onClick={() => setTp2Mode(s => ({ ...s, [idx]: 'custom' }))}
                        className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                          t2m === 'custom'
                            ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                            : 'bg-slate-700 border border-slate-600 text-slate-400 hover:bg-slate-600'
                        }`}>
                        Custom qty
                      </button>
                    </div>
                    {t2m === 'custom' && (
                      <input type="number" step="1" min="1"
                        value={cfg.tp2ExitQty || ''}
                        onChange={e => update(idx, 'tp2ExitQty', parseInt(e.target.value) || 0)}
                        placeholder={`e.g. ${cfg.lotSize * 2} = 2 lots`}
                        className="w-full mt-1.5 px-2 py-1.5 bg-slate-800 border border-green-500/40 rounded text-xs focus:outline-none focus:border-green-500" />
                    )}
                    {t2m === 'all' && (
                      <p className="text-xs text-slate-500 mt-1">Sells all remaining qty after TP1</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* BB + Lot settings */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Lot Size</label>
                <input type="number" min="1" value={cfg.lotSize}
                  onChange={e => update(idx, 'lotSize', parseInt(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">BB Period</label>
                <input type="number" min="5" max="200" value={cfg.bbPeriod}
                  onChange={e => update(idx, 'bbPeriod', parseInt(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">BB Std Dev</label>
                <input type="number" step="0.1" min="0.5" max="5" value={cfg.bbStdDev}
                  onChange={e => update(idx, 'bbStdDev', parseFloat(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            {/* Save */}
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
