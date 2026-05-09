import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Settings, TrendingUp, RefreshCw, Wifi, WifiOff,
         CheckCircle, XCircle, Server, BarChart3, Key, AlertCircle, Target } from 'lucide-react';
import { api } from './api.js';
import ConfigPanel from './components/ConfigPanel.jsx';
import TradesTable from './components/TradesTable.jsx';
import TokenPanel from './components/TokenPanel.jsx';
import BotToggle from './components/BotToggle.jsx';
import IndexConfigPanel from './components/IndexConfigPanel.jsx';

export default function App() {
  const [tab, setTab] = useState('overview');
  const [status, setStatus] = useState(null);
  const [botStatus, setBotStatus] = useState(null);
  const [config, setConfig] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [s, b, c, t] = await Promise.allSettled([
        api.getStatus(), api.getBotStatus(), api.getConfig(), api.getTrades(),
      ]);
      if (s.status === 'fulfilled') setStatus(s.value);
      else setError('Cannot reach bot at ' + window.location.origin + '/api');
      if (b.status === 'fulfilled') setBotStatus(b.value);
      if (c.status === 'fulfilled') setConfig(c.value);
      if (t.status === 'fulfilled') setTrades(t.value || []);
      setLastRefresh(new Date());
    } catch (e) {
      setError('Connection failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const isOnline = status?.hasToken;
  const isWsConnected = status?.orderFeedConnected;
  const botEnabled = botStatus?.botEnabled;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-none">Dhan Trading Bot</h1>
              <p className="text-xs text-slate-400 mt-0.5">Automated SL/TP Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastRefresh && (
              <span className="text-xs text-slate-500 hidden sm:block">
                {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <button onClick={fetchAll} disabled={loading}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-900/40 border-b border-red-800/50 px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-5">
        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatusCard label="Bot Status" value={isOnline ? 'Online' : 'Offline'}
            icon={isOnline ? CheckCircle : XCircle} color={isOnline ? 'green' : 'red'} />
          <StatusCard label="WebSocket" value={isWsConnected ? 'Connected' : 'Disconnected'}
            icon={isWsConnected ? Wifi : WifiOff} color={isWsConnected ? 'green' : 'amber'} />
          <StatusCard label="Total Trades" value={trades.length || '0'}
            icon={BarChart3} color="blue" />
          <StatusCard label="Server" value="AWS Mumbai"
            icon={Server} color="purple" />
        </div>

        {/* Bot Toggle */}
        <div className="mb-4">
          <BotToggle botEnabled={botEnabled} onUpdate={fetchAll} />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-5 bg-slate-800 p-1 rounded-lg border border-slate-700 w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'config', label: 'Config', icon: Settings },
            { id: 'index', label: 'Index Config', icon: Target },
            { id: 'trades', label: 'Trades', icon: TrendingUp },
            { id: 'token', label: 'Token', icon: Key },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <Overview config={config} trades={trades} botEnabled={botEnabled} />}
        {tab === 'config' && <ConfigPanel config={config} onUpdate={fetchAll} />}
        {tab === 'index' && <IndexConfigPanel />}
        {tab === 'trades' && <TradesTable trades={trades} />}
        {tab === 'token' && <TokenPanel status={status} onUpdate={fetchAll} />}
      </main>

      <footer className="border-t border-slate-800 py-3 mt-8">
        <p className="text-center text-xs text-slate-600">
          Dhan Trading Bot • AWS Mumbai • Auto-refreshes every 10s
        </p>
      </footer>
    </div>
  );
}

function StatusCard({ label, value, icon: Icon, color }) {
  const colors = {
    green: 'border-green-500/30 text-green-400',
    red: 'border-red-500/30 text-red-400',
    amber: 'border-amber-500/30 text-amber-400',
    blue: 'border-blue-500/30 text-blue-400',
    purple: 'border-purple-500/30 text-purple-400',
  };
  return (
    <div className={`bg-slate-800 rounded-lg p-4 border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
        <Icon className="w-4 h-4 opacity-70" />
      </div>
      <p className="font-bold text-base">{value}</p>
    </div>
  );
}

function Overview({ config, trades, botEnabled }) {
  const failedCount = trades.filter(t => t.status === 'FAILED').length;
  const successCount = trades.filter(t => ['COMPLETE', 'PARTIAL_TP2_PLACED'].includes(t.status)).length;

  return (
    <div className="space-y-4">
      {!botEnabled && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <p className="text-amber-400 font-medium text-sm">⚠️ Bot is currently STOPPED</p>
          <p className="text-amber-300/70 text-xs mt-1">
            Toggle the switch above to re-enable automated SL/TP placement
          </p>
        </div>
      )}

      <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
        <h2 className="font-semibold mb-4 text-slate-200">Current Trading Configuration</h2>
        {config ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900 rounded-lg p-3 border border-red-500/20">
              <p className="text-xs text-slate-500 mb-1">SL Type</p>
              <p className="font-bold text-red-400">{config.slType}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 border border-red-500/20">
              <p className="text-xs text-slate-500 mb-1">SL Value</p>
              <p className="font-bold text-red-400">
                {config.slValue}{config.slType === 'PERCENT' ? '%' : config.slType === 'POINTS' ? ' pts' : ' (BB)'}
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 border border-green-500/20">
              <p className="text-xs text-slate-500 mb-1">TP Type</p>
              <p className="font-bold text-green-400">{config.tpType}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 border border-green-500/20">
              <p className="text-xs text-slate-500 mb-1">TP Value</p>
              <p className="font-bold text-green-400">
                {config.tpValue}{config.tpType === 'PERCENT' ? '%' : config.tpType === 'POINTS' ? ' pts' : ' (BB)'}
              </p>
            </div>
          </div>
        ) : <p className="text-slate-500 text-sm">Loading...</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 text-center">
          <p className="text-2xl font-bold">{trades.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total Trades</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-green-500/20 text-center">
          <p className="text-2xl font-bold text-green-400">{successCount}</p>
          <p className="text-xs text-slate-500 mt-1">Successful</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-red-500/20 text-center">
          <p className="text-2xl font-bold text-red-400">{failedCount}</p>
          <p className="text-xs text-slate-500 mt-1">Failed</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
        <h2 className="font-semibold mb-3 text-slate-200">How It Works</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { n: '1', t: 'You Buy', d: 'Place BUY in Dhan app', c: 'blue' },
            { n: '2', t: 'Bot Detects', d: 'WebSocket detects fill', c: 'purple' },
            { n: '3', t: 'Calculates', d: 'SL, TP1 & TP2 prices', c: 'amber' },
            { n: '4', t: 'Places Orders', d: 'Auto SL + TP1 + TP2', c: 'green' },
          ].map(s => (
            <div key={s.n} className="flex items-start gap-2">
              <div className={`w-6 h-6 rounded-full bg-${s.c}-500/20 border border-${s.c}-500/40 flex items-center justify-center flex-shrink-0 text-xs font-bold text-${s.c}-400`}>
                {s.n}
              </div>
              <div>
                <p className="font-medium text-sm">{s.t}</p>
                <p className="text-xs text-slate-500">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
