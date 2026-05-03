import React, { useState } from 'react';
import { Key, Eye, EyeOff, Save, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { api } from '../api.js';

export default function TokenPanel({ status, onUpdate }) {
  const [token, setToken] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const save = async () => {
    if (!token.trim()) { setMsg({ ok: false, text: 'Please paste your token' }); return; }
    setSaving(true); setMsg(null);
    try {
      await api.setToken(token.trim());
      setMsg({ ok: true, text: 'Token updated! Bot is ready to trade.' });
      setToken('');
      onUpdate();
    } catch (e) {
      setMsg({ ok: false, text: 'Failed: ' + e.message });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
        <h2 className="font-semibold mb-4">Token Status</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Access Token</p>
            <p className={`font-bold flex items-center gap-1.5 ${status?.hasToken ? 'text-green-400' : 'text-red-400'}`}>
              {status?.hasToken ? <><CheckCircle className="w-4 h-4" /> Active</> : <><AlertCircle className="w-4 h-4" /> Not Set</>}
            </p>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Order Feed</p>
            <p className={`font-bold flex items-center gap-1.5 ${status?.orderFeedConnected ? 'text-green-400' : 'text-amber-400'}`}>
              {status?.orderFeedConnected ? <><CheckCircle className="w-4 h-4" /> Connected</> : <><AlertCircle className="w-4 h-4" /> Reconnecting</>}
            </p>
          </div>
        </div>
      </div>

      {/* Update Token */}
      <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
        <h2 className="font-semibold mb-2 flex items-center gap-2">
          <Key className="w-4 h-4" /> Update Daily Token
        </h2>
        <p className="text-sm text-slate-400 mb-4">Dhan tokens expire every 24 hours. Update every morning before market opens.</p>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-blue-300 mb-2">How to get new token:</p>
          <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://web.dhan.co/index/profile" target="_blank" rel="noreferrer"
              className="text-blue-400 hover:underline inline-flex items-center gap-0.5">
              web.dhan.co/index/profile <ExternalLink className="w-3 h-3" />
            </a></li>
            <li>Click <strong>DhanHQ Trading APIs</strong></li>
            <li>Click <strong>Generate</strong> next to your app</li>
            <li>Copy the new access token</li>
            <li>Paste below and click Save</li>
          </ol>
        </div>

        <div className="relative mb-4">
          <input
            type={show ? 'text' : 'password'}
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="eyJ0eXAiOiJKV1QiLCJhbGci..."
            className="w-full px-3 py-2 pr-10 bg-slate-900 border border-slate-700 rounded text-sm font-mono focus:outline-none focus:border-blue-500"
          />
          <button onClick={() => setShow(!show)} className="absolute right-2 top-2 text-slate-400 hover:text-slate-200">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving || !token.trim()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Token'}
          </button>
          {msg && (
            <span className={`flex items-center gap-1.5 text-sm ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>
              {msg.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {msg.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
